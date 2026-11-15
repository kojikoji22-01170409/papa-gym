import type { WeekEffect } from '../lib/effects';
import { STRENGTH_DAYS_TARGET, STRETCH_DAYS_TARGET } from '../lib/effects';

function Ring({ value, max, color, title, caption, size }: { value: number; max: number; color: string; title: string; caption: string; size: number }) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, value / max);
  const done = value >= max;
  return (
    <div className="ring" role="img" aria-label={`${title} ${caption}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth="9" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fontSize="18" fontWeight="700" fill={done ? color : 'var(--ink)'}>{done ? '✓' : `${value}/${max}`}</text>
      </svg>
      <div className="ring-title">{title}</div>
      <div className="muted ring-cap">{caption}</div>
    </div>
  );
}

/** Three weekly rings: strength days, stretch days, and how many body areas were worked. */
export function Rings({ week, size = 84 }: { week: WeekEffect; size?: number }) {
  return (
    <div className="rings">
      <Ring value={week.strengthDays} max={STRENGTH_DAYS_TARGET} color="var(--main)" title="筋トレ" caption="週2日以上" size={size} />
      <Ring value={week.stretchDays} max={STRETCH_DAYS_TARGET} color="var(--sky)" title="ストレッチ" caption="週2日以上" size={size} />
      <Ring value={week.areaCount} max={3} color="var(--accent)" title="バランス" caption="上・下・体幹" size={size} />
    </div>
  );
}
