import { addDays, diffDays } from './dates';
import { byId } from './exercises';
import type { MukiMood, MukiType } from './muki';
import { achievedDays, levelOf } from './rewards';
import { logHoldSec, logReps, weekStart } from './stats';
import type { State } from './types';

export const DEFAULT_PET_NAME = 'ムキたま';
export const STAGE_AT = [0, 3, 10, 30, 100];
export const STAGE_NAMES = ['たまご', 'ちびムキ', 'こムキ', 'ムキたま', 'ムキたまマスター'];
export const TYPE_NAMES: Record<MukiType, string> = { power: 'パワー型', flex: 'しなやか型', balance: 'バランス型' };
export const MAX_GENKI = 5;

export function stageOf(activeDays: number): number {
  let s = 0;
  for (let i = 0; i < STAGE_AT.length; i++) if (activeDays >= STAGE_AT[i]) s = i;
  return s;
}

/** Days still needed for the next stage, or undefined at the top. */
export function daysToNext(activeDays: number): number | undefined {
  const next = STAGE_AT[stageOf(activeDays) + 1];
  return next === undefined ? undefined : next - activeDays;
}

/** Body type from the last 30 days: share of strength entries among strength + stretch entries. */
export function petType(state: State, today: string): MukiType {
  const since = addDays(today, -30);
  let strength = 0;
  let stretch = 0;
  for (const l of state.logs) {
    if (l.date <= since) continue;
    const cat = byId(l.exerciseId)?.category;
    if (cat === 'lower' || cat === 'upper' || cat === 'core') strength++;
    else if (cat === 'stretch') stretch++;
  }
  const total = strength + stretch;
  if (total < 6) return 'balance';
  const share = strength / total;
  if (share >= 0.55) return 'power';
  if (share <= 0.35) return 'flex';
  return 'balance';
}

/** Hearts 0-5: goal day +2, minimum day +1, a missed day -1 (never below 0), a ticket day changes nothing. */
export function genkiOf(state: State, today: string): number {
  const keys = Object.keys(state.days).sort();
  if (keys.length === 0) return 3;
  const start = keys[0] > addDays(today, -60) ? keys[0] : addDays(today, -60);
  const end = state.days[today] ? today : addDays(today, -1);
  let g = 3;
  for (let d = start, n = 0; diffDays(d, end) <= 0 && n < 400; d = addDays(d, 1), n++) {
    const rec = state.days[d];
    if (!rec) g -= 1;
    else if (rec.kind === 'goal') g += 2;
    else if (rec.kind === 'min') g += 1;
    g = Math.max(0, Math.min(MAX_GENKI, g));
  }
  return g;
}

export function moodOf(state: State, today: string): MukiMood {
  if (state.days[today]) return state.days[today].kind === 'rest' ? 'sleepy' : 'happy';
  const g = genkiOf(state, today);
  if (g >= 3) return 'normal';
  return g >= 1 ? 'sleepy' : 'sad';
}

/** Longest run of consecutive recorded days (any kind). */
export function longestStreak(days: State['days']): number {
  const keys = Object.keys(days).sort();
  let best = 0;
  let run = 0;
  let prev: string | undefined;
  for (const k of keys) {
    run = prev && addDays(prev, 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}

export interface PetStats { power: number; core: number; flex: number; keep: number }
export const STAT_LABEL: Record<keyof PetStats, string> = { power: 'ちから', core: 'たいかん', flex: 'しなやか', keep: 'つづける' };
const cap = (n: number) => Math.min(99, Math.max(1, n));

/** Levels computed from the records alone; `before` (exclusive) limits to history up to that day. */
export function petStats(state: State, before?: string): PetStats {
  const logs = before ? state.logs.filter((l) => l.date < before) : state.logs;
  const days = before ? Object.fromEntries(Object.entries(state.days).filter(([d]) => d < before)) : state.days;
  let strength = 0;
  let core = 0;
  let flex = 0;
  for (const l of logs) {
    const cat = byId(l.exerciseId)?.category;
    if (cat === 'lower' || cat === 'upper') strength += logReps(l);
    else if (cat === 'core') core += logReps(l) + logHoldSec(l) / 3;
    else if (cat === 'stretch') flex += logHoldSec(l) + logReps(l) * 3;
  }
  return {
    power: cap(1 + Math.floor(strength / 40)),
    core: cap(1 + Math.floor(core / 40)),
    flex: cap(1 + Math.floor(flex / 300)),
    keep: cap(1 + achievedDays(days) + longestStreak(days)),
  };
}

/** Levels gained since the start of this week. */
export function weeklyGains(state: State, today: string): Partial<PetStats> {
  const now = petStats(state);
  const was = petStats(state, weekStart(today));
  const out: Partial<PetStats> = {};
  (Object.keys(now) as (keyof PetStats)[]).forEach((k) => { if (now[k] > was[k]) out[k] = now[k] - was[k]; });
  return out;
}

export type Slot = 'hat' | 'face' | 'neck' | 'back' | 'bg';
interface Ctx { streak: number; reps: number; checks: number; decemberDays: number; level: number; stage: number }
export interface Item { id: string; name: string; slot: Slot; cond: string; ok: (c: Ctx) => boolean }

export const ITEMS: Item[] = [
  { id: 'cap', name: '青いキャップ', slot: 'hat', cond: '7日連続を達成', ok: (c) => c.streak >= 7 },
  { id: 'towel', name: 'スポーツタオル', slot: 'neck', cond: '累計1,000回', ok: (c) => c.reps >= 1000 },
  { id: 'sunglasses', name: 'サングラス', slot: 'face', cond: '体力チェックを2回', ok: (c) => c.checks >= 2 },
  { id: 'santa', name: 'サンタぼうし', slot: 'hat', cond: '12月にやった日が10日', ok: (c) => c.decemberDays >= 10 },
  { id: 'medal', name: '金のメダル', slot: 'neck', cond: '30日連続を達成', ok: (c) => c.streak >= 30 },
  { id: 'park', name: '背景「公園」', slot: 'bg', cond: 'レベル4に到達', ok: (c) => c.level >= 4 },
  { id: 'fuji', name: '背景「富士山」', slot: 'bg', cond: 'レベル7に到達', ok: (c) => c.level >= 7 },
  { id: 'cape', name: 'マント', slot: 'back', cond: 'ムキたまマスターに成長', ok: (c) => c.stage >= 4 },
];

export function unlockedItems(state: State): string[] {
  const c: Ctx = {
    streak: longestStreak(state.days),
    reps: state.logs.reduce((n, l) => n + logReps(l), 0),
    checks: state.checks.length,
    decemberDays: Object.values(state.days).filter((d) => d.kind !== 'rest' && d.date.slice(5, 7) === '12').length,
    level: levelOf(state.profile.points).level,
    stage: stageOf(achievedDays(state.days)),
  };
  return ITEMS.filter((i) => i.ok(c)).map((i) => i.id);
}

export interface PetView {
  name: string;
  stage: number;
  type: MukiType;
  mood: MukiMood;
  genki: number;
  activeDays: number;
  worn: NonNullable<State['pet']>['worn'];
}

export function petView(state: State, today: string): PetView {
  const activeDays = achievedDays(state.days);
  const unlocked = unlockedItems(state);
  const worn = { ...(state.pet?.worn ?? {}) } as NonNullable<State['pet']>['worn'] & Record<string, string | undefined>;
  // an item no longer unlocked (e.g. data restored) is simply not worn
  for (const k of Object.keys(worn)) if (worn[k] && !unlocked.includes(worn[k]!)) delete worn[k];
  return {
    name: state.pet?.name?.trim() || DEFAULT_PET_NAME,
    stage: stageOf(activeDays),
    type: petType(state, today),
    mood: moodOf(state, today),
    genki: genkiOf(state, today),
    activeDays,
    worn,
  };
}

export const hatchPending = (state: State): boolean => stageOf(achievedDays(state.days)) >= 1 && !state.pet?.name;

/** Encyclopedia key: stages 0-2 have one look, later stages one per type. */
export const seenKey = (stage: number, type: MukiType): string => (stage >= 3 ? `${stage}:${type}` : String(stage));

export const ENCYCLOPEDIA: { key: string; stage: number; type?: MukiType; label: string }[] = [
  { key: '0', stage: 0, label: 'たまご' },
  { key: '1', stage: 1, label: 'ちびムキ' },
  { key: '2', stage: 2, label: 'こムキ' },
  ...(['power', 'flex', 'balance'] as MukiType[]).map((t) => ({ key: `3:${t}`, stage: 3, type: t, label: `ムキたま ${TYPE_NAMES[t]}` })),
  ...(['power', 'flex', 'balance'] as MukiType[]).map((t) => ({ key: `4:${t}`, stage: 4, type: t, label: `マスター ${TYPE_NAMES[t]}` })),
];

/** Adds today's look to the encyclopedia; returns the same state when nothing is new. */
export function markSeen(state: State, today: string): State {
  const v = petView(state, today);
  const key = seenKey(v.stage, v.type);
  if (state.pet?.seen?.includes(key)) return state;
  return { ...state, pet: { ...state.pet, seen: [...(state.pet?.seen ?? []), key] } };
}

/** One line for the pet to say; mixes in the children's names and the family's own words. */
export function speechFor(state: State, today: string, rng: () => number = Math.random): string {
  const v = petView(state, today);
  const pool: string[] = [];
  const hint = daysToNext(v.activeDays);
  if (v.stage === 0) pool.push('……（たまごがゆれている）', 'もうすぐ生まれそう！', '早く出てきたいな');
  else if (v.mood === 'happy') pool.push('今日もやったね！', 'いい汗かいたね', '明日も一緒にやろう！');
  else if (v.mood === 'normal') pool.push('今日は何から始める？', '1種目だけでも大丈夫だよ', 'ゆっくりでいいよ');
  else if (v.mood === 'sleepy') pool.push('ふあ……ちょっと眠いな', '1種目だけやってみない？', 'ひさしぶりだね、待ってたよ');
  else pool.push('さみしかったよ……', '1種目だけでも、うれしいな', 'おかえり！');
  if (hint !== undefined && v.stage > 0) pool.push(`あと${hint}日で${STAGE_NAMES[v.stage + 1]}になるよ！`);
  for (const c of state.children) pool.push(`${c.name}が見てるよ、パパ`);
  for (const t of state.cheers) pool.push(t);
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
}

export function sayLevelUp(before: number, after: number): number | undefined {
  return stageOf(after) > stageOf(before) ? stageOf(after) : undefined;
}
