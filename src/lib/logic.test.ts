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
  it('builds a 7-item menu: warm-up, 3 strength, 3 stretches', () => {
    for (let n = 0; n < 30; n++) {
      const m = goalMenu(n);
      expect(m).toHaveLength(7);
      expect(m[0].warmup).toBe(true);
      expect(m.filter((e) => e.category === 'stretch' && !e.warmup)).toHaveLength(3);
      expect(m.filter((e) => ['lower', 'upper', 'core'].includes(e.category))).toHaveLength(3);
      expect(new Set(m.map((e) => e.id)).size).toBe(7);
    }
  });
  it('stretch days have a warm-up, 1 strength and 5 distinct stretches', () => {
    for (let n = 0; n < 30; n++) {
      const m = goalMenu(n, true);
      expect(m).toHaveLength(7);
      expect(m.filter((e) => e.category === 'stretch' && !e.warmup)).toHaveLength(5);
      expect(new Set(m.map((e) => e.id)).size).toBe(7);
    }
  });
  it('every exercise has steps and a benefit', () => {
    for (const e of EXERCISES) {
      expect(e.steps.length, e.id).toBeGreaterThanOrEqual(3);
      expect(e.benefit.length, e.id).toBeGreaterThan(10);
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

// ---- v2: stats, quiz, demo GIFs
import { existsSync, readFileSync } from 'node:fs';
import { EXERCISES, holdSecOf, repsOf } from './exercises';
import { QUIZZES, pickQuiz, recordQuiz } from './quiz';
import { dayBadges, growth, heatmap, perExercise, repBadges, timeline, totals, weekStart, weeklyReps } from './stats';

const log = (date: string, exerciseId: string, amount: number, feel: ExerciseLog['feel'] = 'normal', easyVariant = false): ExerciseLog =>
  ({ date, exerciseId, amount, easyVariant, feel });

describe('stats', () => {
  it('counts reps with sets and both sides, and holds separately', () => {
    expect(repsOf(byId('squat')!, 10)).toBe(20); // 10 x 2 sets
    expect(repsOf(byId('back-lunge')!, 8)).toBe(16); // 8 per side
    expect(repsOf(byId('plank')!, 30)).toBe(0);
    expect(holdSecOf(byId('side-plank')!, 20)).toBe(40);
  });
  it('rolls weeks over on Monday', () => {
    expect(weekStart('2026-10-19')).toBe('2026-10-19'); // Monday
    expect(weekStart('2026-10-25')).toBe('2026-10-19'); // Sunday
    expect(weekStart('2026-10-26')).toBe('2026-10-26');
  });
  it('sums the last weeks and compares this week with last', () => {
    const s: State = { ...newState(new Date(2026, 9, 1)), logs: [
      log('2026-10-13', 'squat', 10), log('2026-10-19', 'squat', 10), log('2026-10-20', 'pushup', 8),
    ] };
    const w = weeklyReps(s, '2026-10-21', 3);
    expect(w.map((x) => x.reps)).toEqual([0, 20, 36]);
    expect(totals(s).reps).toBe(56);
  });
  it('builds a 53-week heatmap whose columns start on Monday', () => {
    const s: State = { ...newState(new Date(2026, 9, 1)), days: { '2026-10-19': day('2026-10-19') }, logs: [log('2026-10-19', 'squat', 10)] };
    const h = heatmap(s, '2026-10-21');
    expect(h).toHaveLength(53);
    expect(h.at(-1)![0].date).toBe('2026-10-19');
    expect(h.at(-1)![0].level).toBe(2); // 20 reps -> level 2
    expect(h.at(-1)![3].future).toBe(true);
  });
  it('ranks exercises and reports growth and easy-version graduation', () => {
    const logs = [
      log('2026-10-01', 'pushup', 8, 'hard', true), log('2026-10-02', 'pushup', 8, 'normal', true),
      log('2026-10-03', 'pushup', 8), log('2026-10-04', 'pushup', 8), log('2026-10-05', 'pushup', 8),
      log('2026-10-01', 'squat', 10),
    ];
    const s: State = { ...newState(new Date(2026, 9, 1)), logs, profile: { ...newState().profile, amounts: { squat: 12 } } };
    expect(perExercise(s)[0].id).toBe('pushup');
    const g = growth(s);
    expect(g.find((x) => x.id === 'squat')).toMatchObject({ first: 10, current: 12 });
    expect(g.find((x) => x.id === 'pushup')?.graduatedEasyOn).toBe('2026-10-03');
  });
  it('earns badges by total', () => {
    expect(repBadges(120).filter((b) => b.earned)).toHaveLength(1);
    expect(dayBadges(30).filter((b) => b.earned)).toHaveLength(2);
  });
  it('builds a timeline with first day, streak, level and badge milestones', () => {
    const days: State['days'] = {};
    for (let i = 0; i < 7; i++) days[addDays('2026-10-01', i)] = { date: addDays('2026-10-01', i), kind: 'goal', points: 30 };
    const logs = Array.from({ length: 7 }, (_, i) => log(addDays('2026-10-01', i), 'squat', 10)); // 20 reps/day
    const s: State = { ...newState(new Date(2026, 9, 1)), days, logs, checks: [{ date: '2026-10-05', chairStands: 1, pushups: 1, plankSec: 1, singleLegSec: 1, forwardBendCm: 0 }] };
    const titles = timeline(s).map((e) => e.title);
    expect(titles[0]).toContain('はじめの一歩');
    expect(titles).toContain('7日連続を達成');
    expect(titles).toContain('累計100回を達成'); // 5 days x 20 reps
    expect(titles.some((t) => t.startsWith('Lv.2'))).toBe(true);
    expect(titles).toContain('体力チェック');
  });
});

describe('quiz', () => {
  it('has well-formed questions with unique ids', () => {
    expect(new Set(QUIZZES.map((q) => q.id)).size).toBe(QUIZZES.length);
    for (const q of QUIZZES) {
      expect(q.choices).toHaveLength(3);
      expect(new Set(q.choices).size).toBe(3);
      expect([0, 1, 2]).toContain(q.answer);
      expect(q.why.length).toBeGreaterThan(10);
    }
  });
  it('shows the least-seen question first and records answers', () => {
    const seen = Object.fromEntries(QUIZZES.slice(1).map((q) => [q.id, 1]));
    expect(pickQuiz(seen, 7).id).toBe(QUIZZES[0].id);
    const s = recordQuiz(recordQuiz(newState(new Date(2026, 9, 1)), 'who-strength', true), 'breathing', false);
    expect(s.quiz).toEqual({ answered: 2, correct: 1, seen: { 'who-strength': 1, breathing: 1 } });
  });
});

describe('demo GIFs', () => {
  it('exist for every exercise and are precached by the service worker', () => {
    const sw = readFileSync('public/sw.js', 'utf8');
    for (const e of EXERCISES) {
      expect(existsSync(`public/gifs/${e.id}.gif`), e.id).toBe(true);
      expect(sw).toContain(`'${e.id}'`);
    }
  });
});

// ---- v3: staged plan
import { adjustStage, amountFor, planFor, withPlan } from './plan';

describe('staged plan', () => {
  const base = (stageBase = 2): State => ({ ...newState(new Date(2026, 9, 20, 12)), profile: { ...newState().profile, startDate: '2026-10-20', stageStart: '2026-10-20', stageBase, stageShift: 0, points: 0, tickets: 2, ticketMonth: '2026-10', amounts: {} } });
  const day = (n: number) => addDays('2026-10-20', n);

  it('starts at stage 3, steps up every 2 weeks and has a recovery week every 4th week', () => {
    const p = base().profile;
    expect(planFor(p, day(0)).stage).toBe(2);
    expect(planFor(p, day(13)).stage).toBe(2);
    expect(planFor(p, day(14)).stage).toBe(3); // week 3
    const rec = planFor(p, day(21)); // week 4 = recovery
    expect(rec.recovery).toBe(true);
    expect(rec.pct).toBe(0.75);
    expect(planFor(p, day(28)).recovery).toBe(false);
    expect(planFor(p, day(28 + 7)).stage).toBe(4);
    expect(planFor(p, day(400)).stage).toBe(4); // capped
    expect(planFor(base(0).profile, day(0)).stage).toBe(0);
  });
  it('scales strength, keeps stretches long and family moves unscaled', () => {
    const light = planFor(base().profile, day(0), true);
    expect(amountFor(byId('squat')!, light)).toBe(7);
    expect(amountFor(byId('plank')!, light)).toBe(20);
    const std = planFor(base().profile, day(0));
    expect(amountFor(byId('squat')!, std)).toBe(10);
    expect(amountFor(byId('hamstring')!, std)).toBe(30);
    expect(amountFor(byId('carry-squat')!, light)).toBe(8);
    expect(amountFor(byId('cat-cow')!, std)).toBe(10);
  });
  it('holds the progression after two hard training days in a row', () => {
    const hard = (date: string): ExerciseLog => ({ date, exerciseId: 'squat', amount: 10, easyVariant: false, feel: 'hard' });
    let s = base();
    s = { ...s, logs: [hard(day(1)), hard(day(2))], days: { [day(1)]: { date: day(1), kind: 'goal', points: 30 }, [day(2)]: { date: day(2), kind: 'goal', points: 30 } } };
    const adjusted = adjustStage(s, day(2), false);
    expect(adjusted.profile.stageShift).toBe(1);
    // the same pair is not counted twice
    expect(adjustStage(adjusted, day(2), true).profile.stageShift).toBe(1);
    expect(planFor(adjusted.profile, day(14)).stage).toBe(2);
  });
  it('steps back one stage after a break of 7+ days', () => {
    let s = base();
    s = { ...s, days: { [day(1)]: { date: day(1), kind: 'goal', points: 30 } } };
    expect(adjustStage(s, day(8), false).profile.stageShift).toBe(2);
    expect(adjustStage(s, day(7), false).profile.stageShift).toBe(0);
  });
  it('migrates old data to start at stage 3 today', () => {
    const old = newState(new Date(2026, 9, 1, 12));
    const stripped: State = { ...old, profile: { ...old.profile, stageStart: undefined, stageBase: undefined } };
    const m = withPlan(stripped, '2026-10-20');
    expect(planFor(m.profile, '2026-10-20').stage).toBe(2);
    expect(withPlan(m, '2026-11-30')).toBe(m);
  });
});
