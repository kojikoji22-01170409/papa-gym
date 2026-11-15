import { addDays, diffDays } from './dates';
import { byId, holdSecOf, repsOf, type Exercise } from './exercises';
import { weekStart } from './stats';
import type { ExerciseLog, FitnessCheck, State } from './types';

/** Guideline numbers shown in the app (all are rough targets, not medical advice). */
export const STRENGTH_DAYS_TARGET = 2; // MHLW 身体活動・運動ガイド2023: 筋トレを週2〜3日
export const STRETCH_DAYS_TARGET = 2; // ACSM: 柔軟性運動は週2〜3日以上
export const STRENGTH_MIN_LOW = 30; // Momma et al. 2022 (BJSM): 週30〜60分でリスク低下
export const STRENGTH_MIN_HIGH = 60;

export type Area = 'lower' | 'upper' | 'core';
export const AREA_LABEL: Record<Area, string> = { lower: '下半身', upper: '上半身', core: '体幹' };
const AREAS: Area[] = ['lower', 'upper', 'core'];

const isStrength = (e: Exercise): boolean => !e.warmup && (e.category === 'lower' || e.category === 'upper' || e.category === 'core');
const isStretch = (e: Exercise): boolean => !e.warmup && e.category === 'stretch';

/** Rough time one logged exercise took: 3 s per rep, the held seconds, and 20 s of setting up. */
export function estSeconds(l: ExerciseLog): number {
  const e = byId(l.exerciseId);
  if (!e) return 0;
  return repsOf(e, l.amount) * 3 + holdSecOf(e, l.amount) + 20;
}

export interface WeekEffect {
  start: string;
  strengthDays: number;
  stretchDays: number;
  areas: Record<Area, boolean>;
  areaCount: number;
  strengthMin: number;
  /** Days left in this week, today included. */
  daysLeft: number;
  strengthDone: boolean;
}

function inWeek(l: ExerciseLog, start: string): boolean {
  return l.date >= start && l.date <= addDays(start, 6);
}

export function weekEffect(state: State, today: string): WeekEffect {
  const start = weekStart(today);
  const strengthDates = new Set<string>();
  const stretchDates = new Set<string>();
  const areas: Record<Area, boolean> = { lower: false, upper: false, core: false };
  let sec = 0;
  for (const l of state.logs) {
    if (!inWeek(l, start)) continue;
    const e = byId(l.exerciseId);
    if (!e) continue;
    if (isStrength(e)) {
      strengthDates.add(l.date);
      areas[e.category as Area] = true;
      sec += estSeconds(l);
    } else if (isStretch(e)) {
      stretchDates.add(l.date);
    }
  }
  const strengthDays = strengthDates.size;
  return {
    start,
    strengthDays,
    stretchDays: stretchDates.size,
    areas,
    areaCount: AREAS.filter((a) => areas[a]).length,
    strengthMin: Math.round(sec / 60),
    daysLeft: diffDays(addDays(start, 6), today) + 1,
    strengthDone: strengthDays >= STRENGTH_DAYS_TARGET,
  };
}

/** Number of weeks (Mon-Sun) that reached the strength guideline. It only ever goes up. */
export function achievedWeeks(state: State): number {
  const perWeek = new Map<string, Set<string>>();
  for (const l of state.logs) {
    const e = byId(l.exerciseId);
    if (!e || !isStrength(e)) continue;
    const w = weekStart(l.date);
    perWeek.set(w, (perWeek.get(w) ?? new Set()).add(l.date));
  }
  return [...perWeek.values()].filter((d) => d.size >= STRENGTH_DAYS_TARGET).length;
}

export interface Phase {
  title: string;
  weeks: string;
  text: string;
}

/** What the body is doing, by weeks of training (neural adaptation first, muscle growth after ~4 weeks). */
export const PHASES: (Phase & { from: number })[] = [
  { from: 1, title: '動きを覚える時期', weeks: '1〜4週目', text: '力を出す神経のつながりが整う時期です。筋肉はまだ大きくなくても、同じ動きが楽に感じ始めます。' },
  { from: 5, title: '筋肉が太り始める時期', weeks: '5〜12週目', text: '神経の慣れに続いて、筋肉そのものが太くなる変化が出始めます。階段や立ち上がりの軽さに出やすい頃です。' },
  { from: 13, title: '体力が定着する時期', weeks: '13週目〜', text: '続けた分が体に定着してきます。量を保つだけでも、筋力や動きやすさを維持しやすくなります。' },
];

/** Which week of training it is (1 = the first 7 days after the first log), or 0 before any log. */
export function trainingWeek(state: State, today: string): number {
  if (state.logs.length === 0) return 0;
  const first = state.logs.reduce((m, l) => (l.date < m ? l.date : m), state.logs[0].date);
  return Math.max(1, Math.floor(diffDays(today, first) / 7) + 1);
}

export function phaseIndex(week: number): number {
  let idx = 0;
  PHASES.forEach((p, i) => { if (week >= p.from) idx = i; });
  return idx;
}

export interface CheckChange {
  key: keyof Omit<FitnessCheck, 'date'>;
  label: string;
  unit: string;
  first: number;
  latest: number;
  diff: number;
  pct?: number;
  life: string;
}

const CHECK_META: { key: CheckChange['key']; label: string; unit: string; life: string }[] = [
  { key: 'chairStands', label: '30秒椅子立ち上がり', unit: '回', life: '椅子や床からの立ち上がり、階段が楽になります。' },
  { key: 'pushups', label: '腕立て伏せ', unit: '回', life: '物を押す・支える力がついています。' },
  { key: 'plankSec', label: 'プランク', unit: '秒', life: '体幹が安定して、姿勢を保ちやすくなります。' },
  { key: 'singleLegSec', label: '片足立ち', unit: '秒', life: 'バランスが良くなり、つまずきにくくなります。' },
  { key: 'forwardBendCm', label: '立位体前屈', unit: 'cm', life: '体が柔らかくなり、腰まわりが動かしやすくなります。' },
];

/** First check versus the latest one. Empty until there are two checks. */
export function checkChanges(checks: FitnessCheck[]): CheckChange[] {
  if (checks.length < 2) return [];
  const first = checks[0];
  const last = checks[checks.length - 1];
  return CHECK_META.map((m) => {
    const a = first[m.key];
    const b = last[m.key];
    return { ...m, first: a, latest: b, diff: b - a, pct: a > 0 ? Math.round(((b - a) / a) * 100) : undefined };
  });
}

/** Average % change of the metrics that have a positive starting value, or undefined. */
export function averageGain(changes: CheckChange[]): number | undefined {
  const pcts = changes.map((c) => c.pct).filter((p): p is number => p !== undefined);
  return pcts.length === 0 ? undefined : Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
}

/** METs (MHLW 身体活動のメッツ表): 筋力トレーニング(軽・中等度) 3.5, ストレッチング 2.3. */
const METS = { strength: 3.5, stretch: 2.3, other: 3.0 };
export const ONIGIRI_KCAL = 180;

/** Total kcal burned by all logged exercises: METs x hours x body weight x 1.05. */
export function totalKcal(state: State): number | undefined {
  const kg = state.profile.weightKg;
  if (!kg) return undefined;
  let sec = { strength: 0, stretch: 0, other: 0 };
  for (const l of state.logs) {
    const e = byId(l.exerciseId);
    if (!e) continue;
    const kind = isStrength(e) ? 'strength' : e.category === 'stretch' ? 'stretch' : 'other';
    sec = { ...sec, [kind]: sec[kind] + estSeconds(l) };
  }
  const kcal = (Object.keys(METS) as (keyof typeof METS)[]).reduce((n, k) => n + METS[k] * (sec[k] / 3600) * kg * 1.05, 0);
  return Math.round(kcal);
}
