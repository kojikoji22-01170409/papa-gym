import { diffDays } from './dates';
import type { Exercise } from './exercises';
import type { Profile, State } from './types';

/** Stage ladder: strength volume (100% = the base amounts) and stretch hold seconds per stage. */
export const STAGES = [
  { name: '慣らし', pct: 0.7, stretchSec: 25 },
  { name: '基礎固め', pct: 0.85, stretchSec: 30 },
  { name: '標準', pct: 1, stretchSec: 30 },
  { name: 'ステップアップ', pct: 1.15, stretchSec: 35 },
  { name: 'ハイ', pct: 1.3, stretchSec: 40 },
] as const;

export const TOP_STAGE = STAGES.length - 1;
/** Takuya started at stage 3 ("標準"); a brand-new install starts gently at stage 1. */
export const DEFAULT_START_STAGE = 2;
const RECOVERY_PCT = 0.75;
const RECOVERY_STRETCH_SEC = 30;
/** Week 4, 8, 12 ... are recovery weeks. */
const isRecoveryWeek = (week: number) => (week + 1) % 4 === 0;

export interface Plan {
  stage: number; // 0-4
  week: number; // 0-based week since the plan started
  recovery: boolean;
  pct: number;
  stretchSec: number;
  stretchDay: boolean; // recovery-week days with a stretch-heavy menu
  light: boolean; // the 1-exercise minimum line (always stage-1 gentle)
  label: string;
}

export function planFor(profile: Profile, today: string, light = false): Plan {
  if (light) {
    const st = STAGES[0];
    return { stage: 0, week: 0, recovery: false, pct: st.pct, stretchSec: st.stretchSec, stretchDay: false, light: true, label: '最低ライン（軽め）' };
  }
  const start = profile.stageStart ?? today;
  const days = Math.max(0, diffDays(today, start));
  const week = Math.floor(days / 7);
  const recovery = isRecoveryWeek(week);
  const progressed = week - Math.floor(week / 4); // weeks that were not recovery weeks
  const raw = (profile.stageBase ?? DEFAULT_START_STAGE) + Math.floor((progressed - (profile.stageShift ?? 0)) / 2);
  const stage = Math.min(TOP_STAGE, Math.max(0, raw));
  const st = STAGES[stage];
  return {
    stage,
    week,
    recovery,
    pct: recovery ? RECOVERY_PCT : st.pct,
    stretchSec: recovery ? RECOVERY_STRETCH_SEC : st.stretchSec,
    stretchDay: recovery && [2, 5].includes(days % 7),
    light: false,
    label: recovery ? `回復週（ステージ${stage + 1}の7割5分）` : `ステージ${stage + 1}「${st.name}」`,
  };
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/** The amount (reps or seconds) to show for an exercise under the current plan. */
export function amountFor(e: Exercise, plan: Plan): number {
  if (e.category === 'family') return e.amount;
  if (e.category === 'stretch') return e.unit === 'sec' ? plan.stretchSec : e.amount;
  if (e.unit === 'sec') return Math.max(10, roundTo(e.amount * plan.pct, 5));
  return Math.max(3, Math.round(e.amount * plan.pct));
}

/** Fills in plan fields for data from before the staged plan (they continue at stage 3 from today). */
export function withPlan(state: State, today: string): State {
  if (state.profile.stageStart) return state;
  return { ...state, profile: { ...state.profile, stageStart: today, stageBase: state.profile.stageBase ?? DEFAULT_START_STAGE, stageShift: 0 } };
}

/** A brand-new install starts at stage 1. */
export function freshPlanFields(today: string): Pick<Profile, 'stageStart' | 'stageBase' | 'stageShift'> {
  return { stageStart: today, stageBase: 0, stageShift: 0 };
}

function trainingDates(state: State): string[] {
  return [...new Set(state.logs.map((l) => l.date))].sort();
}

function dayIsHard(state: State, date: string): boolean {
  const logs = state.logs.filter((l) => l.date === date);
  const hard = logs.filter((l) => l.feel === 'hard').length;
  return hard > 0 && hard * 2 >= logs.length;
}

/**
 * Called when a session is recorded (state already holds today's logs).
 * - two "hard" training days in a row: hold the progression for one week
 * - first record after 7+ days away: step back one stage (2 weeks)
 */
export function adjustStage(state: State, today: string, hadRecordToday: boolean): State {
  let shift = state.profile.stageShift ?? 0;
  let adjusted = state.profile.stageAdjusted;

  if (!hadRecordToday) {
    const prev = Object.keys(state.days).filter((d) => d < today).sort().at(-1);
    if (prev && diffDays(today, prev) >= 7) { shift += 2; adjusted = today; }
  }

  const dates = trainingDates(state);
  const last = dates.at(-1);
  const before = dates.at(-2);
  if (last === today && before && (!adjusted || before > adjusted) && dayIsHard(state, today) && dayIsHard(state, before)) {
    shift += 1;
    adjusted = today;
  }

  if (shift === (state.profile.stageShift ?? 0)) return state;
  return { ...state, profile: { ...state.profile, stageShift: shift, stageAdjusted: adjusted } };
}
