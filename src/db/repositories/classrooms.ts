/**
 * Classrooms: the teacher's own classes (e.g. "6-A, 38 students"). Not student accounts.
 * Deleting is a "soft delete": the row is hidden (deleted_at is set) but kept, so recorded
 * results are never silently destroyed and a future sync can learn about the deletion.
 */
import { validateClassroomInput, type Classroom, type ClassroomInput } from '@/domain/classroom';

import type { Database } from '../types';
import { newId, nowIso } from '../util';

type ClassroomRow = {
  id: string;
  name: string;
  grade: number;
  student_count: number;
  academic_year: string;
  school_name: string | null;
  created_at: string;
  updated_at: string;
};

const COLUMNS = 'id, name, grade, student_count, academic_year, school_name, created_at, updated_at';

function toClassroom(row: ClassroomRow): Classroom {
  return {
    id: row.id,
    name: row.name,
    grade: row.grade,
    studentCount: row.student_count,
    academicYear: row.academic_year,
    schoolName: row.school_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class ValidationError extends Error {
  name = 'ValidationError';
}

function cleanOrThrow(input: ClassroomInput): ClassroomInput {
  const result = validateClassroomInput(input);
  if (!result.ok) throw new ValidationError(result.errors.map((e) => `${e.field}:${e.reason}`).join(', '));
  return result.value;
}

export async function listClassrooms(db: Database): Promise<Classroom[]> {
  const rows = await db.getAllAsync<ClassroomRow>(
    `SELECT ${COLUMNS} FROM classrooms WHERE deleted_at IS NULL ORDER BY academic_year DESC, name COLLATE NOCASE`,
  );
  return rows.map(toClassroom);
}

export async function getClassroom(db: Database, id: string): Promise<Classroom | null> {
  const row = await db.getFirstAsync<ClassroomRow>(
    `SELECT ${COLUMNS} FROM classrooms WHERE id = ? AND deleted_at IS NULL`,
    [id],
  );
  return row ? toClassroom(row) : null;
}

export async function createClassroom(db: Database, input: ClassroomInput): Promise<Classroom> {
  const clean = cleanOrThrow(input);
  const id = newId();
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO classrooms (id, name, grade, student_count, academic_year, school_name, created_at, updated_at)
     VALUES (?, ?, 6, ?, ?, ?, ?, ?)`,
    [id, clean.name, clean.studentCount, clean.academicYear, clean.schoolName ?? null, now, now],
  );
  return (await getClassroom(db, id))!;
}

export async function updateClassroom(db: Database, id: string, input: ClassroomInput): Promise<Classroom> {
  const clean = cleanOrThrow(input);
  const result = await db.runAsync(
    `UPDATE classrooms SET name = ?, student_count = ?, academic_year = ?, school_name = ?, updated_at = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [clean.name, clean.studentCount, clean.academicYear, clean.schoolName ?? null, nowIso(), id],
  );
  if (result.changes === 0) throw new Error(`Classroom ${id} not found`);
  return (await getClassroom(db, id))!;
}

export async function deleteClassroom(db: Database, id: string): Promise<void> {
  const now = nowIso();
  await db.runAsync('UPDATE classrooms SET deleted_at = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL', [
    now,
    now,
    id,
  ]);
}

export async function restoreClassroom(db: Database, id: string): Promise<void> {
  await db.runAsync('UPDATE classrooms SET deleted_at = NULL, updated_at = ? WHERE id = ?', [nowIso(), id]);
}

/** Number of completed assessments recorded for a class (shown before deleting). */
export async function countCompletedSessions(db: Database, classroomId: string): Promise<number> {
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM assessment_sessions
     WHERE classroom_id = ? AND status = 'completed' AND deleted_at IS NULL`,
    [classroomId],
  );
  return row?.n ?? 0;
}
