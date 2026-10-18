// ── next section ──────────────────────────────────────────────────────────────
// The end of a page hands off to the next instead of dead-ending:
// events → music → about → join → back to the start.

import Link from "next/link";
import { DisplayWord } from "@/components/display-word";

export default function NextSection({ href, word, caption }: { href: string; word: string; caption: string }) {
  return (
    <section aria-label="next" className="relative z-10 px-5 pt-32 pb-16 md:px-12 md:pt-48">
      <div className="mx-auto max-w-6xl" data-reveal>
        <p className="label rule-line mb-5">
          <span>next</span>
        </p>
        <Link href={href} className="group inline-block">
          <span className="display-choice halo-none inline-block text-foreground transition-colors duration-500">
            <DisplayWord text={word} tracking={-0.045} /> <span className="nudge" aria-hidden="true">→</span>
          </span>
          <span className="mt-4 block font-mono text-xs text-foreground/55 group-hover:text-foreground/75">{caption}</span>
        </Link>
      </div>
    </section>
  );
}
