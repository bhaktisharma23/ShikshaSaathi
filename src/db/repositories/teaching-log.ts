/** Record of which topics were taught to which class, and when ("Mark as taught" in Phase 4). */
import type { Database } from '../types';
import { newId, nowIso } from '../util';

export type TeachingStatus = 'planned' | 'taught' | 'revisited';

export type TeachingLogEntry = {
  id: string;
  classroomId: string | null;
  topicId: string;
  status: TeachingStatus;
  taughtOn: string | null;
  notes: string | null;
};

type Row = {
  id: string;
  classroom_id: string | null;
  topic_id: string;
  status: TeachingStatus;
  taught_on: string | null;
  notes: string | null;
};

const toEntry = (r: Row): TeachingLogEntry => ({
  id: r.id,
  classroomId: r.classroom_id,
  topicId: r.topic_id,
  status: r.status,
  taughtOn: r.taught_on,
  notes: r.notes,
});

export async function logTeaching(
  db: Database,
  entry: { topicId: string; status: TeachingStatus; classroomId?: string | null; taughtOn?: string | null; notes?: string | null },
): Promise<string> {
  const id = newId();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO teaching_log (id, classroom_id, topic_id, status, taught_on, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, entry.classroomId ?? null, entry.topicId, entry.status, entry.taughtOn ?? null, entry.notes?.trim() || null, now, now],
  );
  return id;
}

export async function listTeachingLog(db: Database, topicId: string): Promise<TeachingLogEntry[]> {
  const rows = await db.getAllAsync<Row>(
    `SELECT id, classroom_id, topic_id, status, taught_on, notes FROM teaching_log
     WHERE topic_id = ? AND deleted_at IS NULL ORDER BY COALESCE(taught_on, created_at) DESC`,
    [topicId],
  );
  return rows.map(toEntry);
}
