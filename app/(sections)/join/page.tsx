// ── /join ─────────────────────────────────────────────────────────────────────
// The original "Career / Join Our Team" section. The submission form
// (components/demo-submission-form.tsx, being hardened in its own branch)
// mounts in #apply at integration; until then the section offers email.

import Link from "next/link";
import Opener from "@/components/opener";
import { DisplayWord } from "@/components/display-word";
import { content } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { section } from "@/lib/sections";

export const metadata = pageMeta({ title: content.join.heading, description: content.join.intro, path: "/join" });

export default function JoinPage() {
  const s = section("join");
  const { join, site } = content;
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(join.heading)}`;

  return (
    <main data-stage-scene="join" className="relative z-10">
      <Opener index={s.index} label={s.label} title={s.heading} line={<p className="display-sub text-foreground/85">{join.intro}</p>} />

      {/* ── join form slot ──────────────────────────────────────────────────
          At integration: render <DemoSubmissionForm /> inside #apply, in
          place of the email fallback below (keep the fallback as the form's
          no-JS / error path). */}
      <section id="apply" data-join-form aria-label={join.heading} data-stage-anchor="apply" className="px-5 md:px-12">
        <div className="mx-auto max-w-6xl md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <p className="copy max-w-xl" data-reveal>
            {join.prompt}
          </p>
          <div className="mt-8 md:mt-0" data-reveal>
            <a href={mailto} className="group block border border-border px-6 py-6 transition-colors hover:border-foreground/30 md:px-8 md:py-8">
              <span className="block font-mono text-xs text-foreground/55">email</span>
              <span className="mt-2 block break-all font-sans text-2xl text-foreground md:text-3xl">{site.email}</span>
              <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-foreground/70 group-hover:text-foreground">
                {join.heading} <span className="nudge">→</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section aria-label="next" className="relative z-10 px-5 pt-32 pb-16 md:px-12 md:pt-48">
        <div className="mx-auto max-w-6xl" data-reveal>
          <p className="label rule-line mb-5">
            <span>next</span>
          </p>
          <Link href="/" className="group inline-block">
            <span className="display-choice halo-none inline-block text-foreground">
              <DisplayWord text={site.short} tracking={-0.045} /> <span className="nudge" aria-hidden="true">→</span>
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
