/** Teacher's personal notes on a topic (used by the Preparation Centre in Phase 4). */
import type { Database } from '../types';
import { newId, nowIso } from '../util';

export type TeacherNote = {
  id: string;
  topicId: string;
  sectionKey: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  topic_id: string;
  section_key: string | null;
  body: string;
  created_at: string;
  updated_at: string;
};

const toNote = (r: NoteRow): TeacherNote => ({
  id: r.id,
  topicId: r.topic_id,
  sectionKey: r.section_key,
  body: r.body,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export const NOTE_MAX_LENGTH = 2000;

function cleanBody(body: string): string {
  const trimmed = body.trim();
  if (!trimmed) throw new Error('Note is empty');
  if (trimmed.length > NOTE_MAX_LENGTH) throw new Error(`Note is longer than ${NOTE_MAX_LENGTH} characters`);
  return trimmed;
}

export async function listNotes(db: Database, topicId: string): Promise<TeacherNote[]> {
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT id, topic_id, section_key, body, created_at, updated_at FROM teacher_notes
     WHERE topic_id = ? AND deleted_at IS NULL ORDER BY created_at`,
    [topicId],
  );
  return rows.map(toNote);
}

export async function addNote(db: Database, topicId: string, body: string, sectionKey: string | null = null) {
  const id = newId();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO teacher_notes (id, topic_id, section_key, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
    [id, topicId, sectionKey, cleanBody(body), now, now],
  );
  return id;
}

export async function updateNote(db: Database, id: string, body: string): Promise<void> {
  await db.runAsync('UPDATE teacher_notes SET body = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL', [
    cleanBody(body),
    nowIso(),
    id,
  ]);
}

export async function deleteNote(db: Database, id: string): Promise<void> {
  const now = nowIso();
  await db.runAsync('UPDATE teacher_notes SET deleted_at = ?, updated_at = ? WHERE id = ?', [now, now, id]);
}
