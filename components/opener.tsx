// ── section opener ────────────────────────────────────────────────────────────
// Each section page opens the same way: the index and the original small label
// with the founders' rule, the original heading huge, and the section's own
// copy under it when the original had some. The background steps back behind
// it ([data-stage-anchor="opener"]).

import type { ReactNode } from "react";
import { DisplayWord } from "@/components/display-word";
import { enterStyle } from "@/lib/enter";

const RISE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default function Opener({
  index,
  label,
  title,
  line,
  children,
}: {
  index: string;
  label: string;
  title: string;
  line?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header data-stage-anchor="opener" className="relative flex min-h-[56svh] flex-col justify-end px-5 pt-32 pb-12 md:min-h-[72svh] md:px-12 md:pb-16">
      <div className="mx-auto w-full max-w-6xl">
        <p className="label rule-line enter" style={enterStyle({ dur: 0.7 })}>
          <span>
            {index} <span className="text-foreground/35">/</span> {label}
          </span>
        </p>
        <h1
          data-drift
          className="display-hero halo-none enter mt-5 text-foreground"
          style={enterStyle({ y: 26, blur: 8, dur: 1, delay: 0.08, ease: RISE })}
        >
          <DisplayWord text={title} tracking={-0.05} />
        </h1>
        {line && (
          <div className="enter mt-9 max-w-3xl md:mt-12" style={enterStyle({ y: 14, dur: 0.9, delay: 0.3, ease: RISE })}>
            {line}
          </div>
        )}
        {children && (
          <div className="enter mt-6" style={enterStyle({ dur: 0.9, delay: 0.45 })}>
            {children}
          </div>
        )}
      </div>
    </header>
  );
}
