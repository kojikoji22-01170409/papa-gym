import { addDays, diffDays, monthKey } from './dates';
import type { DayKind, DayRecord, ExerciseLog, Profile, State } from './types';
import type { Exercise } from './exercises';

export const POINTS: Record<DayKind, number> = { min: 10, goal: 30, rest: 0 };
export const FITNESS_CHECK_POINTS = 50;
export const MISSION_POINTS = 5;
export const MAX_TICKETS = 3;
export const MONTHLY_TICKETS = 2;
export const FAMILY_REWARD_EVERY = 7; // cumulative achieved days per unlocked family reward
export const CARDS_PER_DAY: Record<DayKind, number> = { min: 1, goal: 2, rest: 0 };

export const LEVELS: { at: number; title: string }[] = [
  { at: 0, title: 'はじめの一歩' },
  { at: 50, title: '三日坊主ブレイカー' },
  { at: 150, title: '朝の常連' },
  { at: 300, title: '習慣の芽' },
  { at: 500, title: 'ゆるぎない人' },
  { at: 800, title: '鉄の継続力' },
  { at: 1200, title: '家族の頼れるパパ' },
  { at: 1800, title: '筋肉の語り部' },
  { at: 2500, title: '生涯現役' },
  { at: 3500, title: '伝説のパパジム会員' },
];

export function levelOf(points: number): { level: number; title: string; next?: number; from: number } {
  let i = 0;
  for (let k = 0; k < LEVELS.length; k++) if (points >= LEVELS[k].at) i = k;
  return { level: i + 1, title: LEVELS[i].title, next: LEVELS[i + 1]?.at, from: LEVELS[i].at };
}

/** Consecutive days with any record (min / goal / rest), ending today or — if today is not done yet — yesterday. */
export function streakOf(days: Record<string, DayRecord>, today: string): number {
  let cursor = days[today] ? today : addDays(today, -1);
  let n = 0;
  while (days[cursor]) {
    n++;
    cursor = addDays(cursor, -1);
  }
  return n;
}

export function achievedDays(days: Record<string, DayRecord>): number {
  return Object.values(days).filter((d) => d.kind !== 'rest').length;
}

export function unlockedFamilyRewards(days: Record<string, DayRecord>): number {
  return Math.floor(achievedDays(days) / FAMILY_REWARD_EVERY);
}

/** Grants the monthly tickets for every month that has passed since the last grant (capped). */
export function applyMonthlyTickets(profile: Profile, today: string): Profile {
  const now = monthKey(new Date(`${today}T12:00:00`));
  if (profile.ticketMonth >= now) return profile;
  const [ly, lm] = profile.ticketMonth.split('-').map(Number);
  const [ny, nm] = now.split('-').map(Number);
  const months = (ny - ly) * 12 + (nm - lm);
  return {
    ...profile,
    tickets: Math.min(MAX_TICKETS, profile.tickets + months * MONTHLY_TICKETS),
    ticketMonth: now,
  };
}

/** True when exactly yesterday was missed, a streak existed before it, and a ticket is available. */
export function canRescueYesterday(state: State, today: string): boolean {
  const yesterday = addDays(today, -1);
  if (state.days[yesterday]) return false;
  if (!state.days[addDays(today, -2)]) return false;
  if (state.profile.tickets <= 0) return false;
  return diffDays(yesterday, state.profile.startDate) >= 0;
}

/** Suggests a bigger amount once the last 3 sessions at the current amount all felt easy. */
export function suggestAmount(
  logs: ExerciseLog[],
  exercise: Exercise,
  current: number,
): number | undefined {
  const recent = logs.filter((l) => l.exerciseId === exercise.id).slice(-3);
  if (recent.length < 3) return undefined;
  if (!recent.every((l) => l.feel === 'easy' && !l.easyVariant && l.amount === current)) return undefined;
  return exercise.unit === 'reps' ? Math.max(current + 1, Math.ceil(current * 1.15)) : current + 5;
}
