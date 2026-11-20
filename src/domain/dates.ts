/**
 * Calendar dates as "YYYY-MM-DD" strings (what the database stores for taught_on etc.).
 *
 * Why strings and not Date objects? A Date is a moment in time, so "18 Nov" can turn into
 * "17 Nov" when converted between time zones. A plain "2026-11-18" is just a calendar day.
 */

/** The phone's local calendar day, e.g. "2026-11-20". */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayIsoDate(now: Date = new Date()): string {
  return toIsoDate(now);
}

export function addDays(isoDate: string, days: number): string {
  const date = parseIsoDate(isoDate);
  if (!date) throw new Error(`Invalid date "${isoDate}"`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** Parses "YYYY-MM-DD" as a local date; returns null for anything invalid (incl. 2026-02-30). */
export function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  const roundTrips = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return roundTrips ? date : null;
}

export type DateProblem = 'format' | 'future';

/** For dates of things that already happened (e.g. "taught on"). */
export function checkPastDate(value: string, now: Date = new Date()): DateProblem | null {
  if (!parseIsoDate(value)) return 'format';
  return value.trim() > todayIsoDate(now) ? 'future' : null;
}

/** "18 Nov 2026" / "18 नव॰ 2026" — readable date in the UI language. */
export function formatDisplayDate(isoDate: string, language: 'en' | 'hi'): string {
  const date = parseIsoDate(isoDate);
  if (!date) return isoDate;
  try {
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoDate; // Some older Android JS engines have limited date formatting.
  }
}
