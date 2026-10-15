// ── /collective/[slug] ────────────────────────────────────────────────────────
// One founder, in their letter's family: who they are, in their words, their
// gear, the artists they've supported, and their nights. The old /artists/p|b|j
// URLs redirect here (next.config.ts).

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/json-ld";
import NextSection from "@/components/next-section";
import SupportLogos from "@/components/support-logos";
import { DisplayWord } from "@/components/display-word";
import { ICONS } from "@/components/icons";
import { content, eventsFor, firstSentence, founderBySlug, founders, media } from "@/lib/content";
import { formatShort } from "@/lib/dates";
import { enterStyle } from "@/lib/enter";
import { pageMeta } from "@/lib/meta";
import { personLd } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return founders.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/collective/[slug]">): Promise<Metadata> {
  const f = founderBySlug((await params).slug);
  if (!f) return {};
  return pageMeta({
    title: `${f.alias} (${f.name})`,
    description: `${f.name}, ${f.alias}: ${f.role} at PB&J Sounds. ${firstSentence(f.bio[0])}`,
    path: `/collective/${f.slug}`,
  });
}

const RISE = "cubic-bezier(0.22, 1, 0.36, 1)";
const LINK_ORDER = ["spotify", "soundcloud", "instagram", "github"] as const;

export default async function FounderPage({ params }: PageProps<"/collective/[slug]">) {
  const f = founderBySlug((await params).slug);
  if (!f) notFound();
  const i = founders.indexOf(f);
  const next = founders[i + 1];
  const nights = eventsFor(f.id);
  const supported = content.supportArtists.filter((a) => f.supports.includes(a.name));
  const info = media[f.image];

  return (
    <main data-stage-scene="artist" data-stage-artist={f.id} data-founder={f.id} className="relative z-10 px-5 md:px-12">
      <article className="mx-auto max-w-6xl">
        <header data-stage-anchor="artist" className="pt-32 md:pt-40">
          <Link href="/collective" className="-my-3 inline-flex min-h-11 items-center font-mono text-xs text-foreground/60 hover:text-foreground">
            ← collective
          </Link>
          <p className="label spread mt-6 enter" style={enterStyle({ dur: 0.7 })}>
            <span>
              <span className="text-accent">{f.id}</span> <span className="text-foreground/35">/</span> {f.name.toLowerCase()}
            </span>
          </p>
          <h1 data-drift className="display-hero halo-none mt-5 text-foreground enter" style={enterStyle({ y: 26, blur: 8, dur: 1, delay: 0.08, ease: RISE })}>
            <DisplayWord text={f.alias.toLowerCase()} tracking={-0.05} />
          </h1>
          <p className="mt-8 font-mono text-xs text-foreground/65 enter md:mt-10" style={enterStyle({ dur: 0.8, delay: 0.3 })}>
            {f.role.toLowerCase()}
          </p>
        </header>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16">
          <div className="md:sticky md:top-24 md:self-start" data-reveal>
            {info && (
              <Image src={f.image} alt={`${f.name} (${f.alias})`} width={info.w} height={info.h} priority sizes="(min-width: 768px) 26rem, 92vw" className="frame h-auto w-full" />
            )}
            <ul className="mt-5 flex flex-wrap gap-2">
              {LINK_ORDER.filter((k) => f.links[k]).map((k) => {
                const Icon = ICONS[k];
                return (
                  <li key={k}>
                    <a
                      href={f.links[k]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex min-h-11 items-center gap-2 border border-border px-3 font-mono text-xs text-foreground/75 transition-colors hover:border-foreground/30 hover:text-foreground"
                    >
                      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                      {k}
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
              <section aria-labelledby="gear" className="mt-14">
                <h2 id="gear" className="label spread mb-5">
                  <span>gear</span>
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
              <section aria-labelledby="nights" className="mt-14">
                <h2 id="nights" className="label spread mb-5">
                  <span>events · {nights.length}</span>
                </h2>
                <ul className="divide-y divide-border border-y border-border">
                  {nights.map((e) => (
                    <li key={e.slug} data-reveal>
                      <Link href={`/events/${e.slug}`} className="group flex items-baseline justify-between gap-4 py-3">
                        <span className="copy-sm min-w-0 transition-transform duration-500 group-hover:translate-x-1">
                          {e.title}
                          {e.city && <span className="ml-2 font-mono text-xs text-foreground/50">{e.city.toLowerCase()}</span>}
                        </span>
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
          <section aria-labelledby="supported" className="mt-24">
            <h2 id="supported" className="label spread mb-10">
              <span>supported</span>
            </h2>
            <SupportLogos artists={supported} />
          </section>
        )}
      </article>
      <div className="-mx-5 md:-mx-12">
        {next ? (
          <NextSection href={`/collective/${next.slug}`} word={next.alias.toLowerCase()} caption={`${next.name.toLowerCase()} · ${next.role.toLowerCase()}`} accent={next.id} />
        ) : (
          <NextSection href="/join" word="join" caption={`open call · ${content.join.roles.join(", ")}`} accent="b" />
        )}
      </div>
      <JsonLd data={personLd(f)} />
    </main>
  );
}
