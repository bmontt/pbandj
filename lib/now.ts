// ── now ───────────────────────────────────────────────────────────────────────
// The live line under the mark and on the section openers: the next event and
// its countdown when one is announced; otherwise the latest release; otherwise
// the last event played. Computed at render; pages re-render hourly
// (revalidate = 3600), so a show moves from "next" to the archive on its own.

import { countdown, formatDate, formatShort } from "./dates";
import { eventName, past, upcoming, type Event } from "./content";
import type { Track } from "./tracks";

export interface NowLine {
  kind: "next" | "latest" | "last";
  text: string;
  href: string;
  external?: boolean;
}

const where = (e: Event) => eventName(e).toLowerCase();

export function nextLine(e: Event, now: Date = new Date()): NowLine {
  return { kind: "next", text: `next: ${where(e)} · ${formatDate(e.date)} · ${countdown(e.date, now)}`, href: `/events/${e.slug}` };
}

export function nowLine(tracks: Track[], now: Date = new Date()): NowLine | null {
  const next = upcoming(now)[0];
  if (next) return nextLine(next, now);
  const latest = tracks[0];
  if (latest) {
    return { kind: "latest", text: `latest: ${latest.title.toLowerCase()} — ${latest.artist.toLowerCase()}`, href: latest.url, external: true };
  }
  const last = past(now)[0];
  if (last) return { kind: "last", text: `last: ${where(last)} · ${formatShort(last.date)}`, href: `/events/${last.slug}` };
  return null;
}
