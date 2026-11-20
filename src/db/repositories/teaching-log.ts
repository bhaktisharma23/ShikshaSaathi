/** Record of which topics were taught to which class, and when ("Mark as taught"). */
import type { Database } from '../types';
import { newId, nowIso } from '../util';

export type TeachingStatus = 'planned' | 'taught' | 'revisited';

export type TeachingLogEntry = {
  id: string;
  classroomId: string | null;
  /** Name of the class, kept even if the class was deleted later (so the record still reads well). */
  classroomName: string | null;
  topicId: string;
  status: TeachingStatus;
  taughtOn: string | null;
  notes: string | null;
};

type Row = {
  id: string;
  classroom_id: string | null;
  classroom_name: string | null;
  topic_id: string;
  status: TeachingStatus;
  taught_on: string | null;
  notes: string | null;
};

const toEntry = (r: Row): TeachingLogEntry => ({
  id: r.id,
  classroomId: r.classroom_id,
  classroomName: r.classroom_name,
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
    `SELECT l.id, l.classroom_id, c.name AS classroom_name, l.topic_id, l.status, l.taught_on, l.notes
     FROM teaching_log l LEFT JOIN classrooms c ON c.id = l.classroom_id
     WHERE l.topic_id = ? AND l.deleted_at IS NULL
     ORDER BY COALESCE(l.taught_on, l.created_at) DESC, l.created_at DESC`,
    [topicId],
  );
  return rows.map(toEntry);
}

/** Has this topic already been taught to this class? (Used to suggest "Revision".) */
export async function hasBeenTaught(db: Database, topicId: string, classroomId: string): Promise<boolean> {
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM teaching_log
     WHERE topic_id = ? AND classroom_id = ? AND status IN ('taught','revisited') AND deleted_at IS NULL`,
    [topicId, classroomId],
  );
  return (row?.n ?? 0) > 0;
}

export async function deleteTeachingLog(db: Database, id: string): Promise<void> {
  const now = nowIso();
  await db.runAsync('UPDATE teaching_log SET deleted_at = ?, updated_at = ? WHERE id = ?', [now, now, id]);
}
