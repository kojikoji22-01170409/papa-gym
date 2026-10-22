import { useState } from 'react';
import { mukiSvg, type MukiOpts } from '../lib/muki';
import { STAGE_NAMES } from '../lib/pet';

/** The pet. The SVG string is built only from fixed ids (no user text), so inlining it is safe. */
export function Muki({ name, onTap, size = 160, ...opts }: MukiOpts & { name: string; onTap?: () => void; size?: number }) {
  const [jump, setJump] = useState(0);
  const label = `${name}（${STAGE_NAMES[opts.stage]}）`;
  const html = { __html: mukiSvg(opts) };
  const tap = () => {
    setJump((n) => n + 1);
    onTap?.();
  };
  const inner = <span key={jump} className={`muki-body${jump ? ' jump' : ''}`} dangerouslySetInnerHTML={html} />;
  if (!onTap) return <span className="muki" role="img" aria-label={label} style={{ width: size, height: size }}>{inner}</span>;
  return <button className="muki" aria-label={`${label}をタップ`} style={{ width: size, height: size }} onClick={tap}>{inner}</button>;
}
