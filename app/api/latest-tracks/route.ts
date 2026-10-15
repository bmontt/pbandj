import { FULL_TTL_SECONDS, MAX_TRACKS, PARTIAL_TTL_SECONDS, getLatestTracks } from "@/lib/server/tracks";

// Newest releases across the collective's Spotify and SoundCloud profiles.
// Response shape: Track[] (see lib/server/tracks.ts), newest first.
//
// Caching: results are cached in memory per instance (1 h, 5 min if partial) and
// the response carries s-maxage so Vercel's CDN serves repeat requests without
// invoking the function. Stale responses are served while the CDN revalidates.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = Number.parseInt(searchParams.get("limit") || "9", 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), MAX_TRACKS) : 9;

  try {
    const { tracks, complete } = await getLatestTracks(limit);
    const ttl = complete ? FULL_TTL_SECONDS : PARTIAL_TTL_SECONDS;
    return Response.json(tracks, {
      status: 200,
      headers: {
        "Cache-Control": tracks.length
          ? `public, s-maxage=${ttl}, stale-while-revalidate=86400`
          : "public, s-maxage=60",
      },
    });
  } catch (error) {
    console.error("[latest-tracks] Unexpected error:", error instanceof Error ? error.message : error);
    return Response.json([], { status: 200, headers: { "Cache-Control": "public, s-maxage=60" } });
  }
}
