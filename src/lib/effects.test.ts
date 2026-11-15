import { describe, expect, it } from 'vitest';
import { newState } from './store';
import {
  achievedWeeks, averageGain, checkChanges, estSeconds, phaseIndex, totalKcal, trainingWeek, weekEffect,
} from './effects';
import type { ExerciseLog, FitnessCheck, State } from './types';

const log = (date: string, exerciseId: string, amount: number): ExerciseLog => ({ date, exerciseId, amount, easyVariant: false, feel: 'normal' });
const withLogs = (logs: ExerciseLog[]): State => ({ ...newState(new Date(2026, 10, 1)), logs });
// 2026-11-16 is a Monday
const MON = '2026-11-16';

describe('weekEffect', () => {
  it('counts strength days, stretch days and body areas in the Monday-Sunday week', () => {
    const s = withLogs([
      log('2026-11-15', 'squat', 10), // last week (Sunday)
      log(MON, 'squat', 10),
      log(MON, 'forward-fold', 30),
      log('2026-11-17', 'pushup', 8),
      log('2026-11-17', 'plank', 30),
    ]);
    const w = weekEffect(s, '2026-11-18');
    expect(w.strengthDays).toBe(2);
    expect(w.stretchDays).toBe(1);
    expect(w.areas).toEqual({ lower: true, upper: true, core: true });
    expect(w.areaCount).toBe(3);
    expect(w.strengthDone).toBe(true);
    expect(w.daysLeft).toBe(5);
  });
  it('does not count warm-ups as stretching', () => {
    const w = weekEffect(withLogs([log(MON, 'cat-cow', 10)]), MON);
    expect(w.stretchDays).toBe(0);
    expect(w.strengthDays).toBe(0);
  });
  it('is empty with no logs', () => {
    const w = weekEffect(withLogs([]), MON);
    expect(w.strengthDays + w.stretchDays + w.areaCount + w.strengthMin).toBe(0);
    expect(w.strengthDone).toBe(false);
    expect(w.daysLeft).toBe(7);
  });
});

describe('achievedWeeks', () => {
  it('counts weeks with 2+ strength days and never drops', () => {
    const s = withLogs([
      log('2026-11-02', 'squat', 10), log('2026-11-04', 'pushup', 8), // met
      log('2026-11-09', 'squat', 10), // only 1 day
      log(MON, 'squat', 10), log('2026-11-19', 'plank', 30), // met
    ]);
    expect(achievedWeeks(s)).toBe(2);
  });
});

describe('phases', () => {
  it('first log is week 1; the phase changes at week 5 and 13', () => {
    const s = withLogs([log('2026-10-05', 'squat', 10)]);
    expect(trainingWeek(s, '2026-10-05')).toBe(1);
    expect(trainingWeek(s, '2026-10-11')).toBe(1);
    expect(trainingWeek(s, '2026-10-12')).toBe(2);
    expect(trainingWeek(withLogs([]), '2026-10-12')).toBe(0);
    expect([1, 4, 5, 12, 13, 40].map(phaseIndex)).toEqual([0, 0, 1, 1, 2, 2]);
  });
});

describe('fitness check change', () => {
  const chk = (d: string, v: Partial<FitnessCheck>): FitnessCheck => ({ date: d, chairStands: 20, pushups: 10, plankSec: 40, singleLegSec: 30, forwardBendCm: -5, ...v });
  it('needs two checks', () => {
    expect(checkChanges([chk('2026-10-01', {})])).toEqual([]);
  });
  it('gives diff and %, skipping % for a non-positive start', () => {
    const c = checkChanges([chk('2026-10-01', {}), chk('2026-11-01', { chairStands: 25, forwardBendCm: 0 })]);
    const chair = c.find((x) => x.key === 'chairStands')!;
    expect(chair.diff).toBe(5);
    expect(chair.pct).toBe(25);
    expect(c.find((x) => x.key === 'forwardBendCm')!.pct).toBeUndefined();
    expect(averageGain(c)).toBe(6); // (25 + 0 + 0 + 0) / 4
  });
});

describe('kcal', () => {
  it('is undefined without a body weight', () => {
    expect(totalKcal(withLogs([log(MON, 'squat', 10)]))).toBeUndefined();
  });
  it('uses METs x hours x kg x 1.05', () => {
    const s = withLogs([log(MON, 'squat', 10)]);
    s.profile.weightKg = 70;
    const sec = estSeconds(s.logs[0]);
    expect(sec).toBeGreaterThan(0);
    expect(totalKcal(s)).toBe(Math.round(3.5 * (sec / 3600) * 70 * 1.05));
  });
});
