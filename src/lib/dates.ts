// A "day" rolls over at 3:00 local time, so a late-night session still counts for the day before.
const ROLLOVER_HOURS = 3;

const pad = (n: number) => String(n).padStart(2, '0');

export function dayKey(now: Date = new Date()): string {
  const d = new Date(now.getTime() - ROLLOVER_HOURS * 3600 * 1000);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function monthKey(now: Date = new Date()): string {
  return dayKey(now).slice(0, 7);
}

/** Parses "YYYY-MM-DD" as a local date at noon (avoids DST edge cases). */
export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(key: string, delta: number): string {
  const d = parseDay(key);
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseDay(a).getTime() - parseDay(b).getTime()) / 86400000);
}

/** Father's age when a child born in `childBirth` ("YYYY-MM") turns 20. */
export function fatherAgeWhenChildIs(fatherBirth: string, childBirth: string, childAge = 20): number {
  const [fy, fm] = fatherBirth.split('-').map(Number);
  const [cy, cm] = childBirth.split('-').map(Number);
  const months = (cy + childAge - fy) * 12 + (cm - fm);
  return Math.floor(months / 12);
}

export function ageOn(birth: string, today: string): number {
  const [by, bm] = birth.split('-').map(Number);
  const [ty, tm] = today.split('-').map(Number);
  return Math.floor(((ty - by) * 12 + (tm - bm)) / 12);
}
