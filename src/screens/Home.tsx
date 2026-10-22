import { useState } from 'react';
import type { ScreenProps } from '../App';
import { useTicket, completeMission, missionOf } from '../lib/actions';
import { canRescueYesterday, levelOf, streakOf } from '../lib/rewards';
import { diffDays, monthKey } from '../lib/dates';
import { FAMILY_TEMPLATES } from '../lib/cards';
import { goalMenu, shortLabel } from '../lib/exercises';
import { amountFor, planFor } from '../lib/plan';
import { totals, weeklyReps } from '../lib/stats';
import { Muki } from '../components/Muki';
import { Hearts, MOOD_TEXT } from './Pet';
import { STAGE_NAMES, hatchPending, petView, speechFor } from '../lib/pet';

function cheerLine(state: ScreenProps['state'], today: string): string {
  const n = Number(today.replace(/-/g, ''));
  const pool: string[] = [];
  for (const c of state.children) FAMILY_TEMPLATES.forEach((t) => pool.push(t(c.name)));
  pool.push(...state.cheers);
  if (pool.length === 0) return '今日は1種目だけでも「やった日」です。';
  return pool[n % pool.length];
}

export function Home({ state, update, today, go }: ScreenProps) {
  const [dismissed, setDismissed] = useState(false);
  const [say, setSay] = useState<string>();
  const streak = streakOf(state.days, today);
  const rec = state.days[today];
  const lv = levelOf(state.profile.points);
  const pct = lv.next ? ((state.profile.points - lv.from) / (lv.next - lv.from)) * 100 : 100;
  const rotation = diffDays(today, state.profile.startDate);
  const plan = planFor(state.profile, today);
  const menu = goalMenu(rotation, plan.stretchDay);
  const checkDue = !state.checks.some((c) => c.date.slice(0, 7) === monthKey(new Date(`${today}T12:00:00`)));
  const rescue = !dismissed && canRescueYesterday(state, today);
  const weeks = weeklyReps(state, today, 2);
  const [lastWeek, thisWeek] = weeks;
  const total = totals(state);
  const pet = petView(state, today);

  return (
    <>
      <div className="brand">
        <h1>パパジム</h1>
        <span className="ticket">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3z" /><path d="M13 6v12" strokeDasharray="2 3" /></svg>
          お休みチケット {state.profile.tickets}
        </span>
      </div>

      {rescue && (
        <div className="card banner">
          <b>昨日はお休みでしたか？</b>
          <div className="muted">お休みチケットを1枚使うと、連続記録がつながります。</div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="primary grow" onClick={() => update((s) => useTicket(s, today))}>チケットを使う</button>
            <button className="grow" onClick={() => setDismissed(true)}>使わない</button>
          </div>
        </div>
      )}

      <div className="card hero room">
        <div className="pet-bubble" aria-live="polite">{say ?? (rec ? (rec.kind === 'goal' ? '今日は目標ライン達成！' : '今日は最低ライン達成！') : cheerLine(state, today))}</div>
        <Muki name={pet.name} stage={pet.stage} type={pet.type} mood={pet.mood} worn={pet.worn} size={170} onTap={() => setSay(speechFor(state, today))} />
        <div><b className="pet-name">{pet.name}</b> <span className="pill">{STAGE_NAMES[pet.stage]}</span></div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 4 }}><Hearts n={pet.genki} /><span className="muted">{MOOD_TEXT[pet.mood]}</span></div>
        <div className="divider" />
        <div className="row spread" style={{ alignItems: 'flex-end' }}>
          <div>
            <div className="muted">連続記録</div>
            <div className="streak">{streak}<small>日</small></div>
          </div>
          <span className="flame">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e4600b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9z" /></svg>
          </span>
        </div>
        <div className="divider" />
        <div className="row spread">
          <b>Lv.{lv.level} {lv.title}</b>
          <span className="muted">{state.profile.points}pt</span>
        </div>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        {lv.next && <div className="muted" style={{ marginTop: 6 }}>次のレベルまで あと {lv.next - state.profile.points}pt</div>}
      </div>

      {hatchPending(state) && (
        <button className="card banner" style={{ width: '100%', textAlign: 'left' }} onClick={() => go({ name: 'pet' })}>
          <b>たまごがかえりました！</b>
          <div className="muted">ムキたまタブで名前をつけてあげましょう ›</div>
        </button>
      )}

      {state.logs.length > 0 && (
        <button className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => go({ name: 'records' })}>
          <div className="row spread">
            <span>今週 <b>{thisWeek.reps}回</b><span className="muted">（先週より {thisWeek.reps - lastWeek.reps >= 0 ? '+' : ''}{thisWeek.reps - lastWeek.reps}回）</span></span>
            <span className="muted">あゆみを見る ›</span>
          </div>
          <div className="muted">これまでの合計 {total.reps.toLocaleString('ja-JP')}回・{total.days}日</div>
        </button>
      )}

      <div className="card">
        <div className="row spread" style={{ marginBottom: 6 }}>
          <b>今日のメニュー</b>
          <span className="pill">{plan.label}</span>
        </div>
        <ol className="menu">
          {menu.map((e) => (
            <li key={e.id} className={e.category === 'stretch' ? 'stretch' : ''}>
              <span className="name">{e.name}</span>
              <span className="qty">{shortLabel(e, amountFor(e, plan))}</span>
            </li>
          ))}
        </ol>
        {plan.recovery && <div className="muted" style={{ marginTop: 6 }}>今週は回復週。量を少し減らして、体を休めながら続けます。{plan.stretchDay ? '今日はストレッチ多めの日です。' : ''}</div>}
      </div>

      <button className="accent big" onClick={() => go({ name: 'train', menu: menu.map((e) => e.id), line: 'goal' })}>
        目標ライン（約10分）
      </button>
      <button className="big" style={{ minHeight: 54, fontSize: 15 }} onClick={() => go({ name: 'pick' })}>
        最低ライン：1種目だけ（約1分）
      </button>

      {checkDue && (
        <div className="card banner">
          <b>今月の体力チェック</b>
          <div className="muted">約10分。やった日は目標ライン達成扱いで、+50ptです。</div>
          <button className="small" style={{ marginTop: 8 }} onClick={() => go({ name: 'check' })}>チェックする</button>
        </div>
      )}

      <div className="card">
        <b>おうちミッション（任意）</b>
        <div style={{ margin: '6px 0' }}>{missionOf(today)}</div>
        <button className="small" disabled={!!state.missionDone[today]} onClick={() => update((s) => completeMission(s, today))}>
          {state.missionDone[today] ? 'やった！ (+5pt)' : 'やった (+5pt)'}
        </button>
        <div className="muted" style={{ marginTop: 6 }}>お子さんの気分次第でOK。参加を頼む必要はありません。</div>
      </div>
    </>
  );
}
