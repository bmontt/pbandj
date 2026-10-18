// ── /releases ─────────────────────────────────────────────────────────────────
// The original "Latest Releases" section: the founders' newest releases,
// fetched on the server (lib/tracks.ts) and cached with the page for an hour.
// The SoundCloud playlist the old home page played on its own now waits
// behind a click.

import NextSection from "@/components/next-section";
import Opener from "@/components/opener";
import SoundCloudEmbed from "@/components/soundcloud-embed";
import TrackGrid from "@/components/track-grid";
import { content } from "@/lib/content";
import { pageMeta } from "@/lib/meta";
import { nextOf, section } from "@/lib/sections";
import { getTracks } from "@/lib/tracks";

export const revalidate = 3600;

export const metadata = pageMeta({ title: content.releases.heading, description: content.site.description, path: "/releases" });

const PLAYLIST = process.env.NEXT_PUBLIC_SOUNDCLOUD_PLAYLIST_URL;

export default async function ReleasesPage() {
  const s = section("releases");
  const next = nextOf("releases");
  const tracks = await getTracks(9);
  const playlist = PLAYLIST && !PLAYLIST.includes("/you/") ? PLAYLIST : null;

  // scene id "sounds": the stage's contract predates the rename to /releases
  return (
    <main data-stage-scene="sounds" className="relative z-10">
      <Opener index={s.index} label={s.label} title={s.heading} />

      <section aria-label={s.heading} data-stage-anchor="latest" className="px-5 md:px-12">
        <div className="mx-auto max-w-6xl">
          {tracks.length ? (
            <TrackGrid tracks={tracks} />
          ) : (
            <p className="font-mono text-xs text-foreground/60" data-reveal>
              No releases to show right now.
            </p>
          )}
        </div>
      </section>

      {playlist && (
        <section aria-label="SoundCloud playlist" data-stage-anchor="mixes" className="mt-24 px-5 md:mt-32 md:px-12">
          <div className="mx-auto max-w-6xl" data-reveal>
            <SoundCloudEmbed url={playlist} title="SoundCloud playlist" />
          </div>
        </section>
      )}

      <NextSection href={next.href} word={next.name} caption={next.label} />
    </main>
  );
}
