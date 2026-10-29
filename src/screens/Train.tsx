import { useEffect, useRef, useState } from 'react';
import type { ScreenProps } from '../App';
import { byId, gifUrl, setLabel } from '../lib/exercises';
import { amountFor, planFor, TOP_STAGE } from '../lib/plan';
import { completeSession } from '../lib/actions';
import type { ExerciseLog, Feel } from '../lib/types';
import { Rest } from './Rest';

export const DEFAULT_REST_SEC = 30;

const FEEL: { feel: Feel; label: string }[] = [
  { feel: 'normal', label: 'できた（ちょうどいい）' },
  { feel: 'easy', label: '楽だった' },
  { feel: 'hard', label: 'きつかった' },
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

  const plan = planFor(state.profile, today, line === 'min');
  const amount = amountFor(ex, plan);
  const topStage = plan.stage === TOP_STAGE && !plan.recovery && !plan.light;

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
    // Rest (with the health quiz) after strength moves on the goal line; stretches flow straight on,
    // and the 1-exercise minimum line stays instant.
    if (line === 'goal' && restSec > 0 && idx + 1 < menu.length && ex.category !== 'stretch') setResting(true);
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
        <div className="progress">
          <div className="bar"><i style={{ width: `${((idx + 1) / menu.length) * 100}%` }} /></div>
          <span className="muted">{idx + 1} / {menu.length}</span>
        </div>
      </div>
      <div className="card">
        <img className="gif" src={gifUrl(ex.id)} alt={`${ex.name}の動き`} />
        <div className="legend">
          <span><i className={ex.category === 'stretch' ? 'dot stretch' : 'dot work'} />{ex.category === 'stretch' ? '伸びる場所' : '効く場所'}</span>
          <span><i className="dot arrow" />動かす向き</span>
          <span><i className="dot ghost" />スタートの形</span>
        </div>
        <h1>{ex.name}</h1>
        <div className="amount">{setLabel(ex, amount)}</div>
        <span className="pill">{ex.category === 'stretch' ? '伸ばす場所' : '効く場所'}：{ex.muscles}</span>
        {ex.unit === 'sec' && <Countdown seconds={amount} />}
        <h3>やり方</h3>
        <ol className="steps">{ex.steps.map((t) => <li key={t}>{t}</li>)}</ol>
        <div className="benefit">
          <b>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l2.6 6.4L21 9l-5 4.4L17.5 20 12 16.6 6.5 20 8 13.4 3 9l6.4-.6z" /></svg>
            この種目の効能
          </b>
          {ex.benefit}
        </div>
        {topStage && ex.hard && <div className="card banner"><b>レベルアップ版</b><br />{ex.hard}</div>}
        {ex.easy && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'inherit' }}>
            <input type="checkbox" style={{ width: 24, minHeight: 24 }} checked={easy} onChange={(e) => setEasy(e.target.checked)} />
            <span>やさしい版にする{easy ? `：${ex.easy}` : ''}</span>
          </label>
        )}
        <p className="muted">痛みや違和感があるときは無理せず中止してください。</p>
      </div>
      <div className="feel done">
        {FEEL.map((f) => (
          <button key={f.feel} className={f.feel === 'normal' ? 'accent' : ''} onClick={() => complete(f.feel)}>{f.label}</button>
        ))}
        {menu.length > 1 && <button className="link" onClick={() => next(done)}>この種目はスキップ</button>}
      </div>
    </>
  );
}
