// ── display words ─────────────────────────────────────────────────────────────
// Ported from brodymontag.com (components/display-word.tsx), measured on the
// same font file. Neue Haas Display Medium at display tracking (-0.04em to
// -0.05em) runs the f and t crossbars into their neighbours: the f's bar into
// the t's, and the t's into a w, v, y, x or an r's arm. kern() opens just those
// joints to a hairline and leaves the rest of the word on its tracking.
//
// The word is cut only at the opened joints. Each piece but the last is a span
// with a no-op font-feature-settings, which every engine shapes apart from its
// neighbour: kerning holds inside a piece and drops across the cut, so the
// cut's spacing is exactly the margin set here.

import type { ReactNode } from "react";

// [ink gap at crossbar height, GPOS kern] for each lowercase pair that touches
// at -0.05em or looser, in 1/1000 em at zero tracking. Measured from
// NeueHaasDisplayMedium; remeasure if the face changes.
const BAR: Record<string, readonly [number, number]> = {
  ff: [32, -5], fs: [54, -5], ft: [32, -5], fv: [20, 15], fw: [22, 15], fx: [47, -5], fy: [20, 15],
  kf: [37, -5], kt: [37, -10], rf: [29, 5], rt: [29, 5], sf: [60, -10], st: [61, -10],
  tf: [40, -12], tt: [40, -10], tv: [28, 15], tw: [30, 15], ty: [28, 10],
  vf: [16, 15], vt: [16, 15], wf: [18, 15], wt: [18, 15], xf: [47, -10], xt: [47, -20],
  yf: [16, 15], yt: [16, 15], zf: [50, 0], zt: [50, 0],
};
const TOUCH = 4; // closer than this, two glyphs read as one shape
const CLEAR = 10; // the hairline an opened joint keeps

/** the text cut at the crossbar joints that collide at `tracking` (em) */
export function kern(text: string, tracking: number): ReactNode {
  const t = tracking * 1000;
  const out: ReactNode[] = [];
  let from = 0;
  for (let i = 0; i < text.length - 1; i++) {
    const bar = BAR[text.slice(i, i + 2).toLowerCase()];
    if (!bar || bar[0] + bar[1] + t >= TOUCH) continue;
    out.push(
      <span key={i} style={{ fontFeatureSettings: '"kern" 1', marginRight: `${(CLEAR - bar[0] - t) / 1000}em` }}>
        {text.slice(from, i + 1)}
      </span>,
    );
    from = i + 1;
  }
  if (!out.length) return text;
  out.push(text.slice(from));
  return out;
}

/** a display word with its crossbar joints opened, read whole by screen readers */
export function DisplayWord({ text, tracking }: { text: string; tracking: number }) {
  const pieces = kern(text, tracking);
  if (typeof pieces === "string") return pieces;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{pieces}</span>
    </>
  );
}
