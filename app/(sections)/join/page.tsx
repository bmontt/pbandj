// ── /join ─────────────────────────────────────────────────────────────────────
// The open call. The submission form (components/demo-submission-form.tsx,
// being hardened in its own branch) mounts in #apply at integration; until
// then the section offers email with the same ask.

import Link from "next/link";
import Opener from "@/components/opener";
import { DisplayWord } from "@/components/display-word";
import { content } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { section } from "@/lib/sections";
import { ICONS } from "@/components/icons";

export const metadata = pageMeta({
  title: "join",
  description: "PB&J Sounds' open call for producers, artists and engineers. Send a portfolio, demo or CV.",
  path: "/join",
});

export default function JoinPage() {
  const s = section("join");
  const { join, site } = content;
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent(join.subject)}`;

  return (
    <main data-stage-scene="join" className="relative z-10">
      <Opener index={s.index} label={join.label} title="join" line={<p className="display-sub text-foreground/85">{join.intro}</p>} />

      <section aria-labelledby="roles" data-stage-anchor="roles" className="px-5 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="roles" className="label rule-line mb-8">
            <span>{join.heading}</span>
          </h2>
          <ul className="grid gap-2">
            {join.roles.map((r, i) => (
              <li key={r} data-reveal className="display-section halo-none text-foreground">
                <span className="mr-4 align-middle font-mono text-xs text-foreground/50">0{i + 1}</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── join form slot ──────────────────────────────────────────────────
          At integration: render <DemoSubmissionForm /> inside #apply, in
          place of the email fallback below (keep the fallback as the form's
          no-JS / error path). */}
      <section id="apply" data-join-form aria-labelledby="apply-heading" data-stage-anchor="apply" className="mt-24 px-5 md:mt-32 md:px-12">
        <div className="mx-auto max-w-6xl md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-16">
          <div data-reveal>
            <h2 id="apply-heading" className="label rule-line mb-6">
              <span>apply</span>
            </h2>
            <p className="copy max-w-xl">
              Tell us about yourself and why you&apos;d like to join PB&amp;J. Attach {join.send}, or link to it.
            </p>
          </div>
          <div className="mt-10 md:mt-0" data-reveal>
            <a href={mailto} className="group block border border-border px-6 py-6 transition-colors hover:border-foreground/30 md:px-8 md:py-8">
              <span className="flex items-center gap-2 font-mono text-xs text-foreground/55">
                <ICONS.email aria-hidden="true" className="h-3.5 w-3.5" />
                email
              </span>
              <span className="mt-2 block break-all font-sans text-2xl text-foreground md:text-3xl">{site.email}</span>
              <span className="mt-4 inline-flex items-center gap-2 font-mono text-xs text-foreground/70 group-hover:text-foreground">
                subject: {join.subject.toLowerCase()} <span className="nudge">→</span>
              </span>
            </a>
          </div>
        </div>
      </section>

      <section aria-label="next" className="relative z-10 px-5 pt-32 pb-16 md:px-12 md:pt-48">
        <div className="mx-auto max-w-6xl" data-reveal>
          <p className="label rule-line mb-5">
            <span>start over</span>
          </p>
          <Link href="/" className="group inline-block">
            <span className="display-choice halo-none inline-block text-foreground transition-colors duration-500">
              <DisplayWord text="pb&j" tracking={-0.045} /> <span className="nudge" aria-hidden="true">→</span>
            </span>
            <span className="mt-4 block font-mono text-xs text-foreground/55 group-hover:text-foreground/75">back to the start</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
