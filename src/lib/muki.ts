// The pet "ムキたま" as a hand-built SVG string. No user text goes into it, so it is safe to inline.
export type MukiMood = 'happy' | 'normal' | 'sleepy' | 'sad';
export type MukiType = 'power' | 'flex' | 'balance';
export interface Worn { hat?: string; face?: string; neck?: string; back?: string; bg?: string }
export interface MukiOpts { stage: number; type?: MukiType; mood?: MukiMood; worn?: Worn }

const C = { body: '#7cc8ee', bodyDeep: '#2fa4da', belly: '#ffffff', line: '#123a52', cheek: '#ffb48a', orange: '#ff8a3d', gold: '#ffc94d', shadow: 'rgba(18,58,82,0.12)' };

function face(cx: number, cy: number, s: number, mood: MukiMood): string {
  const ex = 13 * s;
  const ey = cy - 4 * s;
  let eyes: string;
  if (mood === 'happy') {
    eyes = [-1, 1].map((d) => `<path d="M${cx + d * ex - 6 * s} ${ey + 2 * s} q${6 * s} ${-8 * s} ${12 * s} 0" fill="none" stroke="${C.line}" stroke-width="${3 * s}" stroke-linecap="round"/>`).join('');
  } else if (mood === 'sleepy') {
    eyes = [-1, 1].map((d) => `<path d="M${cx + d * ex - 6 * s} ${ey} h${12 * s}" stroke="${C.line}" stroke-width="${3 * s}" stroke-linecap="round"/>`).join('');
  } else if (mood === 'sad') {
    eyes = [-1, 1].map((d) => `<circle cx="${cx + d * ex}" cy="${ey + 2 * s}" r="${4 * s}" fill="${C.line}"/><path d="M${cx + d * ex - 7 * s} ${ey - (d > 0 ? 10 : 6) * s} l${14 * s} ${d > 0 ? 4 * s : -4 * s}" stroke="${C.line}" stroke-width="${2 * s}" stroke-linecap="round"/>`).join('');
  } else {
    eyes = [-1, 1].map((d) => `<circle cx="${cx + d * ex}" cy="${ey}" r="${4.5 * s}" fill="${C.line}"/><circle cx="${cx + d * ex + 1.5 * s}" cy="${ey - 1.5 * s}" r="${1.4 * s}" fill="#fff"/>`).join('');
  }
  const my = cy + 8 * s;
  const mouth = mood === 'happy' ? `<path d="M${cx - 7 * s} ${my} q${7 * s} ${10 * s} ${14 * s} 0 z" fill="${C.orange}" stroke="${C.line}" stroke-width="${2 * s}" stroke-linejoin="round"/>`
    : mood === 'sad' ? `<path d="M${cx - 6 * s} ${my + 4 * s} q${6 * s} ${-6 * s} ${12 * s} 0" fill="none" stroke="${C.line}" stroke-width="${2.5 * s}" stroke-linecap="round"/>`
    : mood === 'sleepy' ? `<ellipse cx="${cx}" cy="${my + s}" rx="${3 * s}" ry="${2.5 * s}" fill="${C.line}"/>`
    : `<path d="M${cx - 6 * s} ${my} q${6 * s} ${6 * s} ${12 * s} 0" fill="none" stroke="${C.line}" stroke-width="${2.5 * s}" stroke-linecap="round"/>`;
  const cheeks = mood === 'sad' ? '' : [-1, 1].map((d) => `<ellipse cx="${cx + d * 24 * s}" cy="${cy + 6 * s}" rx="${6 * s}" ry="${4 * s}" fill="${C.cheek}" opacity=".8"/>`).join('');
  const zzz = mood === 'sleepy' ? `<text x="${cx + 34 * s}" y="${cy - 34 * s}" font-size="${16 * s}" font-weight="700" fill="${C.bodyDeep}" font-family="sans-serif">z<tspan dx="2" dy="-8" font-size="${12 * s}">z</tspan></text>` : '';
  return eyes + mouth + cheeks + zzz;
}

function scene(id: string): string {
  if (id === 'park') {
    return `<rect width="200" height="200" rx="24" fill="#dff1fb"/><circle cx="160" cy="36" r="16" fill="#ffe08a"/><path d="M0 150 Q60 118 120 140 T200 130 V200 H0Z" fill="#b9e3a8"/><rect x="26" y="96" width="8" height="40" fill="#8a6a4a"/><circle cx="30" cy="88" r="22" fill="#7cc97c" stroke="${C.line}" stroke-width="2"/>`;
  }
  return `<rect width="200" height="200" rx="24" fill="#cfeaf9"/><path d="M-10 160 L70 70 L100 100 L130 60 L215 160Z" fill="#8fb4d6"/><path d="M118 74 L130 60 L146 80 L136 76 L130 84 L122 78Z" fill="#fff"/><path d="M0 160 H200 V200 H0Z" fill="#b9e3a8"/>`;
}

function hatSvg(id: string, cx: number, top: number, rx: number, s: number): string {
  if (id === 'santa') {
    return `<path d="M${cx - rx * 0.62} ${top + 12 * s} Q${cx - 4} ${top - 36 * s} ${cx + rx * 0.9} ${top - 10 * s} Q${cx + rx * 0.5} ${top + 4 * s} ${cx + rx * 0.62} ${top + 12 * s}Z" fill="#e0483c" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/><rect x="${cx - rx * 0.7}" y="${top + 6 * s}" width="${rx * 1.4}" height="${10 * s}" rx="${5 * s}" fill="#fff" stroke="${C.line}" stroke-width="2.5"/><circle cx="${cx + rx * 0.9}" cy="${top - 10 * s}" r="${7 * s}" fill="#fff" stroke="${C.line}" stroke-width="2.5"/>`;
  }
  return `<path d="M${cx - rx * 0.62} ${top + 14 * s} Q${cx} ${top - 26 * s} ${cx + rx * 0.62} ${top + 14 * s}Z" fill="${C.bodyDeep}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${cx + rx * 0.2} ${top + 12 * s} q${rx * 0.7} ${-2 * s} ${rx * 0.9} ${6 * s} q${-rx * 0.5} ${4 * s} ${-rx * 0.9} ${2 * s}Z" fill="${C.orange}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/>`;
}

export function mukiSvg({ stage, type = 'balance', mood = 'normal', worn = {} }: MukiOpts): string {
  const bg = worn.bg ? scene(worn.bg) : '';
  const parts: string[] = [bg, `<ellipse cx="100" cy="186" rx="${stage === 0 ? 34 : 30 + stage * 6}" ry="7" fill="${C.shadow}"/>`];
  if (stage === 0) {
    parts.push(`<path d="M100 40 C140 40 156 110 156 136 C156 170 130 184 100 184 C70 184 44 170 44 136 C44 110 60 40 100 40 Z" fill="#fff" stroke="${C.line}" stroke-width="3"/>`,
      `<circle cx="80" cy="96" r="9" fill="${C.body}"/><circle cx="122" cy="122" r="12" fill="${C.body}"/><circle cx="88" cy="150" r="7" fill="${C.body}"/><circle cx="118" cy="74" r="6" fill="${C.cheek}"/>`);
    return wrap(parts.join(''));
  }
  const s = [0, 0.74, 0.86, 1, 1.08][stage];
  const grown = stage >= 3;
  const tall = grown && type === 'flex' ? 1.14 : 1;
  const wide = grown && type === 'power' ? 1.1 : 1;
  const rx = 52 * s * wide;
  const ry = 50 * s * tall;
  const cx = 100;
  const cy = 182 - ry - 8 * s;
  const dress = stage >= 2;
  if (dress && worn.back === 'cape') {
    parts.push(`<path d="M${cx - rx * 0.7} ${cy - ry * 0.2} Q${cx - rx * 1.35} ${cy + ry * 0.9} ${cx - rx * 0.9} 178 L${cx + rx * 0.9} 178 Q${cx + rx * 1.35} ${cy + ry * 0.9} ${cx + rx * 0.7} ${cy - ry * 0.2}Z" fill="${C.orange}" stroke="${C.line}" stroke-width="3" stroke-linejoin="round"/>`);
  }
  const feet = [-1, 1].map((d) => `<ellipse cx="${cx + d * 22 * s}" cy="180" rx="${13 * s}" ry="${7 * s}" fill="${C.bodyDeep}" stroke="${C.line}" stroke-width="2.5"/>`).join('');
  let arms = '';
  const armPath = (path: string, w: number) => `<path d="${path}" fill="none" stroke="${C.line}" stroke-width="${w * 1.4 * s}" stroke-linecap="round"/><path d="${path}" fill="none" stroke="${C.body}" stroke-width="${w * s}" stroke-linecap="round"/>`;
  if (stage >= 2) {
    if (grown && type === 'power') {
      arms = [-1, 1].map((d) => armPath(`M${cx + d * (rx - 6)} ${cy + 4} q${d * 30 * s} ${-6 * s} ${d * 30 * s} ${-34 * s}`, 12) + `<circle cx="${cx + d * (rx + 16 * s)}" cy="${cy - 2 * s}" r="${9 * s}" fill="${C.body}" stroke="${C.line}" stroke-width="2.5"/>`).join('');
    } else if (grown && type === 'flex') {
      arms = [-1, 1].map((d) => armPath(`M${cx + d * (rx - 6)} ${cy - 4} q${d * 22 * s} ${-30 * s} ${d * 8 * s} ${-62 * s}`, 7.5)).join('');
    } else {
      arms = [-1, 1].map((d) => armPath(`M${cx + d * (rx - 4)} ${cy + 6} q${d * 18 * s} ${8 * s} ${d * 20 * s} ${22 * s}`, 7.5)).join('');
    }
  }
  parts.push(arms, feet,
    `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${C.body}" stroke="${C.line}" stroke-width="3"/>`,
    `<ellipse cx="${cx}" cy="${cy + ry * 0.38}" rx="${rx * 0.62}" ry="${ry * 0.5}" fill="${C.belly}"/>`);
  if (stage === 1) {
    parts.push(`<path d="M${cx - 30 * s} ${cy - ry + 14 * s} l${10 * s} ${-14 * s} l${10 * s} ${10 * s} l${10 * s} ${-12 * s} l${10 * s} ${12 * s} l${10 * s} ${-10 * s} l${10 * s} ${14 * s} C${cx + 20 * s} ${cy - ry - 18 * s} ${cx - 20 * s} ${cy - ry - 18 * s} ${cx - 30 * s} ${cy - ry + 14 * s}Z" fill="#fff" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/>`);
  } else if (!(dress && worn.hat)) {
    parts.push(`<path d="M${cx - 4} ${cy - ry + 2} q4 ${-16 * s} ${14 * s} ${-18 * s}" fill="none" stroke="${C.line}" stroke-width="3" stroke-linecap="round"/>`);
  }
  parts.push(face(cx, cy - ry * 0.12, s, mood));
  if (grown && type === 'power') {
    parts.push(`<path d="M${cx - rx * 0.86} ${cy - ry * 0.5} Q${cx} ${cy - ry * 0.68} ${cx + rx * 0.86} ${cy - ry * 0.5}" fill="none" stroke="${C.orange}" stroke-width="${10 * s}" stroke-linecap="round"/><path d="M${cx + rx * 0.8} ${cy - ry * 0.52} l${16 * s} ${-4 * s} M${cx + rx * 0.8} ${cy - ry * 0.48} l${14 * s} ${10 * s}" stroke="${C.orange}" stroke-width="${6 * s}" stroke-linecap="round"/>`);
  }
  if (grown && type === 'balance') {
    parts.push(`<path d="M${cx - rx * 0.78} ${cy + ry * 0.3} Q${cx} ${cy + ry * 0.55} ${cx + rx * 0.78} ${cy + ry * 0.3}" fill="none" stroke="${C.orange}" stroke-width="${10 * s}" stroke-linecap="round"/><path d="M${cx + rx * 0.4} ${cy + ry * 0.45} l${6 * s} ${22 * s}" stroke="${C.orange}" stroke-width="${8 * s}" stroke-linecap="round"/>`);
  }
  if (grown && type === 'flex') {
    parts.push(`<circle cx="${cx + rx * 0.62}" cy="${cy - ry * 0.72}" r="${8 * s}" fill="${C.orange}" stroke="${C.line}" stroke-width="2"/>`);
  }
  if (dress) {
    const fy = cy - ry * 0.12 - 4 * s;
    if (worn.face === 'sunglasses') {
      parts.push(`<rect x="${cx - 24 * s}" y="${fy - 8 * s}" width="${20 * s}" height="${14 * s}" rx="${6 * s}" fill="${C.line}"/><rect x="${cx + 4 * s}" y="${fy - 8 * s}" width="${20 * s}" height="${14 * s}" rx="${6 * s}" fill="${C.line}"/><path d="M${cx - 4 * s} ${fy - 3 * s} h${8 * s}" stroke="${C.line}" stroke-width="${3 * s}"/>`);
    }
    if (worn.neck === 'towel') {
      parts.push(`<path d="M${cx - rx * 0.72} ${cy + ry * 0.38} Q${cx} ${cy + ry * 0.66} ${cx + rx * 0.72} ${cy + ry * 0.38}" fill="none" stroke="${C.line}" stroke-width="${14 * s}" stroke-linecap="round"/><path d="M${cx - rx * 0.72} ${cy + ry * 0.38} Q${cx} ${cy + ry * 0.66} ${cx + rx * 0.72} ${cy + ry * 0.38}" fill="none" stroke="#fff" stroke-width="${10 * s}" stroke-linecap="round"/>`);
    }
    if (worn.neck === 'medal') {
      parts.push(`<path d="M${cx - 12 * s} ${cy + ry * 0.3} L${cx} ${cy + ry * 0.62} L${cx + 12 * s} ${cy + ry * 0.3}" fill="none" stroke="${C.orange}" stroke-width="${5 * s}" stroke-linejoin="round"/><circle cx="${cx}" cy="${cy + ry * 0.7}" r="${9 * s}" fill="${C.gold}" stroke="${C.line}" stroke-width="2.5"/>`);
    }
    if (worn.hat) parts.push(hatSvg(worn.hat, cx, cy - ry, rx, s));
  }
  if (stage === 4) {
    if (!worn.hat) parts.push(`<path d="M${cx - 22} ${cy - ry - 4} l6 -26 l12 14 l4 -20 l4 20 l12 -14 l6 26 z" fill="${C.gold}" stroke="${C.line}" stroke-width="2.5" stroke-linejoin="round"/>`);
    parts.push(`<path d="M40 60 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4z M158 88 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3z" fill="${C.gold}"/>`);
  }
  return wrap(parts.join(''));
}

const wrap = (inner: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" aria-hidden="true">${inner}</svg>`;
