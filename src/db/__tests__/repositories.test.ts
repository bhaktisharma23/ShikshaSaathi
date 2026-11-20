import { bookmarks, classrooms, migrate, notes, recent, teachingLog, type Database } from '@/db';

import { createNodeDatabase } from '../../../test-utils/node-sqlite';

let db: Database;

beforeEach(async () => {
  db = createNodeDatabase();
  await db.execAsync('PRAGMA foreign_keys = ON');
  await migrate(db);
});

describe('classrooms', () => {
  const input = { name: ' 6-A ', studentCount: 38, academicYear: '2026-27', schoolName: '  ' };

  it('creates a class with trimmed values and a UUID', async () => {
    const created = await classrooms.createClassroom(db, input);
    expect(created).toMatchObject({ name: '6-A', studentCount: 38, academicYear: '2026-27', schoolName: null, grade: 6 });
    expect(created.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(await classrooms.listClassrooms(db)).toHaveLength(1);
  });

  it('rejects invalid input before touching the database', async () => {
    await expect(classrooms.createClassroom(db, { ...input, name: '' })).rejects.toThrow(/name:required/);
    await expect(classrooms.createClassroom(db, { ...input, studentCount: 0 })).rejects.toThrow(/studentCount/);
    expect(await classrooms.listClassrooms(db)).toHaveLength(0);
  });

  it('updates a class', async () => {
    const created = await classrooms.createClassroom(db, input);
    const updated = await classrooms.updateClassroom(db, created.id, { ...input, name: '6-B', studentCount: 40 });
    expect(updated).toMatchObject({ id: created.id, name: '6-B', studentCount: 40 });
  });

  it('sorts newest academic year first, then by name', async () => {
    await classrooms.createClassroom(db, { ...input, name: '6-B' });
    await classrooms.createClassroom(db, { ...input, name: '6-A' });
    await classrooms.createClassroom(db, { ...input, name: '6-C', academicYear: '2025-26' });
    expect((await classrooms.listClassrooms(db)).map((c) => c.name)).toEqual(['6-A', '6-B', '6-C']);
  });

  it('soft-deletes and restores', async () => {
    const created = await classrooms.createClassroom(db, input);
    await classrooms.deleteClassroom(db, created.id);
    expect(await classrooms.listClassrooms(db)).toHaveLength(0);
    expect(await classrooms.getClassroom(db, created.id)).toBeNull();

    await classrooms.restoreClassroom(db, created.id);
    expect(await classrooms.getClassroom(db, created.id)).not.toBeNull();
  });

  it('counts only completed sessions', async () => {
    const created = await classrooms.createClassroom(db, input);
    expect(await classrooms.countCompletedSessions(db, created.id)).toBe(0);
  });
});

describe('recent items', () => {
  it('keeps the most recently opened first, without duplicates', async () => {
    await recent.recordOpened(db, 'topic', 'a');
    await new Promise((r) => setTimeout(r, 5));
    await recent.recordOpened(db, 'topic', 'b');
    await new Promise((r) => setTimeout(r, 5));
    await recent.recordOpened(db, 'topic', 'a');
    expect((await recent.listRecent(db, 'topic')).map((i) => i.targetId)).toEqual(['a', 'b']);
  });
});

describe('notes', () => {
  it('adds, updates, lists and deletes notes', async () => {
    const id = await notes.addNote(db, 'sci-magnets', '  Bring extra pins  ', 'materials');
    await notes.addNote(db, 'other-topic', 'Not mine');
    await notes.updateNote(db, id, 'Bring 2 boxes of pins');
    expect(await notes.listNotes(db, 'sci-magnets')).toEqual([
      expect.objectContaining({ id, body: 'Bring 2 boxes of pins', sectionKey: 'materials' }),
    ]);
    await notes.deleteNote(db, id);
    expect(await notes.listNotes(db, 'sci-magnets')).toEqual([]);
  });

  it('refuses empty notes', async () => {
    await expect(notes.addNote(db, 't', '   ')).rejects.toThrow(/empty/);
  });
});

describe('bookmarks', () => {
  it('toggles on and off and on again', async () => {
    expect(await bookmarks.toggleBookmark(db, 'topic', 'sci-magnets')).toBe(true);
    expect(await bookmarks.isBookmarked(db, 'topic', 'sci-magnets')).toBe(true);
    expect(await bookmarks.toggleBookmark(db, 'topic', 'sci-magnets')).toBe(false);
    expect(await bookmarks.listBookmarks(db, 'topic')).toEqual([]);
    expect(await bookmarks.toggleBookmark(db, 'topic', 'sci-magnets')).toBe(true);
    expect(await bookmarks.listBookmarks(db, 'topic')).toEqual(['sci-magnets']);
  });
});

describe('teaching log', () => {
  it('records when a topic was taught to a class', async () => {
    const klass = await classrooms.createClassroom(db, { name: '6-A', studentCount: 30, academicYear: '2026-27' });
    await teachingLog.logTeaching(db, { topicId: 'sci-magnets', status: 'taught', classroomId: klass.id, taughtOn: '2026-11-18' });
    expect(await teachingLog.listTeachingLog(db, 'sci-magnets')).toEqual([
      expect.objectContaining({ classroomId: klass.id, status: 'taught', taughtOn: '2026-11-18' }),
    ]);
  });

  it('rejects a log entry for a class that does not exist', async () => {
    await expect(teachingLog.logTeaching(db, { topicId: 't', status: 'taught', classroomId: 'nope' })).rejects.toThrow(
      /FOREIGN KEY/,
    );
  });
});
