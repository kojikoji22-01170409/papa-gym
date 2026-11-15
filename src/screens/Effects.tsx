import { useState } from 'react';
import type { ScreenProps } from '../App';
import { Rings } from '../components/Rings';
import {
  AREA_LABEL, ONIGIRI_KCAL, PHASES, STRENGTH_DAYS_TARGET, STRENGTH_MIN_HIGH, STRENGTH_MIN_LOW,
  achievedWeeks, averageGain, checkChanges, phaseIndex, totalKcal, trainingWeek, weekEffect, type Area,
} from '../lib/effects';

export function weekLine(strengthDays: number, daysLeft: number): string {
  if (strengthDays >= STRENGTH_DAYS_TARGET) return '今週の筋トレ基準（週2日以上）を達成しました！';
  const need = STRENGTH_DAYS_TARGET - strengthDays;
  return `今週の筋トレ基準まで あと${need}日（今週はあと${daysLeft}日あります）`;
}

export function Effects({ state, update, today, go }: ScreenProps) {
  const week = weekEffect(state, today);
  const weeks = achievedWeeks(state);
  const tw = trainingWeek(state, today);
  const cur = tw === 0 ? -1 : phaseIndex(tw);
  const changes = checkChanges(state.checks);
  const gain = averageGain(changes);
  const kcal = totalKcal(state);
  const [kg, setKg] = useState(state.profile.weightKg ? String(state.profile.weightKg) : '');
  const minPct = Math.min(100, (week.strengthMin / STRENGTH_MIN_HIGH) * 100);
  const missing = (Object.keys(AREA_LABEL) as Area[]).filter((a) => !week.areas[a]).map((a) => AREA_LABEL[a]);

  const saveKg = () => {
    const v = Number(kg);
    update((s) => ({ ...s, profile: { ...s.profile, weightKg: v >= 30 && v <= 200 ? Math.round(v * 10) / 10 : undefined } }));
  };

  return (
    <>
      <h1>からだの成果</h1>
      <div className="muted">毎日のトレーニングが、健康の目安にどれだけ近づいているかを見ます。</div>

      <h2>今週の健康リング</h2>
      <div className="card">
        <Rings week={week} size={96} />
        <div style={{ textAlign: 'center', marginTop: 8 }}><b>{weekLine(week.strengthDays, week.daysLeft)}</b></div>
        {week.areaCount < 3 && week.areaCount > 0 && <div className="muted" style={{ textAlign: 'center' }}>まだ動かしていない部位：{missing.join('・')}</div>}
        <div className="divider" />
        <div className="row spread">
          <span>基準を達成した週（累計）</span>
          <b>{weeks}週</b>
        </div>
        <div className="muted">リングは毎週月曜にリセットされますが、達成した週の累計は減りません。</div>
        <div className="muted" style={{ marginTop: 6 }}>根拠：厚生労働省「身体活動・運動ガイド2023」（筋トレ週2〜3日）、ACSM（柔軟性運動 週2〜3日以上）。</div>
      </div>

      <h2>今週の筋トレ時間</h2>
      <div className="card">
        <div className="row spread"><span>今週 <b>約{week.strengthMin}分</b></span><span className="muted">目安 週{STRENGTH_MIN_LOW}〜{STRENGTH_MIN_HIGH}分</span></div>
        <div className="meter" aria-label={`筋トレ時間 約${week.strengthMin}分`}>
          <span className="band" style={{ left: `${(STRENGTH_MIN_LOW / STRENGTH_MIN_HIGH) * 100}%` }} />
          <i style={{ width: `${minPct}%` }} />
        </div>
        <div className="row spread muted"><span>0分</span><span>{STRENGTH_MIN_LOW}分</span><span>{STRENGTH_MIN_HIGH}分</span></div>
        <div style={{ marginTop: 8 }}>
          {week.strengthMin >= STRENGTH_MIN_LOW ? '研究で効果が見られた範囲に入っています。' : `この目安の範囲まで あと約${STRENGTH_MIN_LOW - week.strengthMin}分。1日5〜10分でも、積み重ねるとここに届きます。`}
        </div>
        <div className="muted" style={{ marginTop: 6 }}>週30〜60分の筋トレをする人は、しない人より、死亡・心血管病・がん・糖尿病のリスクが約10〜20%低かったという研究があります（Momma他 2022、観察研究のため「効く」と断定するものではありません）。時間はアプリの記録からの目安です。</div>
      </div>

      <h2>からだで今起きていること</h2>
      <div className="card">
        {tw === 0 && <div className="muted" style={{ marginBottom: 8 }}>最初の記録をつけると、「何週目か」がここに出ます。</div>}
        {tw > 0 && <div style={{ marginBottom: 8 }}>トレーニング <b>{tw}週目</b></div>}
        <ol className="phases">
          {PHASES.map((p, i) => (
            <li key={p.title} className={i === cur ? 'now' : i < cur ? 'past' : ''}>
              <div className="row spread"><b>{p.title}</b><span className="muted">{p.weeks}</span></div>
              {i === cur && <span className="pill">いまここ</span>}
              <div className="muted">{p.text}</div>
            </li>
          ))}
        </ol>
        <div className="muted">筋力の伸びは、はじめの数週は神経の適応が中心で、4週ごろから筋肉の増加が加わるとされています（Eur J Appl Physiol 2023）。時期には個人差があります。</div>
      </div>

      <h2>体力チェックの伸び</h2>
      <div className="card">
        {changes.length === 0 ? (
          <>
            <div>{state.checks.length === 0 ? 'まだ体力チェックがありません。' : '次回の体力チェックから、初回との変化がここに出ます。'}</div>
            <button className="small" style={{ marginTop: 8 }} onClick={() => go({ name: 'check' })}>体力チェックをする</button>
          </>
        ) : (
          <>
            {gain !== undefined && <div style={{ fontSize: 20 }}>初回より 平均 <b>{gain >= 0 ? '+' : ''}{gain}%</b></div>}
            <ul className="plain">
              {changes.map((c) => (
                <li key={c.key}>
                  <span className="grow">
                    <b>{c.label}</b>　{c.first}{c.unit} → <b>{c.latest}{c.unit}</b>
                    {c.pct !== undefined && <span className="muted">（{c.pct >= 0 ? '+' : ''}{c.pct}%）</span>}
                    <div className="muted">{c.diff > 0 ? c.life : c.diff === 0 ? '初回と同じ水準を保てています。' : '日による差の範囲です。体調の良い日にまた測ってみましょう。'}</div>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <h2>これまでの消費カロリー（任意）</h2>
      <div className="card">
        {kcal !== undefined ? (
          <div><span style={{ fontSize: 24 }}><b>約{kcal.toLocaleString('ja-JP')}</b></span> kcal <span className="muted">（おにぎり約{Math.round(kcal / ONIGIRI_KCAL)}個分）</span></div>
        ) : (
          <div className="muted">体重を一度入れると、これまでの運動の消費カロリーの目安が出ます。</div>
        )}
        <label style={{ marginTop: 10 }}>体重（kg）</label>
        <div className="row">
          <input className="grow" type="number" inputMode="decimal" step="0.1" min="30" max="200" value={kg} placeholder="例：68" onChange={(e) => setKg(e.target.value)} />
          <button className="small" onClick={saveKg}>保存</button>
        </div>
        <div className="muted" style={{ marginTop: 6 }}>メッツ（運動の強さの指標）×時間×体重×1.05 で計算します（筋トレ3.5、ストレッチ2.3。厚労省のメッツ表）。体重はこの端末の中だけに保存されます。</div>
      </div>

      <div className="muted" style={{ margin: '16px 0' }}>この画面の数字は目安で、診断や効果の保証ではありません。</div>
      <button className="big" onClick={() => go({ name: 'home' })}>ホームに戻る</button>
    </>
  );
}
