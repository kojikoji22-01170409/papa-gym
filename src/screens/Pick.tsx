import type { ScreenProps } from '../App';
import { CATEGORY_LABEL, EXERCISES, goalMenu, setLabel, type Category } from '../lib/exercises';
import { diffDays } from '../lib/dates';

const ORDER: Category[] = ['lower', 'upper', 'core', 'stretch', 'family'];

export function Pick({ state, today, go }: ScreenProps) {
  const rec = goalMenu(diffDays(today, state.profile.startDate))[0];
  const start = (id: string) => go({ name: 'train', menu: [id], line: 'min' });
  return (
    <>
      <button className="link" onClick={() => go({ name: 'home' })}>← 戻る</button>
      <h1>1種目だけ選ぶ</h1>
      <div className="card">
        <span className="pill">今日のおすすめ</span>
        <div className="amount">{rec.name}</div>
        <div className="muted">{setLabel(rec, state.profile.amounts[rec.id] ?? rec.amount)}</div>
        <button className="primary big" onClick={() => start(rec.id)}>これをやる</button>
      </div>
      {ORDER.map((cat) => (
        <div key={cat}>
          <h3>{CATEGORY_LABEL[cat]}{cat === 'family' ? '（任意）' : ''}</h3>
          <ul className="plain card">
            {EXERCISES.filter((e) => e.category === cat).map((e) => (
              <li key={e.id}>
                <span className="grow">{e.name}<div className="muted">{setLabel(e, state.profile.amounts[e.id] ?? e.amount)}</div></span>
                <button className="small" onClick={() => start(e.id)}>やる</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
