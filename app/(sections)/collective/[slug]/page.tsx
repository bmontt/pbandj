// ── /collective/[slug] ────────────────────────────────────────────────────────
// One founder, as the original artist pages had it: the name (its initial in
// the founder's color), the role, the photo and links, the quote, the bio,
// "Equipment", "Support", "Past Events" and "Latest Releases". The old
// /artists/p|b|j URLs redirect here (next.config.ts).

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import NextSection from "@/components/next-section";
import SupportLogos from "@/components/support-logos";
import TrackGrid from "@/components/track-grid";
import { ICONS } from "@/components/icons";
import { content, eventsFor, firstSentence, founderBySlug, founders, media } from "@/lib/content";
import { formatShort } from "@/lib/dates";
import { enterStyle } from "@/lib/enter";
import { pageMeta } from "@/lib/meta";
import { personLd } from "@/lib/schema";
import { getTracks } from "@/lib/tracks";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return founders.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collective/[slug]">): Promise<Metadata> {
  const f = founderBySlug((await params).slug);
  if (!f) return {};
  return pageMeta({ title: f.name, description: firstSentence(f.bio[0]), path: `/collective/${f.slug}` });
}

const RISE = "cubic-bezier(0.22, 1, 0.36, 1)";
const LINK_ORDER = ["instagram", "spotify", "soundcloud", "github"] as const;

export default async function FounderPage({ params }: PageProps<"/collective/[slug]">) {
  const f = founderBySlug((await params).slug);
  if (!f) notFound();
  const labels = content.founderLabels;
  const i = founders.indexOf(f);
  const next = founders[i + 1];
  const nights = eventsFor(f.id);
  const supported = content.supportArtists.filter((a) => f.supports.includes(a.name));
  const tracks = (await getTracks(30)).filter((t) => t.founder === f.id);
  const info = media[f.image];

  return (
    <main data-stage-scene="artist" data-stage-artist={f.id} data-founder={f.id} className="relative z-10 px-5 md:px-12">
      <article className="mx-auto max-w-6xl">
        <header data-stage-anchor="artist" className="pt-32 md:pt-40">
          <Link href="/collective" className="-my-3 inline-flex min-h-11 items-center font-mono text-xs text-foreground/60 hover:text-foreground">
            ← {content.collective.label}
          </Link>
          <h1
            data-drift
            className="display-hero halo-none mt-6 text-foreground enter"
            style={{ ...enterStyle({ y: 26, blur: 8, dur: 1, delay: 0.08, ease: RISE }), fontSize: "clamp(3rem, 12.5vw, 11rem)" }}
          >
            <span className="text-founder">{f.name.charAt(0)}</span>
            {f.name.slice(1)}
          </h1>
          <p className="mt-6 font-mono text-xs text-foreground/65 enter md:mt-8" style={enterStyle({ dur: 0.8, delay: 0.3 })}>
            {f.role}
          </p>
        </header>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="md:sticky md:top-24 md:self-start" data-reveal>
            {info && <Image src={f.image} alt={f.name} width={info.w} height={info.h} priority sizes="(min-width: 768px) 26rem, 92vw" className="frame h-auto w-full" />}
            <ul className="-ml-3 mt-3 flex">
              {LINK_ORDER.filter((k) => f.links[k]).map((k) => {
                const Icon = ICONS[k];
                return (
                  <li key={k}>
                    <a
                      href={f.links[k]}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${f.name} on ${k}`}
                      className="flex h-11 w-11 items-center justify-center text-foreground/60 transition-colors hover:text-foreground"
                    >
                      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div data-stage-anchor="bio" className="min-w-0">
            <blockquote className="display-sub halo-none text-foreground" data-reveal>
              <span className="text-accent">“</span>
              {f.quote}
              <span className="text-accent">”</span>
            </blockquote>
            <div className="mt-10 space-y-5">
              {f.bio.map((p, j) => (
                <p key={j} className="copy" data-reveal>
                  {p}
                </p>
              ))}
            </div>

            {f.gear.length > 0 && (
              <section aria-labelledby="equipment" className="mt-14">
                <h2 id="equipment" className="label rule-line mb-5">
                  <span>{labels.equipment}</span>
                </h2>
                <ul className="divide-y divide-border border-y border-border">
                  {f.gear.map((g) => (
                    <li key={g} className="copy-sm py-3" data-reveal>
                      {g}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {nights.length > 0 && (
              <section aria-labelledby="past-events" className="mt-14">
                <h2 id="past-events" className="label rule-line mb-5">
                  <span>{labels.events}</span>
                </h2>
                <ul className="divide-y divide-border border-y border-border">
                  {nights.map((e) => (
                    <li key={e.slug} data-reveal>
                      <Link href={`/events/${e.slug}`} className="group flex items-baseline justify-between gap-4 py-3">
                        <span className="copy-sm min-w-0 transition-transform duration-500 group-hover:translate-x-1">{e.title}</span>
                        <span className="shrink-0 font-mono text-xs text-foreground/50">{formatShort(e.date)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {supported.length > 0 && (
          <section aria-labelledby="support" className="mt-24">
            <h2 id="support" className="label rule-line mb-10">
              <span>{labels.support}</span>
            </h2>
            <SupportLogos artists={supported} />
          </section>
        )}

        {tracks.length > 0 && (
          <section aria-labelledby="releases" className="mt-24">
            <h2 id="releases" className="label rule-line mb-8">
              <span>{labels.releases}</span>
            </h2>
            <TrackGrid tracks={tracks} />
          </section>
        )}
      </article>
      <div className="-mx-5 md:-mx-12">
        {next ? (
          <NextSection href={`/collective/${next.slug}`} word={next.name} caption={next.role} />
        ) : (
          <NextSection href="/join" word={content.join.heading} caption={content.join.label} />
        )}
      </div>
      <JsonLd data={personLd(f)} />
    </main>
  );
}
