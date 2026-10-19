import { addDays, diffDays, parseDay } from './dates';
import { byId, holdSecOf, repsOf } from './exercises';
import { LEVELS, achievedDays } from './rewards';
import type { ExerciseLog, State } from './types';

export const REP_BADGES = [100, 500, 1000, 3000, 5000, 10000];
export const DAY_BADGES = [10, 30, 50, 100, 200, 365];
export const STREAK_MILESTONES = [7, 30, 100, 365];

export function logReps(l: ExerciseLog): number {
  const e = byId(l.exerciseId);
  return e ? repsOf(e, l.amount) : 0;
}

export function logHoldSec(l: ExerciseLog): number {
  const e = byId(l.exerciseId);
  return e ? holdSecOf(e, l.amount) : 0;
}

/** Monday of the week containing `date`. */
export function weekStart(date: string): string {
  const dow = (parseDay(date).getDay() + 6) % 7; // Mon=0
  return addDays(date, -dow);
}

export interface Totals {
  reps: number;
  holdSec: number;
  days: number;
  goalDays: number;
  cards: number;
  quizCorrect: number;
  quizAnswered: number;
}

export function totals(state: State): Totals {
  const days = Object.values(state.days);
  return {
    reps: state.logs.reduce((n, l) => n + logReps(l), 0),
    holdSec: state.logs.reduce((n, l) => n + logHoldSec(l), 0),
    days: achievedDays(state.days),
    goalDays: days.filter((d) => d.kind === 'goal').length,
    cards: Object.values(state.cards).reduce((n, c) => n + c.count, 0),
    quizCorrect: state.quiz?.correct ?? 0,
    quizAnswered: state.quiz?.answered ?? 0,
  };
}

/** Training amount of one day, used to shade the year calendar: reps plus half the seconds held. */
export function dayVolumes(logs: ExerciseLog[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const l of logs) out[l.date] = (out[l.date] ?? 0) + logReps(l) + logHoldSec(l) / 2;
  return out;
}

/** 0 = nothing, 1..4 = darker. Days without logs (fitness check, rest) fall back to their kind. */
export function heatLevel(state: State, date: string, volumes: Record<string, number>): number {
  const rec = state.days[date];
  if (!rec) return 0;
  const vol = volumes[date];
  if (vol === undefined) return rec.kind === 'goal' ? 2 : 1;
  return vol < 15 ? 1 : vol < 40 ? 2 : vol < 70 ? 3 : 4;
}

export interface HeatCell {
  date: string;
  level: number;
  rest: boolean;
  future: boolean;
}

/** Columns = weeks (oldest first, Monday to Sunday) ending with the week that contains `today`. */
export function heatmap(state: State, today: string, weeks = 53): HeatCell[][] {
  const volumes = dayVolumes(state.logs);
  const first = addDays(weekStart(today), -7 * (weeks - 1));
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(first, w * 7 + d);
      return {
        date,
        level: heatLevel(state, date, volumes),
        rest: state.days[date]?.kind === 'rest',
        future: date > today,
      };
    }),
  );
}

export interface Week {
  start: string;
  reps: number;
}

export function weeklyReps(state: State, today: string, weeks = 12): Week[] {
  const first = addDays(weekStart(today), -7 * (weeks - 1));
  const out: Week[] = Array.from({ length: weeks }, (_, i) => ({ start: addDays(first, 7 * i), reps: 0 }));
  for (const l of state.logs) {
    const i = Math.floor(diffDays(weekStart(l.date), first) / 7);
    if (i >= 0 && i < weeks) out[i].reps += logReps(l);
  }
  return out;
}

export interface ExerciseStat {
  id: string;
  times: number;
  reps: number;
  holdSec: number;
}

export function perExercise(state: State): ExerciseStat[] {
  const map = new Map<string, ExerciseStat>();
  for (const l of state.logs) {
    const s = map.get(l.exerciseId) ?? { id: l.exerciseId, times: 0, reps: 0, holdSec: 0 };
    s.times += 1;
    s.reps += logReps(l);
    s.holdSec += logHoldSec(l);
    map.set(l.exerciseId, s);
  }
  return [...map.values()].sort((a, b) => b.times - a.times || b.reps - a.reps);
}

export interface Growth {
  id: string;
  first: number;
  current: number;
  graduatedEasyOn?: string;
}

export function growth(state: State): Growth[] {
  const out: Growth[] = [];
  for (const [id, logs] of groupBy(state.logs, (l) => l.exerciseId)) {
    const e = byId(id);
    if (!e) continue;
    const first = logs[0].amount;
    const current = state.profile.amounts[id] ?? logs.at(-1)!.amount;
    let graduatedEasyOn: string | undefined;
    const lastEasy = logs.map((l) => l.easyVariant).lastIndexOf(true);
    if (lastEasy >= 0 && lastEasy < logs.length - 1 && logs.slice(lastEasy + 1).filter((l) => !l.easyVariant).length >= 3) {
      graduatedEasyOn = logs[lastEasy + 1].date;
    }
    out.push({ id, first, current, graduatedEasyOn });
  }
  return out.filter((g) => g.current !== g.first || g.graduatedEasyOn);
}

function groupBy<T>(items: T[], key: (t: T) => string): Map<string, T[]> {
  const m = new Map<string, T[]>();
  for (const i of items) m.set(key(i), [...(m.get(key(i)) ?? []), i]);
  return m;
}

export interface Badge {
  label: string;
  at: number;
  earned: boolean;
}

export function repBadges(totalReps: number): Badge[] {
  return REP_BADGES.map((at) => ({ label: `累計${at.toLocaleString('ja-JP')}回`, at, earned: totalReps >= at }));
}

export function dayBadges(totalDays: number): Badge[] {
  return DAY_BADGES.map((at) => ({ label: `${at}日達成`, at, earned: totalDays >= at }));
}

export interface TimelineEvent {
  date: string;
  title: string;
}

/** Points earned per date, rebuilt from what is stored (day points, fitness checks, missions). */
function pointsByDate(state: State): Record<string, number> {
  const out: Record<string, number> = {};
  for (const d of Object.values(state.days)) out[d.date] = (out[d.date] ?? 0) + d.points;
  for (const c of state.checks) out[c.date] = (out[c.date] ?? 0) + 50;
  for (const [date, done] of Object.entries(state.missionDone)) if (done) out[date] = (out[date] ?? 0) + 5;
  return out;
}

/** Milestones in the order they happened (oldest first). */
export function timeline(state: State): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const dates = Object.keys(state.days).sort();
  if (dates.length === 0) return events;
  events.push({ date: dates[0], title: 'はじめの一歩（最初の記録）' });

  let run = 0;
  dates.forEach((d, i) => {
    run = i > 0 && addDays(dates[i - 1], 1) === d ? run + 1 : 1;
    if (STREAK_MILESTONES.includes(run)) events.push({ date: d, title: `${run}日連続を達成` });
  });

  const pts = pointsByDate(state);
  const allDates = [...new Set([...Object.keys(pts)])].sort();
  let cum = 0;
  let level = 0;
  for (const d of allDates) {
    cum += pts[d];
    while (level + 1 < LEVELS.length && cum >= LEVELS[level + 1].at) {
      level += 1;
      events.push({ date: d, title: `Lv.${level + 1}「${LEVELS[level].title}」に到達` });
    }
  }

  const logDates = [...new Set(state.logs.map((l) => l.date))].sort();
  const repsByDate: Record<string, number> = {};
  for (const l of state.logs) repsByDate[l.date] = (repsByDate[l.date] ?? 0) + logReps(l);
  let reps = 0;
  let badge = 0;
  for (const d of logDates) {
    reps += repsByDate[d];
    while (badge < REP_BADGES.length && reps >= REP_BADGES[badge]) {
      events.push({ date: d, title: `累計${REP_BADGES[badge].toLocaleString('ja-JP')}回を達成` });
      badge += 1;
    }
  }

  for (const c of state.checks) events.push({ date: c.date, title: '体力チェック' });
  const order = (e: TimelineEvent) => e.date;
  return events.sort((a, b) => (order(a) < order(b) ? -1 : order(a) > order(b) ? 1 : 0));
}

export function monthLabel(date: string): string {
  const [y, m] = date.split('-');
  return `${y}年${Number(m)}月`;
}

export const dayLabel = (date: string): string => `${Number(date.slice(5, 7))}/${Number(date.slice(8))}`;
