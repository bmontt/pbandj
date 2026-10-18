// ── /about ───────────────────────────────────────────────────────────────
// The story, the three founders (one letter each), moments from the nights,
// and the artists the members have supported.

import Image from "next/image";
import Link from "next/link";
import NextSection from "@/components/next-section";
import Opener from "@/components/opener";
import SupportLogos from "@/components/support-logos";
import { Photo } from "@/components/media";
import { content, eventsFor, founders, media, plural } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { nextOf, section } from "@/lib/sections";

export const metadata = pageMeta({
  title: "about",
  description: "PB&J Sounds is Peter Gomes (Peter Jacob), Brody Montag (Monty) and Jack Humphreys: an east coast collective and label for underground house.",
  path: "/about",
});

export default function CollectivePage() {
  const s = section("about");
  const next = nextOf("about");
  const { collective, supportArtists, site } = content;

  return (
    <main data-stage-scene="about" className="relative z-10">
      <Opener
        index={s.index}
        label={s.label}
        title="about"
        line={
          <p className="display-sub text-foreground/85">
            {founders.map((f) => f.name.split(" ")[0]).join(", ").replace(/, ([^,]*)$/, " and $1")}. Est. {site.founded}, east coast.
          </p>
        }
      />

      <section aria-label="the story" data-stage-anchor="story" className="px-5 md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="copy max-w-3xl md:text-xl md:leading-relaxed" data-reveal>
            {collective.blurb}
          </p>
          <p className="mt-6 font-mono text-xs text-foreground/55" data-reveal>
            {site.genres.join(" · ")}
          </p>
        </div>
      </section>

      <section aria-labelledby="founders" data-stage-anchor="founders" className="mt-24 px-5 md:mt-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="founders" className="label rule-line mb-10">
            <span>founders</span>
          </h2>
          <ul className="grid gap-14 md:grid-cols-3 md:gap-8">
            {founders.map((f) => {
              const info = media[f.image];
              return (
                <li key={f.id} data-founder={f.id} data-reveal>
                  <Link href={`/about/${f.slug}`} className="group block">
                    <span className="frame relative block aspect-[4/5] overflow-hidden">
                      {info && (
                        <Image
                          src={f.image}
                          alt={`${f.name} (${f.alias})`}
                          fill
                          sizes="(min-width: 768px) 22rem, 92vw"
                          className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                      <span aria-hidden="true" className="display-hero halo-none absolute bottom-2 left-3 text-founder mix-blend-normal drop-shadow-[0_2px_24px_oklch(0.13_0.003_70/0.7)]">
                        {f.id.toUpperCase()}
                      </span>
                    </span>
                    <span className="mt-5 block font-sans text-3xl leading-none text-foreground transition-colors">{f.alias}</span>
                    <span className="mt-2 block font-mono text-xs text-foreground/60">
                      {f.name.toLowerCase()} · {f.role.toLowerCase()}
                    </span>
                    <span className="mt-1 block font-mono text-xs text-foreground/45">
                      {eventsFor(f.id).length ? plural(eventsFor(f.id).length, "event") : "profile"} <span className="nudge">→</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="moments" data-stage-anchor="moments" className="mt-24 px-5 md:mt-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="moments" className="label rule-line mb-8">
            <span>moments</span>
          </h2>
          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
            {collective.moments.map((m) => (
              <li key={m.src} data-reveal>
                <Photo src={m.src} alt={m.alt} sizes="(min-width: 1024px) 23rem, (min-width: 640px) 46vw, 92vw" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="supported" data-stage-anchor="supported" className="mt-24 px-5 md:mt-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="supported" className="label rule-line mb-3">
            <span>supported</span>
          </h2>
          <p className="mb-10 font-mono text-xs text-foreground/50">artists our members have supported</p>
          <SupportLogos artists={supportArtists} />
        </div>
      </section>

      <NextSection href={next.href} word={next.label} caption={`open call · ${content.join.roles.join(", ")}`} />
    </main>
  );
}
