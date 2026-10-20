import type { ScreenProps } from '../App';
import { CATEGORY_LABEL, EXERCISES, gifUrl, minimumPick, setLabel, type Category } from '../lib/exercises';
import { amountFor, planFor } from '../lib/plan';
import { diffDays } from '../lib/dates';

const ORDER: Category[] = ['lower', 'upper', 'core', 'stretch', 'family'];

export function Pick({ state, today, go }: ScreenProps) {
  const rec = minimumPick(diffDays(today, state.profile.startDate));
  const light = planFor(state.profile, today, true);
  const start = (id: string) => go({ name: 'train', menu: [id], line: 'min' });
  return (
    <>
      <button className="link" onClick={() => go({ name: 'home' })}>← 戻る</button>
      <h1>1種目だけ選ぶ</h1>
      <div className="card">
        <span className="pill">今日のおすすめ</span>
        <img className="gif" src={gifUrl(rec.id)} alt={`${rec.name}の動き`} />
        <div className="amount">{rec.name}</div>
        <div className="muted">{setLabel(rec, amountFor(rec, light))}</div>
        <button className="primary big" onClick={() => start(rec.id)}>これをやる</button>
      </div>
      {ORDER.map((cat) => (
        <div key={cat}>
          <h3>{CATEGORY_LABEL[cat]}{cat === 'family' ? '（任意）' : ''}</h3>
          <ul className="plain card">
            {EXERCISES.filter((e) => e.category === cat).map((e) => (
              <li key={e.id}>
                <img className="thumb" src={gifUrl(e.id)} alt="" loading="lazy" />
                <span className="grow">{e.name}<div className="muted">{setLabel(e, amountFor(e, light))}</div></span>
                <button className="small" onClick={() => start(e.id)}>やる</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
