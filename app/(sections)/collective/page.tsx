// ── /collective ───────────────────────────────────────────────────────────────
// The original "The Collective" section: PB&J Sounds, the blurb, and the three
// founders, each name with its initial in the founder's color, their role and
// their links (the original portfolio cards).

import Image from "next/image";
import Link from "next/link";
import NextSection from "@/components/next-section";
import Opener from "@/components/opener";
import { ICONS } from "@/components/icons";
import { content, founders, media } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { nextOf, section } from "@/lib/sections";

export const metadata = pageMeta({
  title: content.collective.label,
  description: content.collective.blurb,
  path: "/collective",
});

const LINK_ORDER = ["instagram", "spotify", "soundcloud", "github"] as const;

export default function CollectivePage() {
  const s = section("collective");
  const next = nextOf("collective");
  const { collective } = content;

  return (
    <main data-stage-scene="collective" className="relative z-10">
      <Opener
        index={s.index}
        label={s.label}
        title={s.heading}
        line={
          <p className="copy md:text-xl md:leading-relaxed" data-stage-anchor="story">
            {collective.blurb}
          </p>
        }
      />

      <section aria-label="founders" data-stage-anchor="founders" className="mt-12 px-5 md:mt-20 md:px-12">
        <ul className="mx-auto grid max-w-6xl gap-14 md:grid-cols-3 md:gap-8">
          {founders.map((f) => (
            <li key={f.id} data-founder={f.id} data-reveal>
              <Link href={`/collective/${f.slug}`} className="group block">
                <span className="frame relative block aspect-[4/5] overflow-hidden">
                  {media[f.image] && (
                    <Image
                      src={f.image}
                      alt={f.name}
                      fill
                      sizes="(min-width: 768px) 22rem, 92vw"
                      className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )}
                  <span aria-hidden="true" className="absolute top-3 right-3 font-mono text-sm text-foreground/0 transition-colors group-hover:text-foreground/90">
                    ↗
                  </span>
                </span>
                <span className="mt-5 block font-sans text-3xl leading-none text-foreground">
                  <span className="text-founder">{f.name.charAt(0)}</span>
                  {f.name.slice(1)}
                </span>
                <span className="mt-2 block font-mono text-xs text-foreground/60">{f.role}</span>
              </Link>
              <ul className="-ml-3 mt-2 flex">
                {LINK_ORDER.filter((k) => f.links[k]).map((k) => {
                  const Icon = ICONS[k];
                  return (
                    <li key={k}>
                      <a
                        href={f.links[k]}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${f.name} on ${k}`}
                        className="flex h-11 w-11 items-center justify-center text-foreground/55 transition-colors hover:text-foreground"
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <NextSection href={next.href} word={next.name} caption={next.label} />
    </main>
  );
}
