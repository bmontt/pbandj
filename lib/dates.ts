// ── dates ─────────────────────────────────────────────────────────────────────
// Content dates are ISO 8601 at the precision we know:
//   "2025"                        a year
//   "2025-04"                     a month
//   "2026-10-24"                  a day
//   "2026-10-24T22:00-04:00"      doors, with the offset (turns on the countdown)
// Strings at these precisions sort correctly as plain strings, so ordering is
// a string compare. "Today" is the East Coast's, not the server's: Vercel runs
// in UTC, where a 10pm show's date ends at 8pm Eastern.

export type Precision = "year" | "month" | "day" | "time";

const ISO = /^(\d{4})(?:-(\d{2})(?:-(\d{2})(?:T(\d{2}):(\d{2})(?::\d{2})?(?:Z|[+-]\d{2}:\d{2}))?)?)?$/;

export function precision(iso: string): Precision {
  const m = ISO.exec(iso);
  if (!m) throw new Error(`content: "${iso}" is not an ISO date (2025, 2025-04, 2025-04-12 or 2025-04-12T22:00-04:00)`);
  return m[4] ? "time" : m[3] ? "day" : m[2] ? "month" : "year";
}

export const isIsoDate = (iso: string) => ISO.test(iso);

export const TZ = "America/New_York";
const EAST_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });

/** "2026-10-15" — today on the East Coast */
export function easternToday(now: Date = new Date()): string {
  return EAST_DAY.format(now);
}

/** How long a show with doors listed stays "on" after they open. */
const ON_FOR_MS = 6 * 3600_000;

/**
 * Upcoming until it has happened:
 * - with doors listed, until six hours after doors;
 * - with a day, through that day (Eastern);
 * - with only a month (or year), only while that month is still ahead. On the
 *   1st it moves to the archive, so give a day when you know it.
 */
export function isUpcoming(iso: string, now: Date = new Date()): boolean {
  const p = precision(iso);
  if (p === "time") return new Date(iso).getTime() + ON_FOR_MS > now.getTime();
  const today = easternToday(now);
  if (p === "day") return iso >= today;
  return iso > today.slice(0, iso.length);
}

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** "april 2025", "october 24, 2026", "october 24, 2026 · 10pm" */
export function formatDate(iso: string): string {
  const p = precision(iso);
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (p === "year") return y;
  const month = MONTHS[Number(m) - 1];
  if (p === "month") return `${month} ${y}`;
  const day = `${month} ${Number(d)}, ${y}`;
  if (p === "day") return day;
  const time = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" })
    .format(new Date(iso))
    .toLowerCase()
    .replace(":00", "")
    .replace(" ", "");
  return `${day} · ${time}`;
}

/** "apr 2025" — the short form for dense lists */
export function formatShort(iso: string): string {
  const p = precision(iso);
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (p === "year") return y;
  const mon = MONTHS[Number(m) - 1].slice(0, 3);
  return p === "month" ? `${mon} ${y}` : `${mon} ${Number(d)}, ${y}`;
}

const dayNumber = (ymd: string) => Date.UTC(Number(ymd.slice(0, 4)), Number(ymd.slice(5, 7)) - 1, Number(ymd.slice(8, 10))) / 86400_000;

/**
 * The countdown in words, for an upcoming date: "tonight", "tomorrow",
 * "in 9 days", "in december". Exact to the hour when doors are listed.
 */
export function countdown(iso: string, now: Date = new Date()): string {
  const p = precision(iso);
  if (p === "time") {
    const ms = new Date(iso).getTime() - now.getTime();
    if (ms <= 0) return "on now";
    const h = Math.floor(ms / 3600_000);
    if (h < 1) return `in ${Math.max(1, Math.round(ms / 60_000))} min`;
    if (h < 24) return `in ${h} hour${h === 1 ? "" : "s"}`;
  }
  if (p === "time" || p === "day") {
    const target = p === "time" ? EAST_DAY.format(new Date(iso)) : iso;
    const days = dayNumber(target) - dayNumber(easternToday(now));
    if (days <= 0) return "tonight";
    if (days === 1) return "tomorrow";
    return `in ${days} days`;
  }
  if (p === "month") return `in ${MONTHS[Number(iso.slice(5, 7)) - 1]}`;
  return `in ${iso}`;
}
