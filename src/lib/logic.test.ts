import { describe, expect, it } from 'vitest';
import { addDays, ageOn, dayKey, fatherAgeWhenChildIs } from './dates';
import { applyMonthlyTickets, canRescueYesterday, levelOf, streakOf, suggestAmount, unlockedFamilyRewards } from './rewards';
import { completeSession, saveCheck, useTicket } from './actions';
import { drawCards } from './cards';
import { goalMenu } from './exercises';
import { newState } from './store';
import type { ExerciseLog, State } from './types';
import { byId } from './exercises';

const day = (s: string) => ({ date: s, kind: 'min' as const, points: 10 });

describe('dates', () => {
  it('treats before 3:00 as the previous day', () => {
    expect(dayKey(new Date(2026, 9, 20, 2, 30))).toBe('2026-10-19');
    expect(dayKey(new Date(2026, 9, 20, 3, 0))).toBe('2026-10-20');
  });
  it('adds days across month ends', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('computes ages for the countdown', () => {
    expect(fatherAgeWhenChildIs('1981-04', '2016-05')).toBe(55);
    expect(ageOn('2016-05', '2026-10-19')).toBe(10);
  });
});

describe('streak', () => {
  it('counts back from today when done', () => {
    const days = { '2026-10-17': day('2026-10-17'), '2026-10-18': day('2026-10-18'), '2026-10-19': day('2026-10-19') };
    expect(streakOf(days, '2026-10-19')).toBe(3);
  });
  it('keeps the streak alive until the day ends', () => {
    const days = { '2026-10-17': day('2026-10-17'), '2026-10-18': day('2026-10-18') };
    expect(streakOf(days, '2026-10-19')).toBe(2);
  });
  it('resets after a missed day', () => {
    expect(streakOf({ '2026-10-17': day('2026-10-17') }, '2026-10-19')).toBe(0);
  });
});

describe('tickets', () => {
  it('grants 2 per month, capped at 3', () => {
    const p = { ...newState(new Date(2026, 8, 15)).profile };
    expect(applyMonthlyTickets(p, '2026-10-01').tickets).toBe(3);
    expect(applyMonthlyTickets({ ...p, tickets: 0 }, '2026-10-01').tickets).toBe(2);
    expect(applyMonthlyTickets({ ...p, tickets: 0 }, '2026-12-01').tickets).toBe(3);
  });
  it('rescues only a single missed day inside a streak', () => {
    const s: State = { ...newState(new Date(2026, 9, 1)), days: { '2026-10-17': day('2026-10-17') } };
    expect(canRescueYesterday(s, '2026-10-19')).toBe(true);
    expect(canRescueYesterday({ ...s, days: {} }, '2026-10-19')).toBe(false);
    const used = useTicket(s, '2026-10-19');
    expect(used.days['2026-10-18'].kind).toBe('rest');
    expect(used.profile.tickets).toBe(1);
    expect(streakOf(used.days, '2026-10-19')).toBe(2);
  });
});

describe('sessions and rewards', () => {
  const rng = () => 0.1; // always a normal card
  it('pays 10 for min and the 20 difference when upgrading to goal', () => {
    let s = newState(new Date(2026, 9, 19));
    const a = completeSession(s, '2026-10-19', 'min', [], rng);
    expect(a.pointsEarned).toBe(10);
    expect(a.cards).toHaveLength(1);
    s = a.state;
    const b = completeSession(s, '2026-10-19', 'goal', [], rng);
    expect(b.pointsEarned).toBe(20);
    expect(b.cards).toHaveLength(1);
    const c = completeSession(b.state, '2026-10-19', 'min', [], rng);
    expect(c.pointsEarned).toBe(0);
    expect(c.state.profile.points).toBe(30);
  });
  it('flags streak milestones once', () => {
    let s = newState(new Date(2026, 9, 1));
    s = { ...s, days: Object.fromEntries(Array.from({ length: 6 }, (_, i) => { const d = addDays('2026-10-13', i); return [d, day(d)]; })) };
    const r = completeSession(s, '2026-10-19', 'min', [], rng);
    expect(r.streak).toBe(7);
    expect(r.milestone).toBe(7);
  });
  it('counts a fitness check as a goal day plus 50 points', () => {
    const r = saveCheck(newState(new Date(2026, 9, 19)), '2026-10-19',
      { date: '2026-10-19', chairStands: 20, pushups: 10, plankSec: 40, singleLegSec: 30, forwardBendCm: 0 }, rng);
    expect(r.state.days['2026-10-19'].kind).toBe('goal');
    expect(r.state.profile.points).toBe(80);
    expect(r.pointsEarned).toBe(80);
  });
  it('unlocks a family reward per 7 achieved days, ignoring rest days', () => {
    const days: Record<string, ReturnType<typeof day>> = {};
    for (let i = 0; i < 14; i++) days[addDays('2026-10-01', i)] = day(addDays('2026-10-01', i));
    days['2026-10-20'] = { date: '2026-10-20', kind: 'rest' as 'min', points: 0 };
    expect(unlockedFamilyRewards(days)).toBe(2);
  });
  it('levels up on thresholds', () => {
    expect(levelOf(0).level).toBe(1);
    expect(levelOf(50).level).toBe(2);
    expect(levelOf(10000).next).toBeUndefined();
  });
});

describe('cards', () => {
  it('prefers unowned normal cards and falls back when family or vouchers are missing', () => {
    const s = newState(new Date(2026, 9, 19));
    expect(drawCards(s, 1, () => 0.99)[0]).toMatch(/^n:/); // no reward registered
    expect(drawCards(s, 1, () => 0.8)[0]).toMatch(/^n:/); // no family registered
    const withKid: State = { ...s, children: [{ id: 'k1', name: 'ハル', birth: '2016-05' }] };
    expect(drawCards(withKid, 1, () => 0.8)[0]).toMatch(/^f:k1:/);
    const withReward: State = { ...s, selfRewards: [{ id: 'r1', text: 'コーヒー豆' }] };
    expect(drawCards(withReward, 1, () => 0.99)[0]).toBe('s:r1');
  });
});

describe('menu and auto-adjust', () => {
  it('builds a stable 5-item menu: 3 strength + 2 stretch', () => {
    for (let n = 0; n < 12; n++) {
      const m = goalMenu(n);
      expect(m).toHaveLength(5);
      expect(m.filter((e) => e.category === 'stretch')).toHaveLength(2);
      expect(new Set(m.map((e) => e.id)).size).toBe(5);
    }
  });
  it('suggests more only after 3 easy sessions at the current amount', () => {
    const sq = byId('squat')!;
    const log = (feel: ExerciseLog['feel'], amount = 10): ExerciseLog =>
      ({ date: 'd', exerciseId: 'squat', amount, easyVariant: false, feel });
    expect(suggestAmount([log('easy'), log('easy')], sq, 10)).toBeUndefined();
    expect(suggestAmount([log('easy'), log('easy'), log('easy')], sq, 10)).toBe(12);
    expect(suggestAmount([log('easy'), log('easy'), log('normal')], sq, 10)).toBeUndefined();
    expect(suggestAmount([log('easy'), log('easy'), log('easy')], sq, 12)).toBeUndefined();
  });
});
