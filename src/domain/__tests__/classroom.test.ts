import { currentAcademicYear, isValidAcademicYear, validateClassroomInput } from '@/domain/classroom';

describe('currentAcademicYear()', () => {
  it('uses the April–March Indian school session', () => {
    expect(currentAcademicYear(new Date(2026, 10, 20))).toBe('2026-27'); // 20 Nov 2026
    expect(currentAcademicYear(new Date(2027, 1, 10))).toBe('2026-27'); // 10 Feb 2027
    expect(currentAcademicYear(new Date(2027, 3, 1))).toBe('2027-28'); // 1 Apr 2027
    expect(currentAcademicYear(new Date(2099, 5, 1))).toBe('2099-00'); // century rollover
  });
});

describe('isValidAcademicYear()', () => {
  it.each(['2026-27', '2099-00'])('accepts %s', (v) => expect(isValidAcademicYear(v)).toBe(true));
  it.each(['2026-28', '2026', '26-27', '2026/27', ''])('rejects %s', (v) => expect(isValidAcademicYear(v)).toBe(false));
});

describe('validateClassroomInput()', () => {
  const valid = { name: '6-A', studentCount: 38, academicYear: '2026-27' };

  it('accepts and cleans valid input', () => {
    expect(validateClassroomInput({ ...valid, name: '  6-A ', schoolName: '' })).toEqual({
      ok: true,
      value: { name: '6-A', studentCount: 38, academicYear: '2026-27', schoolName: null },
    });
  });

  it('reports every problem at once', () => {
    const result = validateClassroomInput({ name: ' ', studentCount: 0, academicYear: '2026', schoolName: 'x'.repeat(81) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.map((e) => e.field)).toEqual(['name', 'studentCount', 'academicYear', 'schoolName']);
    }
  });

  it.each([1, 200])('accepts %i students', (n) => expect(validateClassroomInput({ ...valid, studentCount: n }).ok).toBe(true));
  it.each([0, 201, 2.5, Number.NaN])('rejects %p students', (n) =>
    expect(validateClassroomInput({ ...valid, studentCount: n }).ok).toBe(false),
  );
});
