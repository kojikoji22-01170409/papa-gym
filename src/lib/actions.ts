import { addDays } from './dates';
import { drawCards } from './cards';
import {
  CARDS_PER_DAY,
  FITNESS_CHECK_POINTS,
  MISSION_POINTS,
  POINTS,
  streakOf,
} from './rewards';
import type { DayKind, ExerciseLog, FitnessCheck, State } from './types';

export const MILESTONES = [7, 30, 100, 365];

export const MISSIONS = [
  '10歳のお子さんと鬼ごっこ（5分）',
  '2歳のお子さんを肩車して家の中をゆっくり1周',
  '10歳のお子さんと腕相撲を3回',
  '2歳のお子さんと「高い高い」を10回（揺さぶらず、ゆっくり）',
  '子どもたちと動物まねっこ競争（ゾウ歩き・カエル跳び）',
  '10歳のお子さんと全力かけっこを1本',
  '2歳のお子さんを抱っこして階段を1往復（足元に注意）',
];

export const missionOf = (date: string): string => {
  const n = Number(date.replace(/-/g, '')) || 0;
  return MISSIONS[n % MISSIONS.length];
};

export interface SessionResult {
  state: State;
  kind: DayKind;
  pointsEarned: number;
  cards: string[];
  streak: number;
  milestone?: number;
}

const RANK: Record<DayKind, number> = { rest: 0, min: 1, goal: 2 };

function addCards(state: State, ids: string[]): State {
  const cards = { ...state.cards };
  for (const id of ids) cards[id] = { count: (cards[id]?.count ?? 0) + 1, used: cards[id]?.used ?? 0 };
  return { ...state, cards };
}

/** Records a finished session. Upgrading min -> goal on the same day only pays the difference. */
export function completeSession(
  state: State,
  today: string,
  kind: 'min' | 'goal',
  logs: ExerciseLog[],
  rng: () => number = Math.random,
): SessionResult {
  const prev = state.days[today];
  const prevKind: DayKind = prev?.kind ?? 'rest';
  const effective: DayKind = RANK[kind] > RANK[prevKind] ? kind : prevKind;
  const earned = POINTS[effective] - (prev ? POINTS[prev.kind] : 0);
  const newCards = CARDS_PER_DAY[effective] - (prev ? CARDS_PER_DAY[prev.kind] : 0);
  const hadStreak = streakOf(state.days, today);

  let next: State = {
    ...state,
    profile: { ...state.profile, points: state.profile.points + earned },
    days: { ...state.days, [today]: { date: today, kind: effective, points: POINTS[effective] } },
    logs: [...state.logs, ...logs],
  };
  const drawn = newCards > 0 ? drawCards(next, newCards, rng) : [];
  next = addCards(next, drawn);

  const streak = streakOf(next.days, today);
  const milestone = !prev && streak > hadStreak && MILESTONES.includes(streak) ? streak : undefined;
  return { state: next, kind: effective, pointsEarned: earned, cards: drawn, streak, milestone };
}

/** Spends one rest ticket to keep the streak alive across yesterday. */
export function useTicket(state: State, today: string): State {
  const yesterday = addDays(today, -1);
  if (state.profile.tickets <= 0 || state.days[yesterday]) return state;
  return {
    ...state,
    profile: { ...state.profile, tickets: state.profile.tickets - 1 },
    days: { ...state.days, [yesterday]: { date: yesterday, kind: 'rest', points: 0 } },
  };
}

/** A monthly fitness check counts as a goal-line day for the day it is done. */
export function saveCheck(
  state: State,
  today: string,
  check: FitnessCheck,
  rng: () => number = Math.random,
): SessionResult {
  const withCheck: State = {
    ...state,
    checks: [...state.checks.filter((c) => c.date !== today), check],
    profile: { ...state.profile, points: state.profile.points + FITNESS_CHECK_POINTS },
  };
  const res = completeSession(withCheck, today, 'goal', [], rng);
  return { ...res, pointsEarned: res.pointsEarned + FITNESS_CHECK_POINTS };
}

export function completeMission(state: State, today: string): State {
  if (state.missionDone[today]) return state;
  return {
    ...state,
    missionDone: { ...state.missionDone, [today]: true },
    profile: { ...state.profile, points: state.profile.points + MISSION_POINTS },
  };
}

export function useCard(state: State, id: string): State {
  const stock = state.cards[id];
  if (!stock || stock.used >= stock.count) return state;
  return { ...state, cards: { ...state.cards, [id]: { ...stock, used: stock.used + 1 } } };
}
