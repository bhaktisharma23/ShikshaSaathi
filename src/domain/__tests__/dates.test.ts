import { addDays, checkPastDate, formatDisplayDate, parseIsoDate, todayIsoDate } from '@/domain/dates';

const NOW = new Date(2026, 10, 20, 10, 30); // 20 Nov 2026, 10:30 local

describe('dates', () => {
  it('gives today as a local calendar day', () => {
    expect(todayIsoDate(NOW)).toBe('2026-11-20');
  });

  it('adds and subtracts days across month and year ends', () => {
    expect(addDays('2026-11-20', -1)).toBe('2026-11-19');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it.each(['2026-02-30', '2026-13-01', '20-11-2026', '2026-1-5', ''])('rejects invalid date %p', (v) => {
    expect(parseIsoDate(v)).toBeNull();
  });

  it('checks dates in the past', () => {
    expect(checkPastDate('2026-11-20', NOW)).toBeNull();
    expect(checkPastDate('2026-11-19', NOW)).toBeNull();
    expect(checkPastDate('2026-11-21', NOW)).toBe('future');
    expect(checkPastDate('yesterday', NOW)).toBe('format');
  });

  it('formats for display and never shows a shifted day', () => {
    expect(formatDisplayDate('2026-11-18', 'en')).toMatch(/18/);
    expect(formatDisplayDate('2026-11-18', 'en')).toMatch(/Nov/);
    expect(formatDisplayDate('not-a-date', 'en')).toBe('not-a-date');
  });
});
