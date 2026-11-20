/**
 * Migration 1: creates every table described in DATABASE_SCHEMA.md.
 *
 * NEVER edit this file after it has shipped to teachers' phones — their database has
 * already run it. Changes go in a new migration (002-…) instead.
 */
import type { Migration } from './index';

export const migration001: Migration = {
  version: 1,
  name: 'initial schema',
  sql: `
CREATE TABLE classrooms (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  grade INTEGER NOT NULL DEFAULT 6,
  section TEXT,
  student_count INTEGER NOT NULL CHECK (student_count BETWEEN 1 AND 200),
  academic_year TEXT NOT NULL,
  school_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE roster_entries (
  id TEXT PRIMARY KEY NOT NULL,
  classroom_id TEXT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  roll_number INTEGER NOT NULL CHECK (roll_number > 0),
  display_label TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE (classroom_id, roll_number)
);

CREATE TABLE assessment_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  classroom_id TEXT NOT NULL REFERENCES classrooms(id),
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  assessment_kind TEXT NOT NULL CHECK (assessment_kind IN ('oral_quiz','interactive_quiz','topic_test','worksheet')),
  recording_mode TEXT NOT NULL CHECK (recording_mode IN ('tally','roll_grid','shared_device')),
  content_version TEXT NOT NULL,
  conducted_on TEXT NOT NULL,
  students_present INTEGER NOT NULL CHECK (students_present >= 0),
  status TEXT NOT NULL CHECK (status IN ('in_progress','completed','discarded')),
  notes TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX idx_sessions_class_topic ON assessment_sessions (classroom_id, topic_id, conducted_on);

CREATE TABLE question_outcomes (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy','medium','hard')),
  objective_ids_json TEXT NOT NULL,
  correct_option_id TEXT,
  max_marks REAL NOT NULL,
  attempted_count INTEGER NOT NULL CHECK (attempted_count >= 0),
  correct_count INTEGER NOT NULL CHECK (correct_count >= 0 AND correct_count <= attempted_count),
  marks_total REAL NOT NULL,
  UNIQUE (session_id, question_id)
);

CREATE TABLE option_counts (
  session_id TEXT NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0),
  PRIMARY KEY (session_id, question_id, option_id)
);

CREATE TABLE student_responses (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  roll_number INTEGER,
  selected_option_id TEXT,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0, 1)),
  marks_awarded REAL NOT NULL,
  answered_at TEXT NOT NULL
);
CREATE INDEX idx_responses_session ON student_responses (session_id, question_id);

CREATE TABLE teaching_log (
  id TEXT PRIMARY KEY NOT NULL,
  classroom_id TEXT REFERENCES classrooms(id),
  topic_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned','taught','revisited')),
  taught_on TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX idx_teaching_log_topic ON teaching_log (topic_id);

CREATE TABLE teacher_notes (
  id TEXT PRIMARY KEY NOT NULL,
  topic_id TEXT NOT NULL,
  section_key TEXT,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX idx_notes_topic ON teacher_notes (topic_id);

CREATE TABLE bookmarks (
  id TEXT PRIMARY KEY NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('topic','activity','assessment','scene_lesson')),
  target_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  UNIQUE (target_type, target_id)
);

CREATE TABLE recent_items (
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  PRIMARY KEY (target_type, target_id)
);

CREATE TABLE media_assets (
  id TEXT PRIMARY KEY NOT NULL,
  topic_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('video','audio','image')),
  availability TEXT NOT NULL CHECK (availability IN ('bundled','downloaded','not_downloaded','unavailable')),
  local_uri TEXT,
  remote_url TEXT,
  size_bytes INTEGER,
  checksum_sha256 TEXT,
  downloaded_at TEXT,
  updated_at TEXT NOT NULL
);
`,
};
