// ── content ───────────────────────────────────────────────────────────────────
// The typed face of lib/content.json, the single source of truth for every
// page, the sitemap, the JSON-LD and /llms.txt. It checks the file when the
// site builds, so a bad date, slug, founder id or media path fails the build
// with a message saying which entry, instead of shipping a broken page.
// How to add an event: CONTENT.md.

import data from "./content.json";
import mediaManifest from "./media.json";
import { isIsoDate, isUpcoming } from "./dates";

export type FounderId = "p" | "b" | "j";

export interface MediaItem {
  type: "image" | "video";
  src: string;
}

export interface Link {
  label: string;
  href: string;
}

export interface Event {
  slug: string;
  title: string;
  city?: string;
  /** ISO 8601 at known precision; see lib/dates.ts */
  date: string;
  /** the founders behind it (their sets, their lights) */
  crew: FounderId[];
  description: string;
  media: MediaItem[];
  links?: Link[];
}

export interface Founder {
  id: FounderId;
  slug: string;
  name: string;
  alias: string;
  role: string;
  bio: string[];
  quote: string;
  image: string;
  gear: string[];
  supports: string[];
  /** on the unconfirmed pbanjsounds.com domain: not rendered (see site._emailNote) */
  email: string;
  links: { instagram?: string; spotify?: string; soundcloud?: string; github?: string };
}

export interface SupportArtist {
  name: string;
  logo: string;
}

export interface Moment {
  src: string;
  alt: string;
}

export interface Content {
  site: {
    name: string;
    short: string;
    domain: string;
    description: string;
    tagline: string;
    genres: string[];
    founded: string;
    email: string;
    instagram: string;
  };
  collective: { blurb: string; moments: Moment[] };
  founders: Founder[];
  supportArtists: SupportArtist[];
  events: Event[];
  join: { label: string; heading: string; intro: string; roles: string[]; send: string; subject: string };
}

export interface MediaInfo {
  w: number;
  h: number;
  poster?: string;
  trimmed?: string;
  tw?: number;
  th?: number;
}

export const content = data as Content;
export const media = mediaManifest as Record<string, MediaInfo>;
export const ORIGIN = `https://${content.site.domain}`;

// ── validation (runs once, at build) ─────────────────────────────────────────
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function validate(c: Content) {
  const problems: string[] = [];
  const ids = new Set(c.founders.map((f) => f.id));
  const slugs = new Set<string>();
  for (const e of c.events) {
    const where = `events › "${e.title}"`;
    if (!SLUG.test(e.slug)) problems.push(`${where}: slug "${e.slug}" must be lowercase words joined by hyphens`);
    if (slugs.has(e.slug)) problems.push(`${where}: slug "${e.slug}" is used twice`);
    slugs.add(e.slug);
    if (!isIsoDate(e.date)) problems.push(`${where}: date "${e.date}" is not ISO (2026-02, 2026-02-14 or 2026-02-14T22:00-05:00)`);
    if (!e.crew.length || e.crew.some((id) => !ids.has(id))) problems.push(`${where}: crew must list founder ids (p, b, j)`);
    for (const m of e.media) {
      if (m.type !== "image" && m.type !== "video") problems.push(`${where}: media type "${m.type}" must be image or video`);
      if (!m.src.startsWith("/")) problems.push(`${where}: media src "${m.src}" must start with / (a path under public/)`);
    }
  }
  if (problems.length) throw new Error(`lib/content.json has problems:\n  - ${problems.join("\n  - ")}`);
}
validate(content);

// ── accessors ────────────────────────────────────────────────────────────────

export const founders = content.founders;
export const founderById = (id: FounderId) => founders.find((f) => f.id === id)!;
export const founderBySlug = (slug: string) => founders.find((f) => f.slug === slug);

/** every event, newest first (stable within a month: file order) */
export const events: Event[] = [...content.events].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
export const eventBySlug = (slug: string) => events.find((e) => e.slug === slug);

/** upcoming events, soonest first */
export const upcoming = (now: Date = new Date()) => events.filter((e) => isUpcoming(e.date, now)).reverse();
/** played events, newest first */
export const past = (now: Date = new Date()) => events.filter((e) => !isUpcoming(e.date, now));

export const eventsFor = (id: FounderId) => events.filter((e) => e.crew.includes(id));

/** the image to show for an event in a list: its first photo, else a video's poster */
export function coverOf(e: Event): { src: string; w: number; h: number } | null {
  for (const m of e.media) {
    const info = media[m.src];
    if (m.type === "image" && info) return { src: m.src, w: info.w, h: info.h };
  }
  for (const m of e.media) {
    const info = media[m.src];
    if (m.type === "video" && info?.poster) return { src: info.poster, w: info.w, h: info.h };
  }
  return null;
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "Peter Jacob was born and raised in Silver Spring, MD." — up to the first full stop */
export const firstSentence = (s: string) => s.match(/^.+?[.!?]['"”’]?(?=\s|$)/)?.[0] ?? s;
