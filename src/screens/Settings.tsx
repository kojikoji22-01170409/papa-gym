import { useRef, useState } from 'react';
import type { ScreenProps } from '../App';
import { exportJson, newState, parseBackup } from '../lib/store';
import type { State } from '../lib/types';

const uid = () => Math.random().toString(36).slice(2, 10);

/** Shrinks a chosen photo so it stays small in IndexedDB; it never leaves the device. */
function resizePhoto(file: File, max = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('画像を読み込めませんでした'));
    img.src = url;
  });
}

function AddLine({ placeholder, onAdd }: { placeholder: string; onAdd: (text: string) => void }) {
  const [t, setT] = useState('');
  return (
    <div className="row">
      <input value={t} placeholder={placeholder} onChange={(e) => setT(e.target.value)} />
      <button className="primary" disabled={!t.trim()} onClick={() => { onAdd(t.trim()); setT(''); }}>追加</button>
    </div>
  );
}

export function Settings({ state, update, replace }: ScreenProps & { replace: (s: State) => void }) {
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [photo, setPhoto] = useState<string>();
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);

  const addChild = () => {
    update((s) => ({ ...s, children: [...s.children, { id: uid(), name: name.trim(), birth, photo }] }));
    setName(''); setBirth(''); setPhoto(undefined);
    if (file.current) file.current.value = '';
  };

  const download = () => {
    const blob = new Blob([exportJson(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `papa-gym-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const restore = async (f: File) => {
    try {
      const restored = parseBackup(await f.text());
      if (confirm('今のデータをバックアップの内容で置き換えます。よろしいですか？')) {
        replace(restored);
        setMsg('復元しました');
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : '復元に失敗しました');
    }
  };

  return (
    <>
      <h1>設定</h1>

      <h2>自分</h2>
      <div className="card">
        <label>生年月日（年月）</label>
        <input type="month" value={state.profile.fatherBirth ?? ''} onChange={(e) => update((s) => ({ ...s, profile: { ...s.profile, fatherBirth: e.target.value || undefined } }))} />
        <div className="muted">お子さんが20歳のときの年齢の表示に使います。</div>
      </div>

      <h2>お子さん</h2>
      <div className="card">
        <ul className="plain">
          {state.children.map((c) => (
            <li key={c.id}>
              {c.photo ? <img className="avatar" src={c.photo} alt="" /> : <span className="avatar" />}
              <span className="grow">{c.name}<div className="muted">{c.birth}</div></span>
              <button className="small danger" onClick={() => confirm(`${c.name}さんを削除しますか？`) && update((s) => ({ ...s, children: s.children.filter((x) => x.id !== c.id) }))}>削除</button>
            </li>
          ))}
        </ul>
        <label>呼び名</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>生年月</label>
        <input type="month" value={birth} onChange={(e) => setBirth(e.target.value)} />
        <label>写真（任意・端末内にだけ保存されます）</label>
        <input ref={file} type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) setPhoto(await resizePhoto(f)); }} />
        <button className="primary big" disabled={!name.trim() || !birth} onClick={addChild}>お子さんを追加</button>
      </div>

      <h2>家族からもらった言葉</h2>
      <div className="card">
        <div className="muted">実際に言われた言葉を入れると、レアカードとして出てきます。</div>
        <ul className="plain">
          {state.cheers.map((c, i) => (
            <li key={i}><span className="grow">{c}</span>
              <button className="small danger" onClick={() => update((s) => ({ ...s, cheers: s.cheers.filter((_, k) => k !== i) }))}>削除</button></li>
          ))}
        </ul>
        <AddLine placeholder="例：パパ、かっこいい！" onAdd={(t) => update((s) => ({ ...s, cheers: [...s.cheers, t] }))} />
      </div>

      <h2>家族とやりたいこと</h2>
      <div className="card">
        <div className="muted">上から順に、達成日が7日たまるごとに1つ解放されます。</div>
        <ul className="plain">
          {state.familyRewards.map((r) => (
            <li key={r.id}><span className="grow">{r.text}</span>
              <button className="small danger" onClick={() => update((s) => ({ ...s, familyRewards: s.familyRewards.filter((x) => x.id !== r.id) }))}>削除</button></li>
          ))}
        </ul>
        <AddLine placeholder="例：週末に息子と公園でサッカー" onAdd={(t) => update((s) => ({ ...s, familyRewards: [...s.familyRewards, { id: uid(), text: t }] }))} />
      </div>

      <h2>自分へのごほうび</h2>
      <div className="card">
        <div className="muted">スーパーレアカード（約5%）の引換券になります。</div>
        <ul className="plain">
          {state.selfRewards.map((r) => (
            <li key={r.id}><span className="grow">{r.text}</span>
              <button className="small danger" onClick={() => update((s) => ({ ...s, selfRewards: s.selfRewards.filter((x) => x.id !== r.id) }))}>削除</button></li>
          ))}
        </ul>
        <AddLine placeholder="例：好きなコーヒー豆を買う" onAdd={(t) => update((s) => ({ ...s, selfRewards: [...s.selfRewards, { id: uid(), text: t }] }))} />
      </div>

      <h2>バックアップ</h2>
      <div className="card">
        <div className="muted">データはこの端末のブラウザ内にだけあります。機種変更や、Safariのデータ消去に備えて、ときどき書き出してください。</div>
        <div className="row" style={{ marginTop: 8 }}>
          <button className="grow" onClick={download}>書き出す</button>
          <label className="btn grow" style={{ margin: 0, textAlign: 'center', color: 'inherit', fontSize: 16 }}>
            読み込む
            <input type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
          </label>
        </div>
        {msg && <div className="muted" style={{ marginTop: 8 }}>{msg}</div>}
        <button className="danger small" style={{ marginTop: 16 }} onClick={() => confirm('すべての記録を削除します。元に戻せません。よろしいですか？') && replace(newState())}>
          すべてのデータを削除
        </button>
      </div>
    </>
  );
}
