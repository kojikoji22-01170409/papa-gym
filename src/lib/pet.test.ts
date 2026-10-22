import { describe, expect, it } from 'vitest';
import { addDays } from './dates';
import { completeSession } from './actions';
import { byId } from './exercises';
import { ITEMS, genkiOf, hatchPending, longestStreak, markSeen, moodOf, petStats, petType, petView, speechFor, stageOf, unlockedItems } from './pet';
import { mukiSvg } from './muki';
import { newState } from './store';
import type { DayKind, ExerciseLog, State } from './types';

const TODAY = '2026-10-22';
const base = (): State => newState(new Date(2026, 8, 1));
const withDays = (kinds: Record<string, DayKind>, s: State = base()): State => ({
  ...s,
  days: Object.fromEntries(Object.entries(kinds).map(([d, kind]) => [d, { date: d, kind, points: 10 }])),
});
const run = (n: number, kind: DayKind = 'min', end = TODAY) =>
  Object.fromEntries(Array.from({ length: n }, (_, i) => [addDays(end, -i), kind]));
const log = (date: string, exerciseId: string, amount: number): ExerciseLog => ({ date, exerciseId, amount, easyVariant: false, feel: 'normal' });

describe('pet stage', () => {
  it('changes at 3 / 10 / 30 / 100 active days', () => {
    expect([0, 2, 3, 9, 10, 29, 30, 99, 100].map(stageOf)).toEqual([0, 0, 1, 1, 2, 2, 3, 3, 4]);
  });
  it('rest days do not count', () => {
    const s = withDays({ ...run(2), '2026-10-01': 'rest', '2026-10-02': 'rest' });
    expect(petView(s, TODAY).activeDays).toBe(2);
  });
  it('asks for a name once hatched', () => {
    expect(hatchPending(withDays(run(2)))).toBe(false);
    expect(hatchPending(withDays(run(3)))).toBe(true);
    expect(hatchPending({ ...withDays(run(3)), pet: { name: 'タロウ' } })).toBe(false);
  });
});

describe('pet hearts and mood', () => {
  it('goal +2, min +1, miss -1, floor 0', () => {
    expect(genkiOf(withDays({ [TODAY]: 'goal' }), TODAY)).toBe(5);
    expect(genkiOf(withDays({ [TODAY]: 'min' }), TODAY)).toBe(4);
    expect(genkiOf(withDays({ '2026-10-10': 'min', [TODAY]: 'rest' }), TODAY)).toBe(0);
  });
  it('a ticket day leaves hearts unchanged and shows sleeping', () => {
    const s = withDays({ '2026-10-20': 'goal', '2026-10-21': 'rest', [TODAY]: 'rest' });
    expect(genkiOf(s, TODAY)).toBe(5);
    expect(moodOf(s, TODAY)).toBe('sleepy');
  });
  it('is happy after training today and sad with no hearts', () => {
    expect(moodOf(withDays({ [TODAY]: 'min' }), TODAY)).toBe('happy');
    expect(moodOf(withDays({ '2026-09-01': 'min' }), TODAY)).toBe('sad');
  });
});

describe('pet type', () => {
  const logsOf = (id: string, n: number) => Array.from({ length: n }, (_, i) => log(addDays(TODAY, -i), id, 10));
  it('is power with mostly strength, flex with mostly stretch, else balance', () => {
    const strength = 'squat';
    const stretch = 'cat-cow';
    expect(byId(strength)).toBeTruthy();
    const s = withDays(run(5));
    expect(petType({ ...s, logs: logsOf(strength, 6) }, TODAY)).toBe('power');
    expect(petType({ ...s, logs: logsOf(stretch, 6) }, TODAY)).toBe('flex');
    expect(petType({ ...s, logs: [...logsOf(strength, 3), ...logsOf(stretch, 3)] }, TODAY)).toBe('balance');
  });
});

describe('pet stats and items', () => {
  it('finds the longest streak', () => {
    const s = withDays({ '2026-10-01': 'min', '2026-10-02': 'min', '2026-10-03': 'min', '2026-10-10': 'min' });
    expect(longestStreak(s.days)).toBe(3);
  });
  it('stats never go down when days are missed', () => {
    const s = withDays(run(5));
    const later = petStats({ ...s, logs: [log(TODAY, 'squat', 20)] });
    expect(petStats({ ...s, logs: [] }).power).toBeLessThanOrEqual(later.power);
    expect(later.power).toBeGreaterThanOrEqual(1);
  });
  it('unlocks the cap at a 7 day streak and keeps it', () => {
    expect(unlockedItems(withDays(run(6)))).not.toContain('cap');
    expect(unlockedItems(withDays(run(7)))).toContain('cap');
    expect(unlockedItems(withDays({ ...run(7), [addDays(TODAY, -3)]: 'rest' }))).toContain('cap');
    expect(ITEMS.length).toBe(8);
  });
  it('reports a new stage and items after a session', () => {
    const s = withDays(run(2, 'min', addDays(TODAY, -1)));
    const r = completeSession(s, TODAY, 'min', []);
    expect(r.grewTo).toBe(1);
    expect(r.newItems).toEqual([]);
    const s7 = withDays(run(6, 'min', addDays(TODAY, -1)));
    expect(completeSession(s7, TODAY, 'min', []).newItems).toContain('cap');
    expect(completeSession(r.state, TODAY, 'goal', []).grewTo).toBeUndefined();
  });
});

describe('pet storage and view', () => {
  it('markSeen adds each look once', () => {
    const s = withDays(run(3));
    const a = markSeen(s, TODAY);
    expect(a.pet?.seen).toEqual(['1']);
    expect(markSeen(a, TODAY)).toBe(a);
  });
  it('drops worn items that are not unlocked', () => {
    const s = { ...withDays(run(3)), pet: { worn: { hat: 'santa' } } };
    expect(petView(s, TODAY).worn?.hat).toBeUndefined();
  });
  it('speech mixes in family words', () => {
    const s = { ...withDays(run(3)), cheers: ['パパかっこいい'], children: [{ id: 'a', name: 'ハル', birth: '2016-05' }] };
    const said = new Set(Array.from({ length: 60 }, (_, i) => speechFor(s, TODAY, () => i / 60)));
    expect(said.has('パパかっこいい')).toBe(true);
    expect(said.has('ハルが見てるよ、パパ')).toBe(true);
  });
  it('draws every stage, mood and item without throwing', () => {
    for (let stage = 0; stage <= 4; stage++)
      for (const mood of ['happy', 'normal', 'sleepy', 'sad'] as const)
        for (const type of ['power', 'flex', 'balance'] as const)
          expect(mukiSvg({ stage, type, mood, worn: { hat: 'cap', neck: 'medal', face: 'sunglasses', back: 'cape', bg: 'park' } })).toContain('<svg');
    for (const it of ITEMS) expect(mukiSvg({ stage: 3, type: 'power', worn: { [it.slot]: it.id } })).toContain('</svg>');
  });
});
