import { useCallback, useEffect, useRef, useState } from 'react';
import { applyMonthlyTickets } from './lib/rewards';
import { dayKey } from './lib/dates';
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
      commit({ ...loaded, profile: applyMonthlyTickets(loaded.profile, t) });
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
          {([['home', 'ホーム'], ['records', '記録'], ['settings', '設定']] as const).map(([k, label]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setView({ name: k } as View)}>
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
