import { artists } from "@/lib/artists";

export interface Track {
  id: string;
  title: string;
  artist: string;
  nickname: string;
  image: string;
  url: string;
  releaseDate: string;
  platform: "spotify" | "soundcloud";
}

// Largest `limit` the API serves. Artist pages request 30 and filter client-side.
export const MAX_TRACKS = 50;

const FETCH_TIMEOUT_MS = 5_000;
const SOUNDCLOUD_TIMEOUT_MS = 8_000;
const SOURCES_DEADLINE_MS = 9_000;
const ARTWORK_TIMEOUT_MS = 3_000;
const ARTWORK_CONCURRENCY = 6;
const SPOTIFY_TRACK_CONCURRENCY = 4;

// Complete results are reused for an hour; partial ones (a source failed or timed
// out) only for five minutes so a transient failure doesn't stick.
export const FULL_TTL_SECONDS = 60 * 60;
export const PARTIAL_TTL_SECONDS = 5 * 60;
const ARTWORK_TTL_MS = 24 * 60 * 60 * 1000;

type Candidates = { tracks: Track[]; complete: boolean; expiresAt: number };

let cached: Candidates | null = null;
let inflight: Promise<Candidates> | null = null;
const artworkCache = new Map<string, { image: string; expiresAt: number }>();

function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = FETCH_TIMEOUT_MS) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}

function timeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

// Runs `worker` over `items` with at most `concurrency` in flight.
async function mapLimit<T, R>(items: T[], concurrency: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

function byNewest(a: { releaseDate: string }, b: { releaseDate: string }) {
  return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
}

// ---------- Spotify ----------

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.warn("[tracks] SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set; skipping Spotify");
    return null;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetchWithTimeout("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) throw new Error(`Spotify auth failed: ${response.status}`);
  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

async function getSpotifyTracks(artistUrl: string, token: string, artistName: string, nickname: string): Promise<Track[]> {
  const artistId = artistUrl.match(/\/artist\/([a-zA-Z0-9]+)/)?.[1];
  if (!artistId) {
    console.warn(`[tracks] Could not extract Spotify artist ID from ${artistUrl}`);
    return [];
  }
  const headers = { Authorization: `Bearer ${token}` };

  const albumResponse = await fetchWithTimeout(
    `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&include_groups=album,single`,
    { headers },
  );
  if (!albumResponse.ok) throw new Error(`Spotify album list failed: ${albumResponse.status}`);

  const albumData = (await albumResponse.json()) as {
    items: Array<{ id: string; release_date: string; total_tracks?: number; images: Array<{ url: string }> }>;
  };

  // Newest albums first, and only as many as needed to cover MAX_TRACKS tracks:
  // every track shares its album's release date, so older albums can't make the cut.
  const albums = [...albumData.items].sort((a, b) => byNewest({ releaseDate: a.release_date }, { releaseDate: b.release_date }));
  const needed: typeof albums = [];
  let trackCount = 0;
  for (const album of albums) {
    if (trackCount >= MAX_TRACKS) break;
    needed.push(album);
    trackCount += album.total_tracks ?? 1;
  }

  const perAlbum = await mapLimit(needed, SPOTIFY_TRACK_CONCURRENCY, async (album): Promise<Track[]> => {
    try {
      const tracksResponse = await fetchWithTimeout(`https://api.spotify.com/v1/albums/${album.id}/tracks?limit=50`, { headers });
      if (!tracksResponse.ok) {
        console.error(`[tracks] Spotify tracks failed for album ${album.id}: ${tracksResponse.status}`);
        return [];
      }
      const tracksData = (await tracksResponse.json()) as {
        items: Array<{ id: string; name: string; external_urls: { spotify: string } }>;
      };
      return tracksData.items.map((track) => ({
        id: `spotify_${track.id}`,
        title: track.name,
        artist: artistName,
        nickname,
        image: album.images[0]?.url || "",
        url: track.external_urls.spotify,
        releaseDate: album.release_date,
        platform: "spotify" as const,
      }));
    } catch (error) {
      console.error(`[tracks] Spotify tracks failed for album ${album.id}:`, error instanceof Error ? error.message : error);
      return [];
    }
  });

  return perAlbum.flat().sort(byNewest).slice(0, MAX_TRACKS);
}

// ---------- SoundCloud ----------

async function getSoundCloudTracks(profileUrl: string, artistName: string, nickname: string): Promise<Track[]> {
  const username = profileUrl.match(/soundcloud\.com\/([^/?]+)/)?.[1];
  if (!username) {
    console.warn(`[tracks] Could not extract SoundCloud username from ${profileUrl}`);
    return [];
  }

  // Dynamic import to avoid server-side module loading issues
  const SoundCloudScraper = await import("soundcloud-scraper");
  const scraper = new SoundCloudScraper.Client();
  const userInfo = await timeout(scraper.getUser(username), SOUNDCLOUD_TIMEOUT_MS, `SoundCloud ${username}`);
  if (!userInfo?.tracks?.length) return [];

  const tracks = userInfo.tracks.map((track): Track => {
    // Extract track ID from URL (last segment or use full URL as fallback)
    const trackId = track.url?.match(/\/([^/?]+)(?:\?|$)/)?.[1] ?? track.url ?? "unknown";

    let releaseDate = new Date().toISOString().split("T")[0];
    const publishedAt = track.publishedAt as unknown;
    if (publishedAt instanceof Date && !Number.isNaN(publishedAt.getTime())) {
      releaseDate = publishedAt.toISOString().split("T")[0];
    } else if (typeof publishedAt === "string" && publishedAt) {
      releaseDate = publishedAt.split("T")[0];
    }

    return {
      id: `soundcloud_${trackId}`,
      title: track.title,
      artist: artistName,
      nickname,
      // Artwork is filled in later, only for tracks that are actually returned.
      image: "",
      url: track.url,
      releaseDate,
      platform: "soundcloud",
    };
  });

  return tracks.sort(byNewest).slice(0, MAX_TRACKS);
}

async function getSoundCloudArtwork(trackUrl: string): Promise<string> {
  const hit = artworkCache.get(trackUrl);
  if (hit && hit.expiresAt > Date.now()) return hit.image;

  let image = "";
  try {
    const response = await fetchWithTimeout(
      `https://soundcloud.com/oembed?url=${encodeURIComponent(trackUrl)}&format=json`,
      {},
      ARTWORK_TIMEOUT_MS,
    );
    if (response.ok) {
      const data = (await response.json()) as { thumbnail_url?: string };
      image = data.thumbnail_url?.replace("-large", "-t500x500") ?? "";
    }
  } catch {
    // Artwork is optional; leave it empty and retry on a later request.
    return "";
  }
  artworkCache.set(trackUrl, { image, expiresAt: Date.now() + ARTWORK_TTL_MS });
  return image;
}

// ---------- Aggregation ----------

// Collects the newest MAX_TRACKS tracks across all sources. Sources run in parallel
// under one deadline; whatever finished by then is used and the rest is logged.
async function collectCandidates(): Promise<Candidates> {
  const collected: Track[] = [];
  let failures = 0;

  const sources: Promise<void>[] = [];
  const run = (label: string, task: () => Promise<Track[]>) => {
    sources.push(
      task().then(
        (tracks) => {
          collected.push(...tracks);
        },
        (error) => {
          failures++;
          console.error(`[tracks] ${label} failed:`, error instanceof Error ? error.message : error);
        },
      ),
    );
  };

  const spotifyToken = getSpotifyToken().catch((error) => {
    failures++;
    console.error("[tracks] Spotify token failed:", error instanceof Error ? error.message : error);
    return null;
  });

  for (const artist of artists) {
    const spotifyUrl = artist.socialLinks.spotify;
    if (spotifyUrl) {
      run(`Spotify ${artist.name}`, async () => {
        const token = await spotifyToken;
        return token ? getSpotifyTracks(spotifyUrl, token, artist.name, artist.nickname) : [];
      });
    }
    // SoundCloud tracks - skip Brody's SoundCloud
    const soundcloudUrl = artist.socialLinks.soundcloud;
    if (soundcloudUrl && artist.id !== "b") {
      run(`SoundCloud ${artist.name}`, () => getSoundCloudTracks(soundcloudUrl, artist.name, artist.nickname));
    }
  }

  let deadline: ReturnType<typeof setTimeout> | undefined;
  const finishedInTime = await Promise.race([
    Promise.allSettled(sources).then(() => true),
    new Promise<false>((resolve) => {
      deadline = setTimeout(() => resolve(false), SOURCES_DEADLINE_MS);
    }),
  ]);
  clearTimeout(deadline);
  if (!finishedInTime) console.error(`[tracks] Some sources missed the ${SOURCES_DEADLINE_MS}ms deadline; returning partial results`);

  const complete = finishedInTime && failures === 0;
  const ttl = complete ? FULL_TTL_SECONDS : PARTIAL_TTL_SECONDS;
  return {
    tracks: [...collected].sort(byNewest).slice(0, MAX_TRACKS),
    complete,
    expiresAt: Date.now() + ttl * 1000,
  };
}

async function getCandidates(): Promise<Candidates> {
  if (cached && cached.expiresAt > Date.now()) return cached;
  if (!inflight) {
    inflight = collectCandidates()
      .then((result) => {
        // Don't keep an empty list around; try again on the next request.
        if (result.tracks.length > 0) cached = result;
        return result;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function getLatestTracks(limit: number): Promise<{ tracks: Track[]; complete: boolean }> {
  const candidates = await getCandidates();
  // Apply the limit before fetching artwork, so only returned tracks cost a request.
  const tracks = candidates.tracks.slice(0, limit);
  const withArt = await mapLimit(tracks, ARTWORK_CONCURRENCY, async (track) =>
    track.platform === "soundcloud" && !track.image ? { ...track, image: await getSoundCloudArtwork(track.url) } : track,
  );
  return { tracks: withArt, complete: candidates.complete && candidates.tracks.length > 0 };
}
