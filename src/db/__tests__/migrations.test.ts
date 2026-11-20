import { getSchemaVersion, LATEST_VERSION, migrate, MIGRATIONS } from '@/db';
import type { Migration } from '@/db/migrations';

import { createNodeDatabase } from '../../../test-utils/node-sqlite';

const tables = async (db: ReturnType<typeof createNodeDatabase>) =>
  (
    await db.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
    )
  ).map((r) => r.name);

describe('migrations', () => {
  it('creates every table on a fresh install and sets the version', async () => {
    const db = createNodeDatabase();
    expect(await getSchemaVersion(db)).toBe(0);

    expect(await migrate(db)).toEqual([1]);

    expect(await getSchemaVersion(db)).toBe(LATEST_VERSION);
    expect(await tables(db)).toEqual([
      'assessment_sessions',
      'bookmarks',
      'classrooms',
      'media_assets',
      'option_counts',
      'question_outcomes',
      'recent_items',
      'roster_entries',
      'student_responses',
      'teacher_notes',
      'teaching_log',
    ]);
  });

  it('runs only once: a second start applies nothing', async () => {
    const db = createNodeDatabase();
    await migrate(db);
    expect(await migrate(db)).toEqual([]);
  });

  it('upgrades an existing database with only the new migration', async () => {
    const db = createNodeDatabase();
    await migrate(db);
    const next: Migration = { version: 2, name: 'test column', sql: 'ALTER TABLE classrooms ADD COLUMN medium TEXT;' };

    expect(await migrate(db, [...MIGRATIONS, next])).toEqual([2]);
    expect(await getSchemaVersion(db)).toBe(2);
  });

  it('rolls back a failing migration completely', async () => {
    const db = createNodeDatabase();
    await migrate(db);
    const broken: Migration = {
      version: 2,
      name: 'broken',
      sql: 'CREATE TABLE half_done (id TEXT); THIS IS NOT SQL;',
    };

    await expect(migrate(db, [...MIGRATIONS, broken])).rejects.toThrow();
    expect(await getSchemaVersion(db)).toBe(1);
    expect(await tables(db)).not.toContain('half_done');
  });

  it('refuses a database created by a newer app version', async () => {
    const db = createNodeDatabase();
    await db.execAsync('PRAGMA user_version = 99');
    await expect(migrate(db)).rejects.toThrow(/newer than this app supports/);
  });

  it('rejects migrations that are out of order', async () => {
    const db = createNodeDatabase();
    await expect(migrate(db, [{ ...MIGRATIONS[0], version: 2 }])).rejects.toThrow(/must have version 1/);
  });
});

describe('schema constraints', () => {
  it('blocks impossible results: correct answers cannot exceed attempts', async () => {
    const db = createNodeDatabase();
    await db.execAsync('PRAGMA foreign_keys = ON');
    await migrate(db);
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO classrooms (id, name, student_count, academic_year, created_at, updated_at) VALUES ('c1', '6-A', 30, '2026-27', ?, ?)`,
      [now, now],
    );
    await db.runAsync(
      `INSERT INTO assessment_sessions (id, classroom_id, subject_id, topic_id, assessment_id, assessment_kind, recording_mode,
        content_version, conducted_on, students_present, status, created_at, updated_at)
       VALUES ('s1', 'c1', 'science', 'sci-magnets', 'sci-magnets-as1', 'oral_quiz', 'tally', '0.1.0', '2026-11-20', 28, 'completed', ?, ?)`,
      [now, now],
    );
    await expect(
      db.runAsync(
        `INSERT INTO question_outcomes (id, session_id, question_id, question_type, difficulty, objective_ids_json, max_marks,
          attempted_count, correct_count, marks_total) VALUES ('o1', 's1', 'q', 'mcq', 'easy', '[]', 1, 10, 11, 11)`,
      ),
    ).rejects.toThrow(/CHECK constraint/);
  });

  it('blocks a session for a class that does not exist (foreign keys on)', async () => {
    const db = createNodeDatabase();
    await db.execAsync('PRAGMA foreign_keys = ON');
    await migrate(db);
    const now = new Date().toISOString();
    await expect(
      db.runAsync(
        `INSERT INTO assessment_sessions (id, classroom_id, subject_id, topic_id, assessment_id, assessment_kind, recording_mode,
          content_version, conducted_on, students_present, status, created_at, updated_at)
         VALUES ('s1', 'missing', 'science', 't', 'a', 'oral_quiz', 'tally', '0.1.0', '2026-11-20', 1, 'completed', ?, ?)`,
        [now, now],
      ),
    ).rejects.toThrow(/FOREIGN KEY/);
  });
});
