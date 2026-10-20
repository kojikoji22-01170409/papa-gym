import { useCallback, useEffect, useRef, useState } from 'react';
import { applyMonthlyTickets } from './lib/rewards';
import { dayKey } from './lib/dates';
import { withPlan } from './lib/plan';
import { loadState, newState, saveState } from './lib/store';
import type { SessionResult } from './lib/actions';
import type { State } from './lib/types';
import { Home } from './screens/Home';
import { Pick } from './screens/Pick';
import { Train } from './screens/Train';
import { Done } from './screens/Done';
import { Check } from './screens/Check';
import { Records } from './screens/Records';
import { Settings } from './screens/Settings';

export type View =
  | { name: 'home' }
  | { name: 'records' }
  | { name: 'settings' }
  | { name: 'pick' }
  | { name: 'check' }
  | { name: 'train'; menu: string[]; line: 'min' | 'goal' }
  | { name: 'done'; result: SessionResult };

const TABS = [
  ['home', 'ホーム', <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>],
  ['records', 'あゆみ', <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />],
  ['settings', '設定', <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2L10 21h4l.6-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" /></>],
] as const;

export type Update = (fn: (s: State) => State) => void;

export function App() {
  const [state, setState] = useState<State>();
  const [view, setView] = useState<View>({ name: 'home' });
  const ref = useRef<State | undefined>(undefined);
  const [today, setToday] = useState(() => dayKey());

  const commit = useCallback((next: State) => {
    ref.current = next;
    setState(next);
    void saveState(next);
  }, []);

  const update: Update = useCallback((fn) => commit(fn(ref.current!)), [commit]);

  useEffect(() => {
    (async () => {
      const loaded = (await loadState()) ?? newState();
      const t = dayKey();
      commit(withPlan({ ...loaded, profile: applyMonthlyTickets(loaded.profile, t) }, t));
      void navigator.storage?.persist?.();
    })();
  }, [commit]);

  // Re-evaluate "today" when the app comes back to the foreground (e.g. next morning).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      const t = dayKey();
      setToday(t);
      if (ref.current) commit({ ...ref.current, profile: applyMonthlyTickets(ref.current.profile, t) });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [commit]);

  if (!state) return <div className="app muted">読み込み中…</div>;

  const props = { state, update, today, go: setView };
  const tab = view.name === 'home' || view.name === 'records' || view.name === 'settings' ? view.name : undefined;

  return (
    <div className="app">
      {view.name === 'home' && <Home {...props} />}
      {view.name === 'records' && <Records {...props} />}
      {view.name === 'settings' && <Settings {...props} replace={commit} />}
      {view.name === 'pick' && <Pick {...props} />}
      {view.name === 'check' && <Check {...props} />}
      {view.name === 'train' && <Train {...props} menu={view.menu} line={view.line} />}
      {view.name === 'done' && <Done {...props} result={view.result} />}
      {tab && (
        <nav className="tabs">
          {TABS.map(([k, label, icon]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setView({ name: k } as View)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

export interface ScreenProps {
  state: State;
  update: Update;
  today: string;
  go: (v: View) => void;
}
