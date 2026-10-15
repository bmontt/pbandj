// ── enter ─────────────────────────────────────────────────────────────────────
// One-shot CSS mount entrances (globals.css .enter), started at first paint,
// no animation runtime. Server-safe. Under reduced motion they don't run.
//
//   <div className="enter" style={enterStyle({ y: 16, dur: 0.8, delay: 0.2 })}>

import type { CSSProperties } from "react";

export function enterStyle(o: { x?: number; y?: number; blur?: number; dur?: number; delay?: number; ease?: string }): CSSProperties {
  const s: Record<string, string> = {
    "--ex": `${o.x ?? 0}px`,
    "--ey": `${o.y ?? 0}px`,
    "--ed": `${o.dur ?? 0.8}s`,
    "--edl": `${o.delay ?? 0}s`,
  };
  if (o.blur) s["--eb"] = `${o.blur}px`;
  if (o.ease) s["--ee"] = o.ease;
  return s as CSSProperties;
}
