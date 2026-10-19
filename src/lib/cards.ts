import type { State } from './types';

export type Rarity = 'normal' | 'rare' | 'super';

export interface CardView {
  id: string;
  rarity: Rarity;
  title: string;
  body: string;
  photo?: string;
}

// General reference notes, not medical advice. Keep claims modest; add a source only when sure of it.
export const FACTS: { title: string; body: string }[] = [
  { title: '週2日の筋トレ', body: 'WHOの2020年ガイドラインは、成人に週2日以上の筋力トレーニングを勧めています。（WHO 身体活動・座位行動ガイドライン 2020）' },
  { title: '少しでも動く', body: 'WHOのガイドラインは、どんなに短い身体活動でも何もしないよりは健康に良いとしています。1種目だけの日にも意味があります。' },
  { title: '座りっぱなしを減らす', body: '座っている時間を減らし、軽い動きに置き換えることも推奨されています。仕事の合間のスクワットも立派な1回です。' },
  { title: '習慣化は数か月仕事', body: '習慣化の研究（Lally ら, 2010）では、行動が自動化するまで平均して約2か月（個人差は大きい）かかりました。焦らなくて大丈夫です。' },
  { title: '1日休んでも大丈夫', body: '同じ研究で、1日抜けただけでは習慣化の進み方に大きな影響はなかったと報告されています。お休みチケットはそのための仕組みです。' },
  { title: '筋肉は使えば維持できる', body: '加齢で筋肉量は減りやすくなりますが、筋力トレーニングを続けることで維持・向上が期待できることが知られています。' },
  { title: '呼吸は止めない', body: '筋トレ中に息を止めると血圧が上がりやすくなります。力を入れるときに息を吐くのが基本です。' },
  { title: 'ゆっくり下ろす', body: '筋トレは「下ろす動き」をゆっくりにすると、同じ回数でも刺激が増えます。回数を増やす前に試してみましょう。' },
  { title: 'ストレッチは反動をつけない', body: '反動をつけず、痛気持ちいい手前で20〜30秒キープするのが基本です。痛みが出る場合は無理をしないでください。' },
  { title: '痛みがある日は軽めに', body: '膝や腰に違和感がある日は「やさしい版」に切り替えましょう。続けることが一番のトレーニングです。痛みが続く場合は医療機関へ。' },
  { title: '体力チェックは自分との比較', body: '他人と比べず、先月の自分と比べるのがおすすめです。数字が少し動くだけでも、続けている証拠です。' },
  { title: '小さな成功を認める', body: '最低ラインの達成も、れっきとした1日です。連続日数は「やった日」の積み重ねで決まります。' },
];

export const FAMILY_TEMPLATES: ((name: string) => string)[] = [
  (n) => `${n}が見ているのは、毎日続けているパパの背中です。`,
  (n) => `${n}と走り回れる体は、今日の1種目からできています。`,
  (n) => `${n}が大きくなっても元気なパパでいるために、今日も1日分。`,
];

const pickIndex = (n: number, rng: () => number) => Math.min(n - 1, Math.floor(rng() * n));

/** Draws `count` card ids. Rarity odds: normal 70% / family 25% / reward voucher 5%, with graceful fallbacks. */
export function drawCards(state: State, count: number, rng: () => number = Math.random): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const roll = rng();
    const familyPool = familyCardIds(state);
    if (roll >= 0.95 && state.selfRewards.length > 0) {
      out.push(`s:${state.selfRewards[pickIndex(state.selfRewards.length, rng)].id}`);
    } else if (roll >= 0.7 && familyPool.length > 0) {
      out.push(familyPool[pickIndex(familyPool.length, rng)]);
    } else {
      const all = FACTS.map((_, k) => `n:${k}`);
      const owned = all.filter((id) => state.cards[id] || out.includes(id));
      const fresh = all.filter((id) => !owned.includes(id));
      const pool = fresh.length > 0 ? fresh : all;
      out.push(pool[pickIndex(pool.length, rng)]);
    }
  }
  return out;
}

export function familyCardIds(state: State): string[] {
  const ids: string[] = [];
  for (const c of state.children) FAMILY_TEMPLATES.forEach((_, k) => ids.push(`f:${c.id}:${k}`));
  state.cheers.forEach((_, k) => ids.push(`u:${k}`));
  return ids;
}

export function cardView(id: string, state: State): CardView | undefined {
  const [kind, a, b] = id.split(':');
  if (kind === 'n') {
    const f = FACTS[Number(a)];
    return f && { id, rarity: 'normal', title: f.title, body: f.body };
  }
  if (kind === 'f') {
    const child = state.children.find((c) => c.id === a);
    const t = FAMILY_TEMPLATES[Number(b)];
    return child && t && { id, rarity: 'rare', title: `${child.name}より`, body: t(child.name), photo: child.photo };
  }
  if (kind === 'u') {
    const text = state.cheers[Number(a)];
    return text !== undefined ? { id, rarity: 'rare', title: '家族の言葉', body: text } : undefined;
  }
  if (kind === 's') {
    const r = state.selfRewards.find((x) => x.id === a);
    return r && { id, rarity: 'super', title: 'ごほうび引換券', body: r.text };
  }
  return undefined;
}
