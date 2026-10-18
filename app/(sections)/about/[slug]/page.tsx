// ── /about/[slug] ────────────────────────────────────────────────────────
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
import EmbedPlayer from "@/components/embed-player";
import LinkChip from "@/components/link-chip";
import { DisplayWord } from "@/components/display-word";
import { ICONS } from "@/components/icons";
import { content, eventsFor, firstSentence, founderBySlug, founders, media } from "@/lib/content";
import { formatShort } from "@/lib/dates";
import { embedFor } from "@/lib/embeds";
import { PLATFORM_NAME } from "@/lib/links";
import { enterStyle } from "@/lib/enter";
import { pageMeta } from "@/lib/meta";
import { personLd } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return founders.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/about/[slug]">): Promise<Metadata> {
  const f = founderBySlug((await params).slug);
  if (!f) return {};
  return pageMeta({
    title: `${f.alias} (${f.name})`,
    description: `${f.name}, ${f.alias}: ${f.role} at PB&J Sounds. ${firstSentence(f.bio[0])}`,
    path: `/about/${f.slug}`,
  });
}

const RISE = "cubic-bezier(0.22, 1, 0.36, 1)";
const LINK_ORDER = ["spotify", "soundcloud", "instagram", "github"] as const;

export default async function FounderPage({ params }: PageProps<"/about/[slug]">) {
  const f = founderBySlug((await params).slug);
  if (!f) notFound();
  const i = founders.indexOf(f);
  const next = founders[i + 1];
  const nights = eventsFor(f.id);
  const supported = content.supportArtists.filter((a) => f.supports.includes(a.name));
  const info = media[f.image];
  // one player per founder: their Spotify artist page, else their SoundCloud
  const playerHref = f.links.spotify ?? f.links.soundcloud;
  const playerEmbed = playerHref ? embedFor(playerHref, f.id) : null;
  const player = playerHref && playerEmbed ? { href: playerHref, embed: playerEmbed } : null;
  const PlayerIcon = player ? ICONS[player.embed.platform] : null;

  return (
    <main data-stage-scene="artist" data-stage-artist={f.id} data-founder={f.id} className="relative z-10 px-5 md:px-12">
      <article className="mx-auto max-w-6xl">
        <header data-stage-anchor="artist" className="pt-32 md:pt-40">
          <Link href="/about" className="-my-3 inline-flex min-h-11 items-center font-mono text-xs text-foreground/60 hover:text-foreground">
            ← about
          </Link>
          <p className="label rule-line mt-6 enter" style={enterStyle({ dur: 0.7 })}>
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
              {LINK_ORDER.filter((k) => f.links[k]).map((k) => (
                <li key={k}>
                  <LinkChip href={f.links[k]!} platform={k} />
                </li>
              ))}
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

            {player && PlayerIcon && (
              <section aria-labelledby="listen" className="mt-14">
                <h2 id="listen" className="label rule-line mb-5">
                  <span>listen</span>
                </h2>
                <div data-reveal>
                  <EmbedPlayer
                    embed={player.embed}
                    href={player.href}
                    title={f.alias}
                    className="h-[352px]"
                    icon={<PlayerIcon aria-hidden="true" className="h-3.5 w-3.5" />}
                  >
                    <span className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
                      <span aria-hidden="true" className="display-hero halo-none block leading-none text-founder/80">
                        {f.id.toUpperCase()}
                      </span>
                      <span className="mt-4 block font-sans text-xl text-foreground">{f.alias}</span>
                      <span className="mt-1 block font-mono text-xs text-foreground/55">
                        {player.embed.platform === "spotify" ? "top tracks" : "tracks"} on {PLATFORM_NAME[player.embed.platform].toLowerCase()} · press play to load the player
                      </span>
                    </span>
                  </EmbedPlayer>
                </div>
              </section>
            )}

            {f.gear.length > 0 && (
              <section aria-labelledby="gear" className="mt-14">
                <h2 id="gear" className="label rule-line mb-5">
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
                <h2 id="nights" className="label rule-line mb-5">
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
            <h2 id="supported" className="label rule-line mb-10">
              <span>supported</span>
            </h2>
            <SupportLogos artists={supported} />
          </section>
        )}
      </article>
      <div className="-mx-5 md:-mx-12">
        {next ? (
          <NextSection href={`/about/${next.slug}`} word={next.alias.toLowerCase()} caption={`${next.name.toLowerCase()} · ${next.role.toLowerCase()}`} />
        ) : (
          <NextSection href="/join" word="join" caption={`open call · ${content.join.roles.join(", ")}`} />
        )}
      </div>
      <JsonLd data={personLd(f)} />
    </main>
  );
}
