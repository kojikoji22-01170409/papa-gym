import type { ScreenProps } from '../App';
import type { SessionResult } from '../lib/actions';
import { cardView } from '../lib/cards';
import { Muki } from '../components/Muki';
import { ITEMS, STAGE_NAMES, petView } from '../lib/pet';

export function CardBox({ id, state, note }: { id: string; state: ScreenProps['state']; note?: string }) {
  const v = cardView(id, state);
  if (!v) return null;
  return (
    <div className={`gcard ${v.rarity}`}>
      <div className="row">
        {v.photo && <img src={v.photo} alt="" />}
        <div className="grow">
          <span className="pill">{v.rarity === 'normal' ? 'ノーマル' : v.rarity === 'rare' ? 'レア' : 'スーパーレア'}</span>
          {note && <span className="muted"> {note}</span>}
          <div><b>{v.title}</b></div>
        </div>
      </div>
      <div style={{ marginTop: 6 }}>{v.body}</div>
    </div>
  );
}

export function Done({ state, go, today, result }: ScreenProps & { result: SessionResult }) {
  const newIds = result.cards.filter((id, i) => state.cards[id]?.count === 1 && result.cards.indexOf(id) === i);
  const pet = petView(state, today);
  const items = result.newItems.map((id) => ITEMS.find((i) => i.id === id)?.name).filter(Boolean);
  return (
    <>
      <div className="card hero">
        <div className="muted">{result.kind === 'goal' ? '目標ライン達成！' : '最低ライン達成！'}</div>
        <div className="streak">{result.streak}<small>日連続</small></div>
        <div>+{result.pointsEarned}pt</div>
        {result.milestone && <div style={{ marginTop: 8 }}><b>🎉 {result.milestone}日連続、おめでとうございます！</b></div>}
      </div>
      <div className="card pet-card">
        <Muki name={pet.name} stage={pet.stage} type={pet.type} mood="happy" worn={pet.worn} size={140} />
        {result.grewTo !== undefined
          ? <div><b>{pet.name}が「{STAGE_NAMES[result.grewTo]}」に成長しました！🎉</b></div>
          : <div className="muted">{pet.name}もよろこんでいます</div>}
        {items.length > 0 && <div style={{ marginTop: 6 }}><b>新しい着せかえ：{items.join('、')}</b><div className="muted">ムキたまタブでつけられます</div></div>}
      </div>
      {result.cards.length > 0 && <h2>今日のカード</h2>}
      {result.cards.map((id, i) => (
        <CardBox key={`${id}-${i}`} id={id} state={state} note={newIds.includes(id) ? 'NEW' : ''} />
      ))}
      <button className="primary big" onClick={() => go({ name: 'home' })}>ホームに戻る</button>
    </>
  );
}
