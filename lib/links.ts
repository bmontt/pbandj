// ── links ─────────────────────────────────────────────────────────────────────
// Which platform an outbound link points at, so every link can carry that
// platform's own icon and name (components/link-chip.tsx), and which links
// have an official player (lib/embeds.ts).

export type Platform =
  | "instagram"
  | "soundcloud"
  | "spotify"
  | "youtube"
  | "github"
  | "email"
  | "tickets"
  | "map"
  | "web";

export const PLATFORM_NAME: Record<Platform, string> = {
  instagram: "Instagram",
  soundcloud: "SoundCloud",
  spotify: "Spotify",
  youtube: "YouTube",
  github: "GitHub",
  email: "email",
  tickets: "tickets",
  map: "map",
  web: "website",
};

const TICKET_HOSTS = ["posh.vip", "ra.co", "dice.fm", "eventbrite.com", "seetickets.us", "tixr.com", "ticketmaster.com", "shotgun.live"];

export function platformOf(href: string): Platform {
  if (href.startsWith("mailto:")) return "email";
  let host: string;
  try {
    host = new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "web";
  }
  const is = (h: string) => host === h || host.endsWith(`.${h}`);
  if (is("instagram.com")) return "instagram";
  if (is("soundcloud.com") || host === "on.soundcloud.com") return "soundcloud";
  if (is("spotify.com") || host === "spotify.link") return "spotify";
  if (is("youtube.com") || host === "youtu.be") return "youtube";
  if (is("github.com")) return "github";
  if (is("maps.google.com") || is("maps.apple.com") || (is("google.com") && href.includes("/maps"))) return "map";
  if (TICKET_HOSTS.some(is)) return "tickets";
  return "web";
}

/** "instagram.com/brodymontag" — for links whose label is the place itself */
export function shortHref(href: string): string {
  if (href.startsWith("mailto:")) return href.slice(7);
  try {
    const u = new URL(href);
    return (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
  } catch {
    return href;
  }
}
