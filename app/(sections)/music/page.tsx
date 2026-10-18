// ── /music ───────────────────────────────────────────────────────────────────
// The founders' latest releases, fetched on the server (lib/tracks.ts) and
// cached with the page for an hour; the mix playlist behind a click; and
// where to follow each of them. If no source answers, the page still lists
// every profile, so it never shows an empty grid.

import Image from "next/image";
import NextSection from "@/components/next-section";
import Opener from "@/components/opener";
import EmbedPlayer from "@/components/embed-player";
import LinkChip from "@/components/link-chip";
import { ICONS } from "@/components/icons";
import { founders } from "@/lib/content";
import { formatShort } from "@/lib/dates";
import { embedFor } from "@/lib/embeds";
import { PLATFORM_NAME } from "@/lib/links";
import { pageMeta } from "@/lib/meta";
import { nextOf, section } from "@/lib/sections";
import { getTracks } from "@/lib/tracks";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "music",
  description: "Latest releases, tracks and mixes from the PB&J Sounds collective: Peter Jacob, Monty and Humphreys.",
  path: "/music",
});

const PLAYLIST = process.env.NEXT_PUBLIC_SOUNDCLOUD_PLAYLIST_URL;
const LINK_ORDER = ["spotify", "soundcloud", "instagram"] as const;

export default async function SoundsPage() {
  const s = section("music");
  const next = nextOf("music");
  const tracks = await getTracks(9);
  const playlist = PLAYLIST && !PLAYLIST.includes("/you/") ? PLAYLIST : null;
  const playlistEmbed = playlist ? embedFor(playlist) : null;

  return (
    <main data-stage-scene="music" className="relative z-10">
      <Opener
        index={s.index}
        label={s.label}
        title="music"
        line={<p className="display-sub text-foreground/85">Releases, tracks and mixes from the collective, newest first.</p>}
      />

      <section aria-labelledby="latest" data-stage-anchor="latest" className="px-5 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="latest" className="label rule-line mb-8">
            <span>latest</span>
          </h2>
          {tracks.length ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8">
              {tracks.map((t) => {
                const embed = embedFor(t.url, t.founder);
                const Icon = ICONS[t.platform];
                const poster = t.image ? (
                  <Image src={t.image} alt="" fill sizes="(min-width: 768px) 22rem, 46vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                ) : (
                  // no artwork (some tracks block embeds): the founder's letter
                  <span aria-hidden="true" className="display-hero halo-none absolute inset-0 flex items-center justify-center text-founder/70">
                    {t.founder.toUpperCase()}
                  </span>
                );
                return (
                  <li key={t.id} data-reveal data-founder={t.founder}>
                    {embed ? (
                      <EmbedPlayer embed={embed} href={t.url} title={t.title} className="aspect-square" icon={<Icon aria-hidden="true" className="h-3.5 w-3.5" />}>
                        {poster}
                      </EmbedPlayer>
                    ) : (
                      <a
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${t.title} on ${PLATFORM_NAME[t.platform]} (opens in a new tab)`}
                        className="frame group relative block aspect-square overflow-hidden"
                      >
                        {poster}
                        <span aria-hidden="true" className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm">
                          <Icon className="h-4 w-4" />
                        </span>
                      </a>
                    )}
                    <a href={t.url} target="_blank" rel="noopener noreferrer" className="group mt-3 block">
                      <span className="block font-sans text-lg leading-snug text-foreground md:text-xl">{t.title}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-xs text-foreground/55">
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-founder" />
                        {t.artist.toLowerCase()} · {t.kind} · {formatShort(t.releaseDate)} ·
                        <span className="inline-flex items-center gap-1.5 transition-colors group-hover:text-foreground/85">
                          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                          {PLATFORM_NAME[t.platform].toLowerCase()} <span aria-hidden="true" className="nudge">↗</span>
                        </span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="copy max-w-2xl" data-reveal>
              The release feed from Spotify and SoundCloud isn&apos;t answering right now. Every release is on the profiles below.
            </p>
          )}
        </div>
      </section>

      {playlist && (
        <section aria-labelledby="mixes" data-stage-anchor="mixes" className="mt-24 px-5 md:mt-32 md:px-12">
          <div className="mx-auto max-w-6xl" data-reveal>
            <h2 id="mixes" className="label rule-line mb-8">
              <span>mixes</span>
            </h2>
            {playlistEmbed ? (
              <EmbedPlayer embed={playlistEmbed} href={playlist} title="the PB&J playlist" className="h-[450px]" icon={<ICONS.soundcloud aria-hidden="true" className="h-3.5 w-3.5" />}>
                <span className="absolute inset-0 flex flex-col justify-center px-6 md:px-10">
                  <span className="display-section halo-none block text-foreground">the pb&amp;j playlist</span>
                  <span className="mt-3 block font-mono text-xs text-foreground/55">mixes on soundcloud · press play to load the player</span>
                </span>
              </EmbedPlayer>
            ) : (
              <LinkChip href={playlist} label="the pb&j playlist" className="inline-flex" />
            )}
          </div>
        </section>
      )}

      <section aria-labelledby="listen" data-stage-anchor="listen" className="mt-24 px-5 md:mt-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="listen" className="label rule-line mb-8">
            <span>listen</span>
          </h2>
          <ul className="grid gap-px border-y border-border md:grid-cols-3 md:border-y-0">
            {founders.map((f) => (
              <li key={f.id} data-founder={f.id} data-reveal className="border-b border-border py-6 last:border-b-0 md:border-b-0 md:py-0">
                <p className="font-sans text-2xl text-foreground">
                  <span className="mr-2 text-accent">{f.id.toUpperCase()}</span>
                  {f.alias}
                </p>
                <p className="mt-1 font-mono text-xs text-foreground/55">{f.name.toLowerCase()}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {LINK_ORDER.filter((k) => f.links[k]).map((k) => (
                    <li key={k}>
                      <LinkChip href={f.links[k]!} platform={k} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <NextSection href={next.href} word={next.label} caption={founders.map((f) => f.slug).join(" · ")} />
    </main>
  );
}
