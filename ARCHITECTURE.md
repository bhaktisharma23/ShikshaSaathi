# ShikshaSaathi — Application Architecture

> Status: **PROPOSED — awaiting approval.** No application features have been built yet.
> Last updated: 2026-11-20

Related documents: [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) · [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) · [CONTENT_STRUCTURE.md](CONTENT_STRUCTURE.md)

---

## 1. Current project state (inspected)

| Item | Finding | What it means for us |
|---|---|---|
| Expo SDK | `expo ~58.0.26`, React Native `0.88.1`, React `19.3.0` | All APIs below were checked against the **v58** docs, not memory. |
| Router | `expo-router ~58.0.32`, entry `expo-router/entry`, `typedRoutes` + `reactCompiler` enabled | Keep both. Typed routes catch broken links at compile time. |
| Navigation | `src/app/_layout.tsx` → `NativeTabs` (Home, Explore) from the starter template | Template screens will be replaced in Phase 1. |
| Animation | `react-native-reanimated 4.7.1` + `react-native-worklets` already installed | No extra install needed for animation. |
| Not yet installed | `expo-sqlite`, `expo-video`, `expo-speech`, `expo-audio`, `expo-screen-orientation`, `react-native-svg` | Installed phase by phase with `npx expo install`. |
| `expo-file-system` | Present in `node_modules` only as a transitive dependency, not in `package.json` | Must be installed explicitly before we import it. |
| `app.json` | `orientation: "portrait"`, splash/icon colours from template (`#208AEF`, `#E6F4FE`), `web.output: "server"` | Orientation must change for landscape presentation mode (see §9). Branding updated in Phase 1. |
| Path aliases | `@/*` → `src/*`, `@/assets/*` → `assets/*` | We use these everywhere. |
| TypeScript | `strict: true`, TS ~6.0 | Good. Stays strict. |
| Tests | None configured | Set up in Phase 1. |
| Native folders | No `ios/` or `android/` | Continuous Native Generation: never hand-edit native code; configure via `app.json`. |

---

## 2. Architecture at a glance

ShikshaSaathi is built from **four layers**. Each layer only talks to the one below it.

```
┌──────────────────────────────────────────────────────────────┐
│  SCREENS  (src/app/**)  — Expo Router routes, very thin       │
│  "What does the teacher see on this page?"                    │
├──────────────────────────────────────────────────────────────┤
│  FEATURES (src/features/**) — feature components + hooks      │
│  preparation · studio · activities · assessment · insights    │
├──────────────────────────────────────────────────────────────┤
│  DOMAIN  (src/domain/**) — pure TypeScript, no React, no I/O  │
│  scoring, learning-gap detection, distractor analysis         │
├───────────────────────────┬──────────────────────────────────┤
│  CONTENT (src/content/**) │  DATA (src/db/**, src/services/**)│
│  Read-only lesson data    │  SQLite: teacher's own records    │
│  (JSON, bundled in app)   │  FileSystem: downloaded media     │
└───────────────────────────┴──────────────────────────────────┘
```

**Why this split? (beginner explanation)**

- **Content and teacher data are separate things.** Lesson plans, quizzes and animations are *the same for every teacher*. They ship inside the app as data files. Assessment results, classes and notes *belong to one teacher*. They live in SQLite on the phone. Keeping them apart means we can fix a typo in a lesson without touching anyone's saved results, and we can later sync teacher data to a cloud without uploading the whole curriculum.
- **Screens stay thin.** A screen file only arranges components. All logic lives in features or domain code, which is easier to test and reuse.
- **Domain code is "pure".** Analytics functions take plain arrays and return numbers. They never read the database themselves, so we can unit-test them with hand-written data and *prove* the numbers are correct. That is how we guarantee "no fabricated analytics".

---

## 3. Module breakdown

| Module | Responsibility | Main inputs | Main outputs |
|---|---|---|---|
| **Content** | Load, validate and look up subjects, topics, scenes, activities and questions | Bundled JSON files | Typed objects (`Topic`, `Scene`, `Question`…) |
| **Preparation Centre** | Show the teacher's lesson plan for a topic; personal notes; mark topic as taught | Content + `teacher_notes`, `teaching_log` tables | Read-only screens + notes |
| **Visual Teaching Studio** | Play scene-based animated explanations with captions and narration; full-screen presentation; play real videos when they exist | `scenes` content, media registry | Animated stage, captions, controls |
| **Activity Centre** | Run classroom activities: oral prompts, group tasks, matching, quizzes, puzzles, demos, shared-device turns | `activities` content | Interactive activity screens (results optional, not graded) |
| **Assessment Centre** | Run oral quizzes, interactive quizzes, topic tests, worksheets; answer keys; **record results** | `assessments` content + `classrooms` | Rows in `assessment_sessions`, `question_outcomes`, `option_counts`, `student_responses` |
| **Insights** | Compute topic performance, class averages, common wrong answers, learning gaps, history, remedial suggestions | SQLite results + content (misconceptions, remedial tips) | Dashboard screens; "Not enough data yet" states |
| **Classes** | Teacher creates their classes (e.g. "6-A, 38 students") | Teacher input | `classrooms` (+ optional roll list) |
| **Media service** | Know which media files exist, where, and how big; download/delete optional packs | `media_assets` table + file system | Local URIs, or "not available" |
| **Settings** | Language, narration voice, text size, storage, about/disclaimer | `expo-sqlite/kv-store` | Preferences |

---

## 4. Screen navigation

### 4.1 Tab structure

Four bottom tabs, each with its own stack, so the back button always behaves predictably:

| Tab | Icon + label (EN / HI) | Purpose |
|---|---|---|
| **Teach** | book · "Teach / पढ़ाएँ" | Subjects → topics → everything about a topic. The home tab. |
| **Classes** | people · "Classes / कक्षाएँ" | The teacher's classes and their assessment history. |
| **Insights** | chart · "Insights / जानकारी" | Analytics from recorded results. |
| **More** | settings · "More / अधिक" | Language, narration, storage, about content, help. |

### 4.2 Navigation map

```
Teach tab
 ├─ Home ─────────────── subjects grid + "Continue: <last topic>" + "Recently taught"
 │   └─ Subject ──────── topic list for one subject (with verification badge)
 │       └─ Topic Hub ── overview card + 4 large buttons:
 │            ├─ Prepare ──────── lesson plan sections (collapsible) + my notes
 │            ├─ Teach Visually ─ list of scene lessons / videos
 │            │    └─ ▶ Presentation (full-screen, landscape, outside tabs)
 │            ├─ Activities ───── activity list
 │            │    └─ ▶ Activity Runner (full-screen, outside tabs)
 │            └─ Assess ───────── assessment list (oral / quiz / test / worksheet)
 │                 ├─ Answer Key / Worksheet view
 │                 └─ ▶ Start Assessment → pick class → run → record → Summary
 │
Classes tab
 ├─ Class list ── empty state: "Add your first class"
 │   ├─ Add / edit class
 │   └─ Class detail ── assessment history for that class
 │        └─ Session detail (what was recorded, editable for 24 h — see decisions)
 │
Insights tab
 ├─ Overview ── per-class picker; topics with data; "Not enough data yet" if none
 │   ├─ Topic insight ── accuracy per question, common wrong answers,
 │   │                    learning gaps, remedial suggestions
 │   └─ Session insight
 │
More tab
 └─ Settings · Language · Narration voice · Text size · Storage & downloads ·
    About the content (verification status, sources) · Backup / export · Help
```

**Three-tap rule:** Home → Subject (1) → Topic (2). Recently used topics are 1 tap from Home. Every topic section is 3 taps.

### 4.3 Route files (Expo Router)

```
src/app/
├─ _layout.tsx                      Root: providers (SQLite, theme, i18n) + root Stack
├─ (tabs)/
│  ├─ _layout.tsx                   NativeTabs: teach, classes, insights, more
│  ├─ (teach)/
│  │  ├─ _layout.tsx                Stack for the Teach tab
│  │  ├─ index.tsx                  Home (subjects)
│  │  ├─ subject/[subjectId].tsx
│  │  └─ topic/[topicId]/
│  │     ├─ index.tsx               Topic Hub
│  │     ├─ prepare.tsx
│  │     ├─ visuals.tsx
│  │     ├─ activities.tsx
│  │     ├─ assess.tsx
│  │     └─ answer-key/[assessmentId].tsx
│  ├─ classes/
│  │  ├─ _layout.tsx
│  │  ├─ index.tsx
│  │  ├─ edit.tsx                   (?id= for edit, none for new)
│  │  ├─ [classId].tsx
│  │  └─ session/[sessionId].tsx
│  ├─ insights/
│  │  ├─ _layout.tsx
│  │  ├─ index.tsx
│  │  └─ topic/[topicId].tsx
│  └─ more/
│     ├─ _layout.tsx
│     ├─ index.tsx
│     ├─ storage.tsx
│     └─ about-content.tsx
├─ present/[sceneLessonId].tsx      Full-screen presentation (landscape)
├─ video/[mediaId].tsx              Full-screen video (only if file exists)
├─ activity/[activityId].tsx        Full-screen activity runner
└─ assessment/
   ├─ start/[assessmentId].tsx      Choose class, date, students present, recording mode
   ├─ run/[sessionId].tsx           Quiz / oral / test runner
   ├─ record/[sessionId].tsx        Enter results (tally or roll-number grid)
   └─ summary/[sessionId].tsx       What was saved + immediate feedback
```

Classroom-mode screens (`present`, `activity`, `assessment/*`) sit **outside the tabs** so they can be full screen, hide the tab bar and rotate to landscape without affecting the rest of the app.

---

## 5. Application folder structure

```
ShikshaSaathi/
├─ app.json, package.json, tsconfig.json, AGENTS.md
├─ ARCHITECTURE.md, DEVELOPMENT_PLAN.md, DATABASE_SCHEMA.md, CONTENT_STRUCTURE.md
├─ assets/
│  ├─ images/            app icon, splash, subject illustrations (WebP/PNG)
│  ├─ fonts/             Noto Sans + Noto Sans Devanagari (if approved)
│  └─ media/             small bundled narration audio / video ONLY if real files exist
├─ scripts/
│  └─ validate-content.ts   checks every content file against the schema
├─ src/
│  ├─ app/               ROUTES ONLY (see §4.3)
│  ├─ components/
│  │  └─ ui/             Design-system primitives (Button, Card, Text, Screen,
│  │                     EmptyState, ErrorState, Badge, ListRow, Segmented,
│  │                     Stepper, ProgressBar, IconButton, Sheet, Toast)
│  ├─ features/
│  │  ├─ preparation/    components/ (SectionCard, StepList, MisconceptionCard…) hooks/
│  │  ├─ studio/         engine/ (timeline, scene renderer), components/ (Stage,
│  │  │                  CaptionBar, PlaybackControls, VideoPlayer), hooks/
│  │  ├─ activities/     renderers/ (one per activity type), components/, hooks/
│  │  ├─ assessment/     runners/, recorders/ (TallyEntry, RollGrid), components/, hooks/
│  │  ├─ insights/       components/ (StatTile, AccuracyBar, GapList, NotEnoughData), hooks/
│  │  └─ classes/        components/, hooks/
│  ├─ content/
│  │  ├─ schema/         zod schemas → TypeScript types (single source of truth)
│  │  ├─ data/           subjects/<subject>/<topic>/*.json  (see CONTENT_STRUCTURE.md)
│  │  ├─ registry.ts     static import map (Metro needs static imports)
│  │  └─ repository.ts   getSubjects(), getTopic(id), getQuestion(id)…
│  ├─ db/
│  │  ├─ provider.tsx    <SQLiteProvider> wrapper + onInit
│  │  ├─ migrations/     001_initial.ts, 002_….ts
│  │  ├─ migrate.ts      PRAGMA user_version runner
│  │  └─ repositories/   classrooms.ts, sessions.ts, outcomes.ts, notes.ts, media.ts
│  ├─ domain/
│  │  ├─ analytics/      scoring.ts, gaps.ts, distractors.ts, thresholds.ts (+ tests)
│  │  └─ ids.ts          UUID helper
│  ├─ services/
│  │  ├─ media/          mediaStore.ts (expo-file-system), availability checks
│  │  ├─ narration/      tts.ts (expo-speech), audio.ts (expo-audio)
│  │  ├─ settings/       kv-store wrapper
│  │  └─ backup/         export/import teacher data as JSON
│  ├─ i18n/              en.ts, hi.ts UI strings + useT() hook
│  ├─ hooks/             shared hooks (useColorScheme etc. — kept from template)
│  └─ constants/         theme.ts (design tokens), layout.ts
└─ __tests__/ or colocated *.test.ts
```

**Rule of thumb:** if a file is not a screen, it does not go in `src/app/`.

---

## 6. Offline architecture

The app must work in a classroom with **no internet**, forever, after install.

| Data | Where it lives | Available offline? | How |
|---|---|---|---|
| UI, code, design | App bundle (APK) | Always | — |
| Lesson content (10 topics) | JSON in app bundle | Always | Imported statically; no network fetch |
| Scene animations | JSON + SVG drawn in code | Always | Rendered on device, no video file needed |
| Narration (TTS) | Device text-to-speech engine | Usually | `expo-speech`; depends on voices installed on the phone (see risks) |
| Recorded narration / videos | Bundled (small) or downloaded once to `Paths.document/media/` | After download | `expo-file-system` `File.downloadFileAsync` |
| Teacher's classes, results, notes | SQLite file on device | Always | `expo-sqlite` |
| Settings | SQLite kv-store | Always | `expo-sqlite/kv-store` |

**Network is never on the critical path.** The only network feature in the MVP is the *optional* download of extra media packs from Storage settings, and only if we actually have such media. If we don't, that screen says so plainly.

**Cloud-sync readiness (not built now):** every SQLite row gets a UUID primary key, `created_at`, `updated_at` and `deleted_at` (soft delete). These four columns are what a future sync engine needs to merge data from many devices. Content items have stable string IDs and a `contentVersion`, so results remain meaningful after content updates. No backend, no login.

---

## 7. Reusable component strategy

1. **Design tokens first** (`src/constants/theme.ts`): colours, spacing, radius, type scale, minimum touch size (48 dp). Components never use raw hex values.
2. **UI primitives** (`src/components/ui/`): generic, content-agnostic, fully typed props. Example: `<Button variant="primary" size="large" icon="play" label={t('start')} />`.
3. **Feature components** compose primitives and know about one feature's types (e.g. `MisconceptionCard` takes a `Misconception`).
4. **Content renderers by type**: activities and questions are rendered through a lookup table, `renderers[activity.type]`. Adding a new activity type means adding one schema + one renderer, never editing every screen.
5. **State components are mandatory**: every list/screen uses `EmptyState`, `ErrorState` and `Loading` from the UI kit so teachers always get a helpful message, never a blank screen.

### Proposed visual direction

Warm and calm, inspired by paper notebooks and chalkboards, with no gradients or neon.

| Token | Value (proposal) | Use |
|---|---|---|
| `paper` | `#FBF7F0` | App background (warm off-white, readable in sunlight) |
| `ink` | `#2A2522` | Primary text |
| `inkMuted` | `#6B625B` | Secondary text |
| `primary` | `#1F6F5C` (deep teal-green) | Main actions, active tab |
| `accent` | `#D9822B` (saffron) | Highlights, "Start class" |
| `surface` | `#FFFFFF` | Cards |
| `line` | `#E7DFD3` | Borders |
| Subject colours | Maths `#3B6EA5` · Science `#2E8B57` · English `#8A4F9E` · Hindi `#B85A2A` · SS `#9A7424` | Subject chips and icons only |
| `success` / `danger` | `#2E7D4F` / `#B3412E` | Correct / incorrect (always paired with an icon, never colour alone) |

Typography: Noto Sans + Noto Sans Devanagari (same visual family for English and Hindi), body ≥ 16 sp, respects the phone's font-size setting. All colour pairs checked for WCAG AA contrast (4.5:1).

---

## 8. Visual Teaching Studio — how animation works

We **do not** depend on video files for explanations. Instead, each explanation is a *scene lesson* described in JSON and drawn live on the device.

```
SceneLesson
 └─ scenes[]                 e.g. "A pizza cut into 4 equal parts"
     ├─ elements[]           shapes, text labels, images (SVG primitives)
     ├─ steps[]              timeline: appear, move, highlight, split, colour, label
     └─ captions[]           one caption per step, in EN and HI
```

- **Renderer:** `react-native-svg` draws elements; **Reanimated** animates them on the UI thread (smooth even on low-end phones).
- **Controls:** play / pause / replay scene / previous step / next step. Teachers can go step-by-step to match the pace of the class.
- **Captions:** large text bar, always on by default.
- **Narration:** text-to-speech via `expo-speech` reading the caption (language-aware). If a real recorded audio file exists, `expo-audio` plays it instead.
- **Full-screen presentation:** separate route, landscape, keeps screen awake, large controls.
- **Video playback:** `expo-video` (`useVideoPlayer` + `VideoView`) is used **only** when a real video file is registered in `media_assets`. Otherwise no video button is shown.
- **Lottie:** *deferred.* The SDK 58 Lottie docs page was not reachable during inspection, so compatibility is unverified. The scene engine covers our needs without it. We revisit if a specific animation needs it.

**Why scenes instead of videos?** Videos are large (bad for APK size and rural data), can't be paused at a teaching step, can't be translated without re-recording, and we don't have real ones. Scenes are tiny, bilingual, step-controllable and fully offline.

---

## 9. Assessment calculation strategy

### 9.1 Recording modes (teacher chooses per session)

| Mode | Best for | What the teacher enters | Effort |
|---|---|---|---|
| **A. Quick tally** | Oral quiz to whole class, show of hands | Per question: how many answered, how many correct; for MCQs, optionally how many chose each wrong option | Low |
| **B. Roll-number grid** | Written test / worksheet | Tap ✓ / ✗ (or select option) per roll number per question | Medium |
| **C. Shared-device quiz** | Students take turns on the phone | Each turn auto-records the selected option (roll number optional) | Automatic |

No student names are required. Roll numbers are just numbers.

### 9.2 Single source for analytics

Whatever the mode, every completed session writes **one `question_outcomes` row per question** (attempted, correct, marks). Modes B and C also keep detailed `student_responses`, and the outcome rows are computed from them. Analytics read `question_outcomes` (+ `option_counts`). This keeps the maths identical across modes.

### 9.3 Formulas (implemented as pure functions in `src/domain/analytics/`)

| Metric | Formula | Shown only when |
|---|---|---|
| Question accuracy | `correct ÷ attempted` | `attempted ≥ 5` |
| Session score (mode A) | `Σ correct ÷ Σ attempted` across questions | ≥ 1 question with data |
| Session class average (modes B/C) | mean over students of `marks_awarded ÷ max_marks` | ≥ 5 students |
| Topic performance | attempted-weighted mean of question accuracy across all sessions of that topic for a class (latest content version) | ≥ 10 total attempts |
| Common incorrect answer | a wrong option chosen by `≥ 25 %` of attempts on that question | `attempted ≥ 8` and option counts recorded |
| Learning gap | a learning objective whose linked questions have weighted accuracy `< 60 %` | ≥ 10 attempts across ≥ 2 questions for that objective |
| Trend | change in topic performance between first and latest session | ≥ 2 sessions |
| Remedial recommendation | look up the objective's / distractor's `misconceptionId` → `remedial` text from **content** | a gap or common wrong answer exists |

All thresholds live in one file (`thresholds.ts`) so they can be tuned. When a threshold is not met, the UI shows **"Not enough data yet — record N more responses"** instead of a number. Recommendations always come from authored content, never invented text.

### 9.4 Protecting results when content changes

Each `question_outcomes` row **snapshots** the question's correct option, max marks, difficulty and objective IDs at the time of recording, plus the `content_version`. If a question is later edited, old results still make sense.

---

## 10. Media storage strategy

| Media type | Source | Storage | Size budget |
|---|---|---|---|
| Scene animations | JSON + code | Bundle | ~5–30 KB per topic |
| Illustrations | Original or openly-licensed images, WebP | `assets/images/` | ≤ 150 KB each, ≤ 2 MB total in MVP |
| Recorded narration (optional) | Real recordings only | Bundle (if small) or download | ≤ 1 MB per topic |
| Videos (optional) | Real, licensed videos only | Downloaded to `Paths.document/media/<topicId>/` | Shown with size before download |

- Every media item is registered in the `media_assets` table with `availability` (`bundled` / `downloaded` / `not_downloaded` / `unavailable`), size and checksum.
- The UI asks the media service "is this available?" before showing any play button. **No placeholder videos, no "coming soon" players pretending to work.**
- Storage screen shows space used and allows deleting downloaded media. Uses `expo-file-system` (`File`, `Directory`, `Paths`) — the new object API, which is the default in SDK 58 (the old one is at `expo-file-system/legacy`; we won't use it).
- Licensing: every media item records its source and licence in content metadata.

---

## 11. Testing strategy

| Level | Tool | What we test | When |
|---|---|---|---|
| Type safety | `npx tsc --noEmit` | Whole codebase | Every phase, before "done" |
| Lint | `npx expo lint` | Code style, hooks rules | Every phase |
| Content validation | `scripts/validate-content.ts` (zod) | Every JSON file matches schema; IDs unique; every question's answer exists; every misconception reference resolves; no topic marked `published` without verification | Every content change |
| Unit tests | `jest-expo` | `domain/analytics/*` with hand-computed fixtures, thresholds, migration ordering, timeline engine | Every phase |
| Component tests | `@testing-library/react-native` | UI primitives, empty/error states, recorders (tally entry sums correctly) | Phases 1, 7, 8 |
| Database checks | Dev-only "Self-test" screen | Migrations run on a fresh DB and on an upgraded DB; repository round-trips | Phase 3 onward |
| Manual device tests | Real low-end Android phone (2–3 GB RAM) | Checklist per phase: offline mode (airplane), font scaling, Hindi rendering, landscape presentation, back button | End of every phase |
| Teacher feedback | 2–3 real teachers | Can they reach a topic and record a quiz without help? | Before release |

Each phase in DEVELOPMENT_PLAN.md ends with a written test checklist.

---

## 12. Libraries (proposed, all installed with `npx expo install`)

| Library | Why | Expo Go? | Phase |
|---|---|---|---|
| `expo-sqlite` | Local database, migrations, kv-store | Yes | 3 |
| `expo-file-system` | Media files, backup export | Yes | 3/9 |
| `react-native-svg` | Drawing scene elements | Yes (to re-check at install) | 5 |
| `expo-speech` | Text-to-speech narration | Yes | 5 |
| `expo-audio` | Recorded narration (replaces old expo-av) | Yes | 5 |
| `expo-video` | Real video playback | Yes | 5 |
| `expo-screen-orientation` | Landscape presentation mode | Yes | 5 |
| `expo-keep-awake` | Screen stays on during presentation | To verify | 5 |
| `zod` | Content schema + validation (pure JS) | n/a | 2 |
| `jest-expo`, `@testing-library/react-native` | Tests (dev only) | n/a | 1 |
| `expo-print` + `expo-sharing` | Worksheet PDF export (if approved) | To verify | 7 |
| `lottie-react-native` | **Deferred** — unverified for SDK 58 | Unknown | — |

**Deliberately not used:** Redux/Zustand (React state + SQLite is enough), an ORM such as Drizzle (plain SQL in small repository files is easier to learn and debug; can be added later), any backend or auth.

Keeping everything Expo Go-compatible lets you test on your phone by scanning a QR code until we need a development build.

---

## 13. Technical risks and solutions

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| 1 | **Curriculum mismatch** — provisional topic names may not match current NCERT/CBSE Class 6 books | Wrong content for teachers | Verification workflow in CONTENT_STRUCTURE.md; unverified topics show a visible "Sample — not yet verified" badge; validation script blocks `published` without verification |
| 2 | **Hindi TTS voice missing** on many phones | Narration silent in Hindi | Check `Speech.getAvailableVoicesAsync()` at runtime; if no `hi` voice, hide Hindi narration and show "Install Hindi voice in phone settings" with steps; captions still work |
| 3 | **Low-end Android performance** | Janky animations | Reanimated UI-thread animation, ≤ 30 elements per scene, no shadows/blur, test on a cheap device each phase, step-mode fallback |
| 4 | **Teacher data loss** (phone lost/reset) | Results gone — no cloud | Backup/export to a JSON file shared via WhatsApp/Drive (Phase 9); import restores it |
| 5 | **App size** | Hard to install on slow data | No bundled video; WebP images; budget ≤ 40 MB APK; media packs optional |
| 6 | **Orientation**: `app.json` currently `portrait` | Presentation can't go landscape | Change to `default` and lock portrait per screen, landscape only in classroom routes (verify behaviour on device in Phase 5) |
| 7 | **Wrong analytics from tiny samples** | Misleading insights | Minimum-sample thresholds + "Not enough data" states; unit tests with fixtures |
| 8 | **Content edits break old results** | Mismatched history | Snapshots + `content_version` in outcomes |
| 9 | **Copyright** of textbook text/images | Legal | Write original explanations aligned to learning outcomes; never copy textbook passages, exercises or illustrations; record licence per media item |
| 10 | **Expo API drift** | Code from memory breaks | Check v58 docs before each module (as done here) |
| 11 | **Typing results takes too long in class** | Teachers skip recording | Quick-tally mode with +/- steppers; record later from a paper tally |
| 12 | **Devanagari rendering** inconsistencies | Broken Hindi text | Bundle Noto Sans Devanagari; test conjuncts (क्ष, त्र, ज्ञ) on device |

---

## 14. Decisions requiring approval

See the summary in the chat reply. They are also tracked in DEVELOPMENT_PLAN.md §0.
