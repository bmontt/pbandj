// ── /sounds ───────────────────────────────────────────────────────────────────
// The founders' latest releases, fetched on the server (lib/tracks.ts) and
// cached with the page for an hour; the mix playlist behind a click; and
// where to follow each of them. If no source answers, the page still lists
// every profile, so it never shows an empty grid.

import Image from "next/image";
import NextSection from "@/components/next-section";
import Opener from "@/components/opener";
import SoundCloudEmbed from "@/components/soundcloud-embed";
import { ICONS } from "@/components/icons";
import { founders } from "@/lib/content";
import { formatShort } from "@/lib/dates";
import { pageMeta } from "@/lib/meta";
import { nextOf, section } from "@/lib/sections";
import { getTracks } from "@/lib/tracks";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "sounds",
  description: "Latest releases, tracks and mixes from the PB&J Sounds collective: Peter Jacob, Monty and Humphreys.",
  path: "/sounds",
});

const PLAYLIST = process.env.NEXT_PUBLIC_SOUNDCLOUD_PLAYLIST_URL;
const LINK_ORDER = ["spotify", "soundcloud", "instagram"] as const;

export default async function SoundsPage() {
  const s = section("sounds");
  const next = nextOf("sounds");
  const tracks = await getTracks(9);
  const playlist = PLAYLIST && !PLAYLIST.includes("/you/") ? PLAYLIST : null;

  return (
    <main data-stage-scene="sounds" className="relative z-10">
      <Opener
        index={s.index}
        label={s.label}
        title="sounds"
        line={<p className="display-sub text-foreground/85">Releases, tracks and mixes from the collective, newest first.</p>}
      />

      <section aria-labelledby="latest" data-stage-anchor="latest" className="px-5 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="latest" className="label rule-line mb-8">
            <span>latest</span>
          </h2>
          {tracks.length ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8">
              {tracks.map((t) => (
                <li key={t.id} data-reveal data-founder={t.founder}>
                  <a href={t.url} target="_blank" rel="noopener noreferrer" className="group block">
                    <span className="frame relative block aspect-square overflow-hidden">
                      {t.image ? (
                        <Image src={t.image} alt="" fill sizes="(min-width: 768px) 22rem, 46vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                      ) : (
                        // no artwork (some tracks block embeds): the founder's letter
                        <span aria-hidden="true" className="display-hero halo-none absolute inset-0 flex items-center justify-center text-founder/70">
                          {t.founder.toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="mt-3 block font-sans text-lg leading-snug text-foreground md:text-xl">{t.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-xs text-foreground/55">
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-founder" />
                      {t.artist.toLowerCase()} · {t.kind} · {formatShort(t.releaseDate)} · {t.platform} ↗
                    </span>
                  </a>
                </li>
              ))}
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
            <SoundCloudEmbed url={playlist} title="the pb&j playlist" />
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
              </li>
            ))}
          </ul>
        </div>
      </section>

      <NextSection href={next.href} word={next.label} caption={founders.map((f) => f.slug).join(" · ")} />
    </main>
  );
}
