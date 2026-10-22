import { useState } from 'react';
import type { ScreenProps } from '../App';
import { Muki } from '../components/Muki';
import { ENCYCLOPEDIA, ITEMS, MAX_GENKI, STAGE_NAMES, STAT_LABEL, TYPE_NAMES, daysToNext, hatchPending, petStats, petView, seenKey, speechFor, unlockedItems, weeklyGains, type PetStats, type Slot } from '../lib/pet';
import { streakOf } from '../lib/rewards';

export const MOOD_TEXT = { happy: 'ごきげん', normal: 'ふつう', sleepy: 'ねむい', sad: 'さみしい' } as const;

export function Hearts({ n }: { n: number }) {
  return (
    <span className="hearts" role="img" aria-label={`げんき ${n}/${MAX_GENKI}`}>
      {Array.from({ length: MAX_GENKI }, (_, i) => <i key={i} className={i < n ? 'on' : ''}>♥</i>)}
    </span>
  );
}

export function NameForm({ initial, label, onSave }: { initial: string; label: string; onSave: (n: string) => void }) {
  const [t, setT] = useState(initial);
  return (
    <div className="row">
      <input value={t} maxLength={8} aria-label="名前" onChange={(e) => setT(e.target.value)} />
      <button className="primary" disabled={!t.trim()} onClick={() => onSave(t.trim())}>{label}</button>
    </div>
  );
}

export function Pet({ state, update, today }: ScreenProps) {
  const v = petView(state, today);
  const [say, setSay] = useState(() => speechFor(state, today));
  const [rename, setRename] = useState(false);
  const stats = petStats(state);
  const gains = weeklyGains(state, today);
  const unlocked = unlockedItems(state);
  const next = daysToNext(v.activeDays);
  const hatch = hatchPending(state);
  const seen = state.pet?.seen ?? [];
  const wear = (slot: Slot, id?: string) =>
    update((s) => ({ ...s, pet: { ...s.pet, worn: { ...s.pet?.worn, [slot]: id } } }));
  const saveName = (name: string) => { update((s) => ({ ...s, pet: { ...s.pet, name } })); setRename(false); };

  return (
    <>
      <h1>ムキたま</h1>
      <div className="card pet-card">
        <div className="pet-bubble" aria-live="polite">{say}</div>
        <Muki name={v.name} stage={v.stage} type={v.type} mood={v.mood} worn={v.worn} size={190} onTap={() => setSay(speechFor(state, today))} />
        <div><b className="pet-name">{v.name}</b> <span className="pill">{STAGE_NAMES[v.stage]}{v.stage >= 3 ? `・${TYPE_NAMES[v.type]}` : ''}</span></div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 6 }}>
          <Hearts n={v.genki} /><span className="muted">{MOOD_TEXT[v.mood]}</span>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>
          やった日 {v.activeDays}日・連続 {streakOf(state.days, today)}日
          {next !== undefined && `・${STAGE_NAMES[v.stage + 1]}まであと${next}日`}
        </div>
      </div>

      {hatch && (
        <div className="card banner">
          <b>たまごがかえりました！名前をつけてあげてください</b>
          <NameForm initial="ムキたま" label="決める" onSave={saveName} />
        </div>
      )}

      <h2>ステータス</h2>
      <div className="card">
        {(Object.keys(STAT_LABEL) as (keyof PetStats)[]).map((k) => (
          <div key={k} className="stat">
            <span>{STAT_LABEL[k]}</span>
            <b>Lv.{stats[k]}</b>
            {gains[k] ? <span className="gain">今週 +{gains[k]}</span> : <span />}
          </div>
        ))}
        <div className="muted" style={{ marginTop: 6 }}>トレーニングの記録から自動で決まります。さぼっても下がりません。</div>
      </div>

      <h2>着せかえ</h2>
      <div className="card">
        <div className="items">
          {ITEMS.map((it) => {
            const ok = unlocked.includes(it.id);
            const on = v.worn?.[it.slot] === it.id;
            return (
              <button key={it.id} disabled={!ok} className={on ? 'on' : ''} aria-pressed={on} onClick={() => wear(it.slot, on ? undefined : it.id)}>
                <b>{ok ? it.name : '？？？'}</b>
                <span className="muted">{ok ? (on ? 'つけている' : 'つける') : it.cond}</span>
              </button>
            );
          })}
        </div>
      </div>

      <h2>ずかん</h2>
      <div className="card">
        <ul className="dex">
          {ENCYCLOPEDIA.map((e) => {
            const got = seen.includes(e.key) || e.key === seenKey(v.stage, v.type);
            return (
              <li key={e.key} className={got ? '' : 'lock'}>
                {got ? <Muki name={e.label} stage={e.stage} type={e.type} mood="normal" size={64} /> : <span className="muki dex-unknown" style={{ width: 64, height: 64 }}>？</span>}
                <span>{got ? e.label : '？？？'}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {!hatch && (
        <div className="card">
          {rename ? <NameForm initial={v.name} label="保存" onSave={saveName} /> : <button onClick={() => setRename(true)}>名前を変える</button>}
        </div>
      )}
    </>
  );
}
