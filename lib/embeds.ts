// ── embeds ────────────────────────────────────────────────────────────────────
// The official player for a link, when the platform has one: SoundCloud's
// widget, Spotify's embed, YouTube (no-cookie). Pages never load these on
// arrival; components/embed-player.tsx swaps one in when someone presses play.

import type { FounderId } from "./content";
import { platformOf } from "./links";

export type EmbedPlatform = "soundcloud" | "spotify" | "youtube";

export interface Embed {
  platform: EmbedPlatform;
  src: string;
}

// SoundCloud tints its play button and waveform with one hex color: each
// founder's color from the original site, else the logo cream's warm sibling.
const TINT: Record<FounderId | "site", string> = { p: "b58657", b: "c44d58", j: "935bad", site: "b58657" };

const SPOTIFY_PATH = /^\/(?:intl-[a-z-]+\/)?(track|album|artist|playlist|episode|show)\/([A-Za-z0-9]+)/;

export function embedFor(href: string, tint: FounderId | "site" = "site"): Embed | null {
  const platform = platformOf(href);
  let u: URL;
  try {
    u = new URL(href);
  } catch {
    return null;
  }

  if (platform === "spotify") {
    const m = u.pathname.match(SPOTIFY_PATH);
    if (!m) return null;
    return { platform, src: `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator&theme=0` };
  }

  if (platform === "soundcloud") {
    const q = new URLSearchParams({
      url: `https://soundcloud.com${u.pathname}`,
      color: `#${TINT[tint]}`,
      auto_play: "true",
      visual: "true",
      hide_related: "true",
      show_comments: "false",
      show_reposts: "false",
      show_teaser: "false",
    });
    return { platform, src: `https://w.soundcloud.com/player/?${q}` };
  }

  if (platform === "youtube") {
    const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
    if (!id || !/^[\w-]{6,}$/.test(id)) return null;
    return { platform, src: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0` };
  }

  return null;
}
