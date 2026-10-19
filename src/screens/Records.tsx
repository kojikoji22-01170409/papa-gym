import { useState } from 'react';
import type { ScreenProps } from '../App';
import { achievedDays, FAMILY_REWARD_EVERY, streakOf, unlockedFamilyRewards } from '../lib/rewards';
import { addDays, ageOn, fatherAgeWhenChildIs, parseDay } from '../lib/dates';
import { FACTS, cardView } from '../lib/cards';
import { useCard } from '../lib/actions';
import type { DayRecord, FitnessCheck } from '../lib/types';
import { CardBox } from './Done';

const pad = (n: number) => String(n).padStart(2, '0');

function longestStreak(days: Record<string, DayRecord>): number {
  const keys = Object.keys(days).sort();
  let best = 0;
  let run = 0;
  keys.forEach((k, i) => {
    run = i > 0 && addDays(keys[i - 1], 1) === k ? run + 1 : 1;
    best = Math.max(best, run);
  });
  return best;
}

function Calendar({ days, today }: { days: Record<string, DayRecord>; today: string }) {
  const [offset, setOffset] = useState(0);
  const base = parseDay(today);
  const first = new Date(base.getFullYear(), base.getMonth() + offset, 1, 12);
  const y = first.getFullYear();
  const m = first.getMonth();
  const count = new Date(y, m + 1, 0).getDate();
  const cells: (string | undefined)[] = Array(first.getDay()).fill(undefined);
  for (let d = 1; d <= count; d++) cells.push(`${y}-${pad(m + 1)}-${pad(d)}`);
  return (
    <div className="card">
      <div className="row spread">
        <button className="small" onClick={() => setOffset(offset - 1)}>←</button>
        <b>{y}年{m + 1}月</b>
        <button className="small" disabled={offset >= 0} onClick={() => setOffset(offset + 1)}>→</button>
      </div>
      <div className="cal" style={{ marginTop: 8 }}>
        {['日', '月', '火', '水', '木', '金', '土'].map((w) => <div key={w} className="h">{w}</div>)}
        {cells.map((k, i) => (
          <div key={i} className={k ? `d ${days[k]?.kind ?? ''} ${k === today ? 'today' : ''}` : ''}>
            {k ? Number(k.slice(8)) : ''}
          </div>
        ))}
      </div>
      <div className="muted" style={{ marginTop: 8 }}>濃い緑：目標ライン　薄い緑：最低ライン　青：お休みチケット</div>
    </div>
  );
}

const CHECK_ROWS: { key: keyof Omit<FitnessCheck, 'date'>; label: string; unit: string }[] = [
  { key: 'chairStands', label: '30秒椅子立ち上がり', unit: '回' },
  { key: 'pushups', label: '腕立て伏せ', unit: '回' },
  { key: 'plankSec', label: 'プランク', unit: '秒' },
  { key: 'singleLegSec', label: '片足立ち', unit: '秒' },
  { key: 'forwardBendCm', label: '立位体前屈', unit: 'cm' },
];

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${48 - ((v - min) / span) * 40}`).join(' ');
  return (
    <svg className="spark" viewBox="0 0 100 56" preserveAspectRatio="none" role="img" aria-label="推移グラフ">
      <polyline points={pts} fill="none" stroke="var(--main)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Records({ state, update, today }: ScreenProps) {
  const { days, checks } = state;
  const unlocked = unlockedFamilyRewards(days);
  const achieved = achievedDays(days);
  const owned = Object.keys(state.cards);
  const normalIds = FACTS.map((_, i) => `n:${i}`);
  const nextAt = (unlocked + 1) * FAMILY_REWARD_EVERY - achieved;

  return (
    <>
      <h1>記録</h1>
      <div className="card row spread">
        <div><div className="muted">連続</div><b>{streakOf(days, today)}日</b></div>
        <div><div className="muted">最長</div><b>{longestStreak(days)}日</b></div>
        <div><div className="muted">達成日の合計</div><b>{achieved}日</b></div>
      </div>
      <Calendar days={days} today={today} />

      <h2>体力チェック</h2>
      {checks.length === 0 ? (
        <div className="card empty">まだ記録がありません。ホームから最初のチェックをしてみましょう。</div>
      ) : (
        CHECK_ROWS.map((r) => {
          const vals = checks.map((c) => c[r.key]);
          const diff = vals.at(-1)! - vals[0];
          return (
            <div className="card" key={r.key}>
              <div className="row spread">
                <b>{r.label}</b>
                <span>{vals.at(-1)}{r.unit}{vals.length > 1 && <span className="muted">（初回から {diff >= 0 ? '+' : ''}{diff}）</span>}</span>
              </div>
              <Spark values={vals} />
            </div>
          );
        })
      )}

      <h2>家族</h2>
      <div className="card">
        {state.children.length === 0 || !state.profile.fatherBirth ? (
          <div className="muted">設定で自分の生年月日とお子さんを登録すると、「お子さんが20歳のときのパパの年齢」が表示されます。</div>
        ) : (
          <ul className="plain">
            {state.children.map((c) => (
              <li key={c.id}>
                {c.photo ? <img className="avatar" src={c.photo} alt="" /> : <span className="avatar" />}
                <span>
                  {c.name}（{ageOn(c.birth, today)}歳）が20歳のとき、パパは<b>{fatherAgeWhenChildIs(state.profile.fatherBirth!, c.birth)}歳</b>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="card">
        <b>家族とのごほうび</b>
        <div className="muted">達成日が{FAMILY_REWARD_EVERY}日たまるごとに1つ解放。次まであと{nextAt}日。</div>
        {state.familyRewards.length === 0 && <div className="empty">設定で「家族とやりたいこと」を登録しましょう。</div>}
        <ul className="plain">
          {state.familyRewards.map((r, i) => (
            <li key={r.id}>
              <span className="grow" style={{ opacity: i < unlocked ? 1 : 0.4 }}>{i < unlocked ? '🔓' : '🔒'} {r.text}</span>
              {i < unlocked && (
                <button className="small" onClick={() => update((s) => ({
                  ...s,
                  familyRewards: s.familyRewards.map((x) => (x.id === r.id ? { ...x, doneAt: x.doneAt ? undefined : today } : x)),
                }))}>
                  {r.doneAt ? '行った ✓' : '行った'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <h2>カード図鑑</h2>
      <div className="muted">ノーマル {normalIds.filter((id) => state.cards[id]).length} / {normalIds.length}　そのほか {owned.filter((id) => !id.startsWith('n:')).length} 種</div>
      {owned.length === 0 && <div className="card empty">トレーニングを記録するとカードが手に入ります。</div>}
      {owned.map((id) => {
        const v = cardView(id, state);
        if (!v) return null;
        const stock = state.cards[id];
        const left = stock.count - stock.used;
        return (
          <div key={id}>
            <CardBox id={id} state={state} note={`×${stock.count}`} />
            {v.rarity === 'super' && (
              <button className="small" disabled={left <= 0} onClick={() => update((s) => useCard(s, id))}>
                引換券を使う（残り{left}枚）
              </button>
            )}
          </div>
        );
      })}
    </>
  );
}
