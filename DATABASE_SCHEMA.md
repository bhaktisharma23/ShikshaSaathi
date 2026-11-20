# ShikshaSaathi — Local Database Schema (SQLite)

> Status: **IMPLEMENTED in Phase 3** (migration `001-initial`).
> Engine: `expo-sqlite` (SDK 58), opened by our `DatabaseProvider` (`src/db/provider.tsx`) and accessed with `useDatabase()` / `useDbQuery()`. Repositories in `src/db/repositories/` depend only on the small `Database` interface in `src/db/types.ts`.

---

## 1. What goes in the database and what does not

| Stored in SQLite (teacher's data) | NOT stored in SQLite (bundled content) |
|---|---|
| Classes the teacher teaches | Subjects, topics, lesson plans |
| Assessment sessions and results | Questions, answer keys, explanations |
| Teacher's personal notes, bookmarks | Activities, scene animations |
| Which topics were taught when | Misconceptions, remedial suggestions |
| Media files downloaded and where they are | |

Content items are referenced from SQLite by their **stable string IDs** (e.g. `sci-magnets-q03`), not by foreign keys, because content is not stored in the database.

**Why?** Content is the same for everybody and changes with app updates. Teacher data is personal and must never be overwritten by an update.

---

## 2. Conventions

| Convention | Rule | Reason |
|---|---|---|
| Primary keys | `id TEXT` holding a UUID v4 | Unique across devices → ready for future cloud sync |
| Timestamps | `created_at`, `updated_at` as ISO-8601 UTC `TEXT` | Readable, sortable, sync-friendly |
| Soft delete | `deleted_at TEXT NULL` on user-editable tables | Sync needs to know what was deleted; allows "undo" |
| Booleans | `INTEGER` 0/1 | SQLite has no boolean type |
| JSON columns | `TEXT` with `_json` suffix, small arrays only | Snapshots of content IDs |
| Foreign keys | `PRAGMA foreign_keys = ON` at start-up | Enforce relationships |
| Journal mode | `PRAGMA journal_mode = WAL` | Faster, safer writes |
| Naming | `snake_case` tables/columns; TypeScript maps to `camelCase` in repositories | Convention |

---

## 3. Entity relationships

```
classrooms 1───* roster_entries            (optional roll list)
classrooms 1───* assessment_sessions
assessment_sessions 1───* question_outcomes  (always; analytics source)
assessment_sessions 1───* option_counts      (MCQ wrong-answer tallies)
assessment_sessions 1───* student_responses  (modes B and C only)
classrooms 1───* teaching_log
(topic_id) ───* teacher_notes, bookmarks, teaching_log, assessment_sessions  [content refs]
(topic_id) ───* media_assets                                                   [content refs]
```

---

## 4. Tables

### 4.1 `classrooms`
A class/section the teacher teaches. Not a student account.

| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | e.g. "6-A" |
| grade | INTEGER NOT NULL DEFAULT 6 | |
| section | TEXT NULL | |
| student_count | INTEGER NOT NULL CHECK (student_count BETWEEN 1 AND 200) | Total enrolled |
| academic_year | TEXT NOT NULL | e.g. "2026-27" |
| school_name | TEXT NULL | Optional |
| created_at, updated_at | TEXT NOT NULL | |
| deleted_at | TEXT NULL | |

### 4.2 `roster_entries` (optional, only if approved)
Roll numbers only. Name is optional and stays on the device.

| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| classroom_id | TEXT NOT NULL → classrooms.id ON DELETE CASCADE | |
| roll_number | INTEGER NOT NULL | |
| display_label | TEXT NULL | Optional short name/initials |
| created_at, updated_at, deleted_at | | |
| UNIQUE(classroom_id, roll_number) | | |

### 4.3 `assessment_sessions`
One time an assessment was conducted with one class.

| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| classroom_id | TEXT NOT NULL → classrooms.id | |
| subject_id | TEXT NOT NULL | content ref, e.g. `science` |
| topic_id | TEXT NOT NULL | content ref |
| assessment_id | TEXT NOT NULL | content ref |
| assessment_kind | TEXT NOT NULL CHECK IN ('oral_quiz','interactive_quiz','topic_test','worksheet') | |
| recording_mode | TEXT NOT NULL CHECK IN ('tally','roll_grid','shared_device') | |
| content_version | TEXT NOT NULL | content pack version at time of recording |
| conducted_on | TEXT NOT NULL | date (YYYY-MM-DD) |
| students_present | INTEGER NOT NULL | |
| status | TEXT NOT NULL CHECK IN ('in_progress','completed','discarded') | Only `completed` counts in analytics |
| notes | TEXT NULL | Teacher remarks |
| completed_at | TEXT NULL | |
| created_at, updated_at, deleted_at | | |

Index: `(classroom_id, topic_id, conducted_on)`.

### 4.4 `question_outcomes` — the analytics source of truth
One row per question per completed session, in every recording mode.

| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| session_id | TEXT NOT NULL → assessment_sessions.id ON DELETE CASCADE | |
| question_id | TEXT NOT NULL | content ref |
| question_type | TEXT NOT NULL | snapshot: `mcq`, `true_false`, `short_answer`, `oral`, `match` |
| difficulty | TEXT NOT NULL CHECK IN ('easy','medium','hard') | snapshot |
| objective_ids_json | TEXT NOT NULL | snapshot, e.g. `["sci-magnets-lo2"]` |
| correct_option_id | TEXT NULL | snapshot (MCQ only) |
| max_marks | REAL NOT NULL | snapshot |
| attempted_count | INTEGER NOT NULL CHECK (attempted_count >= 0) | |
| correct_count | INTEGER NOT NULL CHECK (correct_count BETWEEN 0 AND attempted_count) | |
| marks_total | REAL NOT NULL | sum of marks awarded |
| UNIQUE(session_id, question_id) | | |

### 4.5 `option_counts`
How many students chose each option of an MCQ (used for "common incorrect answers").

| Column | Type | Notes |
|---|---|---|
| session_id | TEXT NOT NULL → assessment_sessions.id ON DELETE CASCADE | |
| question_id | TEXT NOT NULL | |
| option_id | TEXT NOT NULL | content ref |
| count | INTEGER NOT NULL CHECK (count >= 0) | |
| PRIMARY KEY(session_id, question_id, option_id) | | |

### 4.6 `student_responses` (modes B and C)
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| session_id | TEXT NOT NULL → assessment_sessions.id ON DELETE CASCADE | |
| question_id | TEXT NOT NULL | |
| roll_number | INTEGER NULL | NULL = anonymous turn on shared device |
| selected_option_id | TEXT NULL | |
| is_correct | INTEGER NOT NULL (0/1) | |
| marks_awarded | REAL NOT NULL | |
| answered_at | TEXT NOT NULL | |

When a mode-B/C session is completed, a transaction recomputes `question_outcomes` and `option_counts` from these rows.

### 4.7 `teaching_log`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| classroom_id | TEXT NULL → classrooms.id | NULL = not tied to a class |
| topic_id | TEXT NOT NULL | |
| status | TEXT NOT NULL CHECK IN ('planned','taught','revisited') | |
| taught_on | TEXT NULL | date |
| notes | TEXT NULL | |
| created_at, updated_at, deleted_at | | |

### 4.8 `teacher_notes`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| topic_id | TEXT NOT NULL | |
| section_key | TEXT NULL | e.g. `introduction`, `misconceptions` |
| body | TEXT NOT NULL | |
| created_at, updated_at, deleted_at | | |

### 4.9 `bookmarks`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | |
| target_type | TEXT NOT NULL CHECK IN ('topic','activity','assessment','scene_lesson') | |
| target_id | TEXT NOT NULL | content ref |
| created_at, deleted_at | | |
| UNIQUE(target_type, target_id) | | |

### 4.10 `recent_items`
For "Continue where you left off" on Home.

| Column | Type | Notes |
|---|---|---|
| target_type | TEXT NOT NULL | |
| target_id | TEXT NOT NULL | |
| opened_at | TEXT NOT NULL | |
| PRIMARY KEY(target_type, target_id) | | |

### 4.11 `media_assets`
| Column | Type | Notes |
|---|---|---|
| id | TEXT PK | Same as content media ID |
| topic_id | TEXT NOT NULL | |
| kind | TEXT NOT NULL CHECK IN ('video','audio','image') | |
| availability | TEXT NOT NULL CHECK IN ('bundled','downloaded','not_downloaded','unavailable') | |
| local_uri | TEXT NULL | |
| remote_url | TEXT NULL | |
| size_bytes | INTEGER NULL | |
| checksum_sha256 | TEXT NULL | Verify after download |
| downloaded_at | TEXT NULL | |
| updated_at | TEXT NOT NULL | |

### 4.12 Settings
Stored with `expo-sqlite/kv-store` (key → value), not a custom table:
`ui.language` (`en`/`hi`), `narration.enabled`, `narration.voiceId`, `narration.rate`, `ui.textScale`, `onboarding.completed`, `content.acceptedSampleNotice`.

---

## 5. Migrations

- Each migration is a numbered file in `src/db/migrations/` exporting `{ version, up(db) }`.
- On start-up (`SQLiteProvider` `onInit`), `migrate.ts` reads `PRAGMA user_version`, runs every newer migration **in order, inside a transaction**, then sets `PRAGMA user_version = N`. This is the approach shown in the SDK 58 `expo-sqlite` docs.
- Migrations are **append-only**: never edit a migration that has shipped.
- `001_initial` creates all tables above.

---

## 6. Typical queries (examples)

**Topic accuracy for a class (latest content version):**
```sql
SELECT qo.question_id,
       SUM(qo.attempted_count) AS attempted,
       SUM(qo.correct_count)   AS correct
FROM question_outcomes qo
JOIN assessment_sessions s ON s.id = qo.session_id
WHERE s.classroom_id = ? AND s.topic_id = ?
  AND s.status = 'completed' AND s.deleted_at IS NULL
GROUP BY qo.question_id;
```
Raw sums come out of SQL; **percentages and thresholds are computed in `src/domain/analytics`** so they are unit-tested in one place.

**Common wrong answers:**
```sql
SELECT oc.question_id, oc.option_id, SUM(oc.count) AS chosen
FROM option_counts oc
JOIN assessment_sessions s ON s.id = oc.session_id
WHERE s.classroom_id = ? AND s.topic_id = ? AND s.status = 'completed' AND s.deleted_at IS NULL
GROUP BY oc.question_id, oc.option_id;
```

---

## 7. Future cloud sync (not built in MVP)

Ready because of: UUID keys, `updated_at` on every row, soft deletes, content referenced by stable IDs. A future version could add a `sync_state` table (last sync time, device ID) and push rows where `updated_at > last_sync`. `expo-sqlite` also exposes SQLite session/changeset support (`createSessionAsync`), which could be evaluated then.

---

## 8. Backup and restore

Export: read all non-deleted rows → one JSON file `shikshasaathi-backup-<date>.json` (with schema version) → share via the Android share sheet. Import: validate version → insert in a transaction, skipping IDs that already exist.
