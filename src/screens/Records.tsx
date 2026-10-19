import { useEffect, useRef } from 'react';
import type { ScreenProps } from '../App';
import { achievedDays, FAMILY_REWARD_EVERY, streakOf, unlockedFamilyRewards } from '../lib/rewards';
import { addDays, ageOn, fatherAgeWhenChildIs } from '../lib/dates';
import { byId } from '../lib/exercises';
import {
  dayBadges, dayLabel, growth, heatmap, perExercise, repBadges, timeline, totals, weeklyReps,
  type HeatCell,
} from '../lib/stats';
import { FACTS, cardView } from '../lib/cards';
import { useCard } from '../lib/actions';
import type { DayRecord, FitnessCheck } from '../lib/types';
import { CardBox } from './Done';

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

const HEAT = ['#ece8da', '#cfe3dc', '#9bc7b9', '#4f9a85', '#1f6f5c'];
const STEP = 13;

function Heatmap({ cells }: { cells: HeatCell[][] }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => { if (box.current) box.current.scrollLeft = box.current.scrollWidth; }, []);
  const width = cells.length * STEP + 4;
  return (
    <div className="card heat" ref={box}>
      <svg width={width} height={7 * STEP + 22} role="img" aria-label="1年間の記録カレンダー">
        {cells.map((week, w) => {
          const first = week[0].date;
          const newMonth = Number(first.slice(8)) <= 7;
          return (
            <g key={first} transform={`translate(${w * STEP + 2},0)`}>
              {newMonth && <text x="0" y="10" fontSize="10" fill="var(--sub)">{Number(first.slice(5, 7))}月</text>}
              {week.map((c, d) => (
                <rect key={c.date} y={16 + d * STEP} width="11" height="11" rx="2.5"
                  fill={c.future ? 'none' : c.rest ? 'var(--rest)' : HEAT[c.level]} />
              ))}
            </g>
          );
        })}
      </svg>
      <div className="muted">濃いほど、その日にやった量が多い日です（青はお休みチケット）。</div>
    </div>
  );
}

function WeeklyBars({ weeks }: { weeks: { start: string; reps: number }[] }) {
  const max = Math.max(10, ...weeks.map((w) => w.reps));
  const bw = 22;
  const step = 29;
  return (
    <svg viewBox="0 0 360 140" width="100%" role="img" aria-label="週ごとの合計回数">
      {weeks.map((w, i) => {
        const h = (w.reps / max) * 90;
        const last = i === weeks.length - 1;
        return (
          <g key={w.start} transform={`translate(${6 + i * step},0)`}>
            <rect y={106 - h} width={bw} height={Math.max(h, 1)} rx="4" fill={last ? 'var(--accent)' : 'var(--main)'} fillOpacity={last ? 1 : 0.7} />
            {(last || w.reps >= max * 0.9) && w.reps > 0 && <text x={bw / 2} y={100 - h} textAnchor="middle" fontSize="11" fill="var(--ink)">{w.reps}</text>}
            {i % 3 === 0 && <text x={bw / 2} y="124" textAnchor="middle" fontSize="10" fill="var(--sub)">{dayLabel(w.start)}</text>}
          </g>
        );
      })}
      <line x1="0" x2="360" y1="107" y2="107" stroke="var(--line)" />
    </svg>
  );
}

const holdText = (sec: number) => (sec >= 60 ? `${Math.floor(sec / 60)}分${sec % 60}秒` : `${sec}秒`);

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
  const t = totals(state);
  const cells = heatmap(state, today);
  const weeks = weeklyReps(state, today);
  const thisWeek = weeks.at(-1)!;
  const lastWeek = weeks.at(-2) ?? thisWeek;
  const grown = growth(state);
  const ranking = perExercise(state).slice(0, 5);
  const nextRep = repBadges(t.reps).find((b) => !b.earned);
  const events = timeline(state);

  return (
    <>
      <h1>あゆみ</h1>
      <div className="card">
        <div className="stats3">
          <div><div className="muted">累計回数</div><b>{t.reps.toLocaleString('ja-JP')}<small>回</small></b></div>
          <div><div className="muted">キープ時間</div><b>{holdText(t.holdSec)}</b></div>
          <div><div className="muted">やった日</div><b>{t.days}<small>日</small></b></div>
          <div><div className="muted">連続</div><b>{streakOf(days, today)}<small>日</small></b></div>
          <div><div className="muted">最長</div><b>{longestStreak(days)}<small>日</small></b></div>
          <div><div className="muted">目標ライン達成</div><b>{t.goalDays}<small>日</small></b></div>
        </div>
        <div className="muted" style={{ marginTop: 8, textAlign: 'center' }}>
          集めたカード {t.cards}枚{t.quizAnswered > 0 && `　健康クイズ ${t.quizCorrect}/${t.quizAnswered}問正解`}
        </div>
      </div>

      <h2>1年のカレンダー</h2>
      <Heatmap cells={cells} />

      <h2>週ごとの回数</h2>
      <div className="card">
        <div>
          今週 <b>{thisWeek.reps}回</b>
          {weeks.length > 1 && <span className="muted">（先週より {thisWeek.reps - lastWeek.reps >= 0 ? '+' : ''}{thisWeek.reps - lastWeek.reps}回）</span>}
        </div>
        <WeeklyBars weeks={weeks} />
      </div>

      <h2>成長の記録</h2>
      {grown.length === 0 ? (
        <div className="card empty">同じ種目を続けると、回数の変化がここに出ます。</div>
      ) : (
        <ul className="plain card">
          {grown.map((g) => {
            const e = byId(g.id)!;
            const u = e.unit === 'reps' ? '回' : '秒';
            return (
              <li key={g.id}>
                <span className="grow"><b>{e.name}</b>
                  {g.current !== g.first && <div>最初 {g.first}{u} → 今 <b>{g.current}{u}</b></div>}
                  {g.graduatedEasyOn && <div className="muted">{g.graduatedEasyOn.replace(/-/g, '/')} から、やさしい版を卒業</div>}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <h2>種目ランキングとバッジ</h2>
      <div className="card">
        {ranking.length === 0 && <div className="empty">まだ記録がありません。</div>}
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          {ranking.map((r) => (
            <li key={r.id}>{byId(r.id)?.name}　<b>{r.times}回</b>
              <span className="muted">（{r.reps > 0 ? `${r.reps}レップ` : holdText(r.holdSec)}）</span></li>
          ))}
        </ol>
        <h3>累計回数</h3>
        {repBadges(t.reps).map((b) => <span key={b.at} className={`badge ${b.earned ? 'on' : ''}`}>{b.label}</span>)}
        {nextRep && <div className="muted">次の「累計{nextRep.at.toLocaleString('ja-JP')}回」まで あと {(nextRep.at - t.reps).toLocaleString('ja-JP')}回</div>}
        <h3>やった日</h3>
        {dayBadges(t.days).map((b) => <span key={b.at} className={`badge ${b.earned ? 'on' : ''}`}>{b.label}</span>)}
      </div>

      <h2>ふりかえり年表</h2>
      {events.length === 0 ? (
        <div className="card empty">最初の記録から、節目がここに並びます。</div>
      ) : (
        <ul className="plain card tl">
          {[...events].reverse().map((e, i) => (
            <li key={`${e.date}-${i}`}><span className="date">{e.date.slice(2).replace(/-/g, '/')}</span><span>{e.title}</span></li>
          ))}
        </ul>
      )}

      <h2>体力チェックの推移</h2>
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
