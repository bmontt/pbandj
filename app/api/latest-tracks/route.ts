import { artists } from "@/lib/artists";

interface Track {
  id: string;
  title: string;
  artist: string;
  nickname: string;
  image: string;
  url: string;
  releaseDate: string;
  platform: "spotify" | "soundcloud";
}

// Get Spotify access token
async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Spotify credentials");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Spotify auth failed: ${response.statusText}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

// Fetch Spotify tracks for an artist
async function getSpotifyTracks(
  artistUrl: string,
  token: string,
  artistName: string,
  nickname: string
): Promise<Track[]> {
  try {
    // Extract artist ID from URL - handle both /artist/ID and /artist/ID?si=...
    const match = artistUrl.match(/\/artist\/([a-zA-Z0-9]+)/);
    const artistId = match ? match[1] : null;

    if (!artistId) {
      console.log(`[Spotify] Could not extract artist ID from URL: ${artistUrl}`);
      return [];
    }

    console.log(`[Spotify] Fetching tracks for artist ID: ${artistId}`);

    // Get artist's albums
    const albumResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/albums?limit=50&include_groups=album,single`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!albumResponse.ok) {
      console.error(
        `[Spotify] Album fetch failed for ${artistId}: ${albumResponse.statusText}`
      );
      return [];
    }

    const albumData = (await albumResponse.json()) as {
      items: Array<{ id: string; release_date: string; images: Array<{ url: string }> }>;
    };
    const tracks: Track[] = [];

    console.log(`[Spotify] Found ${albumData.items.length} albums for ${artistName}`);

    // Get tracks from each album
    for (const album of albumData.items) {
      const tracksResponse = await fetch(
        `https://api.spotify.com/v1/albums/${album.id}/tracks?limit=50`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!tracksResponse.ok) {
        console.error(
          `[Spotify] Track fetch failed for album ${album.id}: ${tracksResponse.statusText}`
        );
        continue;
      }

      const tracksData = (await tracksResponse.json()) as {
        items: Array<{
          id: string;
          name: string;
          artists: Array<{ name: string }>;
          external_urls: { spotify: string };
        }>;
      };

      tracksData.items.forEach((track) => {
        tracks.push({
          id: `spotify_${track.id}`,
          title: track.name,
          artist: artistName,
          nickname,
          image: album.images[0]?.url || "",
          url: track.external_urls.spotify,
          releaseDate: album.release_date,
          platform: "spotify",
        });
      });
    }

    console.log(`[Spotify] Fetched ${tracks.length} tracks for ${artistName}`);
    return tracks;
  } catch (error) {
    console.error(`[Spotify] Error for ${artistName}:`, error);
    return [];
  }
}

// Fetch SoundCloud tracks for a user
async function getSoundCloudTracks(
  profileUrl: string,
  artistName: string,
  nickname: string
): Promise<Track[]> {
  try {
    // Extract username from SoundCloud URL
    const match = profileUrl.match(/soundcloud\.com\/([^/?]+)/);
    const username = match ? match[1] : null;

    if (!username) {
      console.log(`[SoundCloud] Could not extract username from URL: ${profileUrl}`);
      return [];
    }

    console.log(`[SoundCloud] Fetching tracks for user: ${username} using scraper`);

    // Dynamic import to avoid server-side module loading issues
    const SoundCloudScraper = await import("soundcloud-scraper");
    const scraper = new SoundCloudScraper.Client();
    
    // Get user info
    let userInfo: any;
    try {
      userInfo = await scraper.getUser(username);
    } catch (error) {
      console.log(`[SoundCloud] Could not get user info for: ${username}`);
      return [];
    }

    if (!userInfo || !userInfo.tracks || userInfo.tracks.length === 0) {
      console.log(`[SoundCloud] No tracks found for user: ${username}`);
      return [];
    }

    console.log(`[SoundCloud] Found ${userInfo.tracks.length} tracks for user: ${username}`);

    // Fetch artwork for each track
    const tracksWithArt: Track[] = await Promise.all(
      userInfo.tracks.slice(0, 50).map(async (track: any) => {
        // Extract track ID from URL (last segment or use full URL as fallback)
        const trackIdMatch = track.url?.match(/\/([^/?]+)(?:\?|$)/);
        const trackId = trackIdMatch ? trackIdMatch[1] : track.url || "unknown";
        
        // Format the date properly - publishedAt is a Date object
        let releaseDate = new Date().toISOString().split("T")[0];
        if (track.publishedAt) {
          try {
            if (track.publishedAt instanceof Date) {
              releaseDate = track.publishedAt.toISOString().split("T")[0];
            } else if (typeof track.publishedAt === "string") {
              releaseDate = track.publishedAt.split("T")[0];
            }
          } catch (e) {
            // Keep default date
          }
        }
        
        // Try to fetch artwork from OEmbed API
        let artwork = "";
        try {
          const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(track.url)}&format=json`;
          const oembedResponse = await fetch(oembedUrl);
          if (oembedResponse.ok) {
            const oembedData = await oembedResponse.json() as any;
            // Extract artwork URL from the HTML thumbnail_url or from the response
            if (oembedData.thumbnail_url) {
              artwork = oembedData.thumbnail_url;
              if (artwork.includes("-large")) {
                artwork = artwork.replace("-large", "-t500x500");
              }
            }
          }
        } catch (e) {
          // Silently fail, artwork remains empty
        }
        
        return {
          id: `soundcloud_${trackId}`,
          title: track.title,
          artist: artistName,
          nickname,
          image: artwork,
          url: track.url,
          releaseDate,
          platform: "soundcloud",
        };
      })
    );

    console.log(`[SoundCloud] Fetched ${tracksWithArt.length} tracks for ${artistName}`);
    return tracksWithArt;
  } catch (error) {
    console.error(`[SoundCloud] Error for ${artistName}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    console.log("[API] Starting track fetch...");
    const allTracks: Track[] = [];
    let spotifyToken: string | null = null;

    // Try to get Spotify token
    try {
      spotifyToken = await getSpotifyToken();
      console.log("[API] Spotify token obtained successfully");
    } catch (error) {
      console.error("[API] Failed to get Spotify token:", error);
    }

    // Fetch tracks from each artist
    for (const artist of artists) {
      // Spotify tracks
      if (artist.socialLinks.spotify && spotifyToken) {
        const spotifyTracks = await getSpotifyTracks(
          artist.socialLinks.spotify,
          spotifyToken,
          artist.name,
          artist.nickname
        );
        allTracks.push(...spotifyTracks);
      }

      // SoundCloud tracks - skip Brody's SoundCloud
      if (artist.socialLinks.soundcloud && artist.id !== "b") {
        const soundcloudTracks = await getSoundCloudTracks(
          artist.socialLinks.soundcloud,
          artist.name,
          artist.nickname
        );
        allTracks.push(...soundcloudTracks);
      }
    }

    console.log(`[API] Total tracks collected: ${allTracks.length}`);

    if (allTracks.length === 0) {
      console.warn("[API] No tracks found from any source");
      return Response.json([], { status: 200 });
    }

    // Sort by release date (newest first) and get top 9
    const sorted = allTracks
      .sort(
        (a, b) =>
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      )
      .slice(0, 9);

    console.log(`[API] Returning ${sorted.length} top tracks`);
    return Response.json(sorted, { status: 200 });
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return Response.json([], { status: 200 });
  }
}
