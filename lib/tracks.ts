// ── tracks ────────────────────────────────────────────────────────────────────
// Server-side releases for /releases and the landing's "now" line, fetched at
// render and cached with the page (ISR, hourly). The same sources the old
// /api/latest-tracks route used, which stays as-is for anything still
// calling it:
//   - Spotify: each founder's artist page (needs SPOTIFY_CLIENT_ID and
//     SPOTIFY_CLIENT_SECRET), one request per artist for their releases;
//   - SoundCloud: each founder's profile except Brody's (the old rule), via
//     soundcloud-scraper.
// Every source is bounded by a timeout and fails soft: no credentials, a
// rate limit or a slow scrape gives an empty list, never a broken page.

import { founders, type FounderId } from "./content";

export interface Track {
  id: string;
  title: string;
  /** the founder's stage name */
  artist: string;
  founder: FounderId;
  image?: string;
  url: string;
  /** "2025-06-13" */
  releaseDate: string;
  platform: "spotify" | "soundcloud";
  /** "single", "album", "track" */
  kind: string;
}

const TIMEOUT_MS = 6000;
const REVALIDATE = 3600;

function withTimeout<T>(p: Promise<T>, fallback: T, ms = TIMEOUT_MS): Promise<T> {
  return Promise.race([p.catch(() => fallback), new Promise<T>((r) => setTimeout(() => r(fallback), ms))]);
}

async function spotifyToken(): Promise<string | null> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) return null;
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    // tokens last an hour: cache a little less than that
    next: { revalidate: 3000 },
  });
  if (!res.ok) return null;
  return ((await res.json()) as { access_token?: string }).access_token ?? null;
}

async function spotifyReleases(token: string, url: string, artist: string, founder: FounderId): Promise<Track[]> {
  const id = url.match(/\/artist\/([a-zA-Z0-9]+)/)?.[1];
  if (!id) return [];
  const res = await fetch(`https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=20`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    items?: { id: string; name: string; album_type: string; release_date: string; images: { url: string }[]; external_urls: { spotify: string } }[];
  };
  return (data.items ?? []).map((a) => ({
    id: `spotify_${a.id}`,
    title: a.name,
    artist,
    founder,
    image: a.images[0]?.url,
    url: a.external_urls.spotify,
    releaseDate: a.release_date,
    platform: "spotify" as const,
    kind: a.album_type,
  }));
}

interface ScrapedTrack {
  title?: string;
  url?: string;
  publishedAt?: Date | string;
}

async function soundcloudTracks(url: string, artist: string, founder: FounderId): Promise<Track[]> {
  const username = url.match(/soundcloud\.com\/([^/?]+)/)?.[1];
  if (!username) return [];
  const { Client } = await import("soundcloud-scraper");
  const user = (await new Client().getUser(username)) as { tracks?: ScrapedTrack[] } | undefined;
  const tracks = (user?.tracks ?? []).filter((t): t is ScrapedTrack & { title: string; url: string } => !!t.title && !!t.url).slice(0, 12);
  return Promise.all(
    tracks.map(async (t) => {
      const published = t.publishedAt instanceof Date ? t.publishedAt.toISOString() : typeof t.publishedAt === "string" ? t.publishedAt : "";
      let image: string | undefined;
      try {
        const o = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(t.url)}`, { next: { revalidate: REVALIDATE } });
        if (o.ok) image = ((await o.json()) as { thumbnail_url?: string }).thumbnail_url?.replace("-large", "-t500x500");
      } catch {
        // no artwork: the card shows a plain tile
      }
      return {
        id: `soundcloud_${t.url.split("/").pop()}`,
        title: t.title,
        artist,
        founder,
        image,
        url: t.url,
        releaseDate: published.slice(0, 10),
        platform: "soundcloud" as const,
        kind: "track",
      };
    }),
  );
}

/** The founders' latest releases, newest first. Empty when no source answers. */
export async function getTracks(limit = 9): Promise<Track[]> {
  const token = await withTimeout(spotifyToken(), null);
  const jobs: Promise<Track[]>[] = [];
  for (const f of founders) {
    if (f.links.spotify && token) jobs.push(withTimeout(spotifyReleases(token, f.links.spotify, f.alias, f.id), []));
    if (f.links.soundcloud && f.id !== "b") jobs.push(withTimeout(soundcloudTracks(f.links.soundcloud, f.alias, f.id), []));
  }
  const all = (await Promise.all(jobs)).flat().filter((t) => t.releaseDate);
  return all.sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1)).slice(0, limit);
}
