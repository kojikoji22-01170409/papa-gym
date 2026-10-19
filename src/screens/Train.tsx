import { useEffect, useRef, useState } from 'react';
import type { ScreenProps } from '../App';
import { byId, gifUrl, setLabel } from '../lib/exercises';
import { suggestAmount } from '../lib/rewards';
import { completeSession } from '../lib/actions';
import type { ExerciseLog, Feel } from '../lib/types';
import { Rest } from './Rest';

export const DEFAULT_REST_SEC = 30;

const FEEL: { feel: Feel; label: string }[] = [
  { feel: 'easy', label: 'できた（楽だった）' },
  { feel: 'normal', label: 'できた（ちょうどいい）' },
  { feel: 'hard', label: 'できた（きつかった）' },
];

function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const id = useRef<number | undefined>(undefined);
  useEffect(() => { setLeft(seconds); setRunning(false); }, [seconds]);
  useEffect(() => {
    if (!running) return;
    id.current = window.setInterval(() => setLeft((l) => (l <= 1 ? (window.clearInterval(id.current), setRunning(false), 0) : l - 1)), 1000);
    return () => window.clearInterval(id.current);
  }, [running]);
  return (
    <div>
      <div className="timer">{left}<small style={{ fontSize: 20 }}>秒</small></div>
      <button className="big" onClick={() => { if (left === 0) setLeft(seconds); setRunning((r) => !r); }}>
        {running ? '一時停止' : left === seconds ? 'タイマー開始' : left === 0 ? 'もう一度' : '再開'}
      </button>
    </div>
  );
}

export function Train({ state, update, today, go, menu, line }: ScreenProps & { menu: string[]; line: 'min' | 'goal' }) {
  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState<ExerciseLog[]>([]);
  const [easy, setEasy] = useState(false);
  const [resting, setResting] = useState(false);
  const ex = byId(menu[idx]);
  if (!ex) return null;
  const restSec = state.profile.restSec ?? DEFAULT_REST_SEC;

  const amount = state.profile.amounts[ex.id] ?? ex.amount;
  const suggestion = suggestAmount(state.logs, ex, amount);

  const finish = (logs: ExerciseLog[]) => {
    if (logs.length === 0) { go({ name: 'home' }); return; }
    const kind = line === 'goal' && logs.length === menu.length ? 'goal' : 'min';
    let result!: ReturnType<typeof completeSession>;
    update((s) => { result = completeSession(s, today, kind, logs); return result.state; });
    go({ name: 'done', result });
  };

  const next = (logs: ExerciseLog[]) => {
    setEasy(false);
    if (idx + 1 >= menu.length) finish(logs);
    else setIdx(idx + 1);
  };

  const afterExercise = (logs: ExerciseLog[]) => {
    // Rest (with the health quiz) only on the goal line; the 1-exercise minimum line stays instant.
    if (line === 'goal' && restSec > 0 && idx + 1 < menu.length) setResting(true);
    else next(logs);
  };

  const complete = (feel: Feel) => {
    const logs = [...done, { date: today, exerciseId: ex.id, amount, easyVariant: easy, feel }];
    setDone(logs);
    afterExercise(logs);
  };

  if (resting) {
    const upcoming = byId(menu[idx + 1])!;
    return (
      <>
        <div className="row spread">
          <button className="link" onClick={() => finish(done)}>ここで終わる</button>
          <span className="muted">{idx + 1} / {menu.length} 完了</span>
        </div>
        <Rest state={state} update={update} today={today} seconds={restSec} next={upcoming}
          onNext={() => { setResting(false); next(done); }} />
      </>
    );
  }

  return (
    <>
      <div className="row spread">
        <button className="link" onClick={() => (done.length ? finish(done) : go({ name: 'home' }))}>
          {done.length ? 'ここで終わる' : '← やめる'}
        </button>
        <span className="muted">{idx + 1} / {menu.length}</span>
      </div>
      <div className="card">
        <img className="gif" src={gifUrl(ex.id)} alt={`${ex.name}の動き`} />
        <h1>{ex.name}</h1>
        <div className="amount">{setLabel(ex, amount)}</div>
        <p>{ex.how}</p>
        {ex.easy && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'inherit' }}>
            <input type="checkbox" style={{ width: 24, minHeight: 24 }} checked={easy} onChange={(e) => setEasy(e.target.checked)} />
            <span>やさしい版にする{easy ? `：${ex.easy}` : ''}</span>
          </label>
        )}
        <p className="muted">痛みや違和感があるときは無理せず中止してください。</p>
        {ex.unit === 'sec' && <Countdown seconds={amount} />}
      </div>
      {suggestion && (
        <div className="card banner">
          最近3回とも楽でした。{ex.unit === 'reps' ? `${amount}回 → ${suggestion}回` : `${amount}秒 → ${suggestion}秒`} に増やしますか？
          <div className="row" style={{ marginTop: 8 }}>
            <button className="small primary" onClick={() => update((s) => ({ ...s, profile: { ...s.profile, amounts: { ...s.profile.amounts, [ex.id]: suggestion } } }))}>増やす</button>
            <span className="muted">そのままならこのまま進めてください</span>
          </div>
        </div>
      )}
      <div className="feel">
        {FEEL.map((f) => (
          <button key={f.feel} className={f.feel === 'normal' ? 'primary' : ''} onClick={() => complete(f.feel)}>{f.label}</button>
        ))}
        {menu.length > 1 && <button className="link" onClick={() => next(done)}>この種目はスキップ</button>}
      </div>
    </>
  );
}
