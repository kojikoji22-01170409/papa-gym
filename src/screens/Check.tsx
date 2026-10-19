import { useState } from 'react';
import type { ScreenProps } from '../App';
import { saveCheck } from '../lib/actions';

const FIELDS = [
  { key: 'chairStands', label: '30秒椅子立ち上がり（回）', hint: '椅子から立って座る動作を30秒で何回できるか' },
  { key: 'pushups', label: '腕立て伏せ（回）', hint: '正しいフォームで続けられる最大回数。膝つきでも可（毎回同じ方法で）' },
  { key: 'plankSec', label: 'プランク（秒）', hint: '姿勢を保てた秒数（最大120）' },
  { key: 'singleLegSec', label: '片足立ち（秒）', hint: '目を開けて立てた秒数。左右の短い方（最大120）' },
  { key: 'forwardBendCm', label: '立位体前屈（cm）', hint: '指先が床に着けば0、床より下に届けばプラス、届かなければマイナス' },
] as const;

export function Check({ state, update, today, go }: ScreenProps) {
  const last = state.checks.at(-1);
  const [v, setV] = useState<Record<string, string>>({});
  const ready = FIELDS.every((f) => v[f.key] !== undefined && v[f.key] !== '' && !Number.isNaN(Number(v[f.key])));

  const save = () => {
    const nums = Object.fromEntries(FIELDS.map((f) => [f.key, Number(v[f.key])])) as Record<(typeof FIELDS)[number]['key'], number>;
    let result!: ReturnType<typeof saveCheck>;
    update((s) => { result = saveCheck(s, today, { date: today, ...nums }); return result.state; });
    go({ name: 'done', result });
  };

  return (
    <>
      <button className="link" onClick={() => go({ name: 'home' })}>← 戻る</button>
      <h1>今月の体力チェック</h1>
      <p className="muted">他人ではなく、先月の自分と比べるためのものです。無理のない範囲で、毎回同じやり方で測ってください。</p>
      {FIELDS.map((f) => (
        <div key={f.key}>
          <label>{f.label}{last ? `（前回 ${last[f.key]}）` : ''}</label>
          <input inputMode="decimal" type="number" value={v[f.key] ?? ''} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          <div className="muted">{f.hint}</div>
        </div>
      ))}
      <button className="primary big" disabled={!ready} onClick={save}>記録する</button>
    </>
  );
}
