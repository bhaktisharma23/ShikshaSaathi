/**
 * Classroom rules, kept free of React and the database so they are easy to test.
 */

export type Classroom = {
  id: string;
  name: string;
  grade: number;
  studentCount: number;
  academicYear: string;
  schoolName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClassroomInput = {
  name: string;
  studentCount: number;
  academicYear: string;
  schoolName?: string | null;
};

export const CLASSROOM_LIMITS = {
  nameMax: 30,
  schoolMax: 80,
  studentsMin: 1,
  studentsMax: 200,
} as const;

/** Which field is wrong and why — the key is used to pick a translated message. */
export type ClassroomFieldError =
  | { field: 'name'; reason: 'required' | 'tooLong' }
  | { field: 'studentCount'; reason: 'outOfRange' }
  | { field: 'academicYear'; reason: 'format' }
  | { field: 'schoolName'; reason: 'tooLong' };

/**
 * Indian school sessions start in April, so in Jan–Mar we are still in last year's session.
 * 20 Nov 2026 → "2026-27"; 10 Feb 2027 → "2026-27"; 1 Apr 2027 → "2027-28".
 */
export function currentAcademicYear(date: Date = new Date()): string {
  const startYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return formatAcademicYear(startYear);
}

export function formatAcademicYear(startYear: number): string {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
}

/** "2026-27" is valid; the second part must be the year after the first. */
export function isValidAcademicYear(value: string): boolean {
  const match = /^(\d{4})-(\d{2})$/.exec(value.trim());
  if (!match) return false;
  return formatAcademicYear(Number(match[1])) === value.trim();
}

/** Trims text and returns the cleaned input, or the list of problems. */
export function validateClassroomInput(
  input: ClassroomInput,
): { ok: true; value: ClassroomInput } | { ok: false; errors: ClassroomFieldError[] } {
  const name = input.name.trim();
  const schoolName = input.schoolName?.trim() || null;
  const academicYear = input.academicYear.trim();
  const errors: ClassroomFieldError[] = [];

  if (name.length === 0) errors.push({ field: 'name', reason: 'required' });
  else if (name.length > CLASSROOM_LIMITS.nameMax) errors.push({ field: 'name', reason: 'tooLong' });

  if (
    !Number.isInteger(input.studentCount) ||
    input.studentCount < CLASSROOM_LIMITS.studentsMin ||
    input.studentCount > CLASSROOM_LIMITS.studentsMax
  ) {
    errors.push({ field: 'studentCount', reason: 'outOfRange' });
  }

  if (!isValidAcademicYear(academicYear)) errors.push({ field: 'academicYear', reason: 'format' });
  if (schoolName && schoolName.length > CLASSROOM_LIMITS.schoolMax) errors.push({ field: 'schoolName', reason: 'tooLong' });

  return errors.length > 0
    ? { ok: false, errors }
    : { ok: true, value: { name, studentCount: input.studentCount, academicYear, schoolName } };
}
