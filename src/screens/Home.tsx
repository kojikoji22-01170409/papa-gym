import { useState } from 'react';
import type { ScreenProps } from '../App';
import { useTicket, completeMission, missionOf } from '../lib/actions';
import { canRescueYesterday, levelOf, streakOf } from '../lib/rewards';
import { diffDays, monthKey } from '../lib/dates';
import { FAMILY_TEMPLATES } from '../lib/cards';
import { goalMenu } from '../lib/exercises';
import { totals, weeklyReps } from '../lib/stats';

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
  const streak = streakOf(state.days, today);
  const rec = state.days[today];
  const lv = levelOf(state.profile.points);
  const pct = lv.next ? ((state.profile.points - lv.from) / (lv.next - lv.from)) * 100 : 100;
  const rotation = diffDays(today, state.profile.startDate);
  const checkDue = !state.checks.some((c) => c.date.slice(0, 7) === monthKey(new Date(`${today}T12:00:00`)));
  const rescue = !dismissed && canRescueYesterday(state, today);
  const weeks = weeklyReps(state, today, 2);
  const [lastWeek, thisWeek] = weeks;
  const total = totals(state);

  return (
    <>
      <div className="row spread">
        <h1>パパジム</h1>
        <span className="pill">🎟 お休みチケット {state.profile.tickets}</span>
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

      <div className="card hero">
        <div className="muted">連続記録</div>
        <div className="streak">{streak}<small>日</small></div>
        <div>{rec ? (rec.kind === 'goal' ? '今日は目標ライン達成！' : '今日は最低ライン達成！') : '今日はまだこれから'}</div>
        <div className="muted" style={{ marginTop: 6 }}>{cheerLine(state, today)}</div>
      </div>

      <div className="card">
        <div className="row spread">
          <b>Lv.{lv.level} {lv.title}</b>
          <span className="muted">{state.profile.points}pt</span>
        </div>
        <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        {lv.next && <div className="muted">次のレベルまで あと {lv.next - state.profile.points}pt</div>}
      </div>

      {state.logs.length > 0 && (
        <button className="card" style={{ width: '100%', textAlign: 'left' }} onClick={() => go({ name: 'records' })}>
          <div className="row spread">
            <span>今週 <b>{thisWeek.reps}回</b><span className="muted">（先週より {thisWeek.reps - lastWeek.reps >= 0 ? '+' : ''}{thisWeek.reps - lastWeek.reps}回）</span></span>
            <span className="muted">あゆみを見る ›</span>
          </div>
          <div className="muted">これまでの合計 {total.reps.toLocaleString('ja-JP')}回・{total.days}日</div>
        </button>
      )}

      <button className="primary big" onClick={() => go({ name: 'pick' })}>
        最低ライン：1種目だけやる（約1分）
      </button>
      <button className="accent big" onClick={() => go({ name: 'train', menu: goalMenu(rotation).map((e) => e.id), line: 'goal' })}>
        目標ライン：今日のメニュー（約5〜10分）
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
