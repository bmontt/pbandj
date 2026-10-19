// ── machine ───────────────────────────────────────────────────────────────────
// The machine-readable face of the site: /llms.txt (llmstxt.org), every fact
// as plain text, generated from content.json so it can't drift from the pages.

import { content, eventName, founders, ORIGIN, past, upcoming, type Event } from "./content";
import { formatDate } from "./dates";

const line = (e: Event) => {
  const crew = e.crew.map((id) => founders.find((f) => f.id === id)!.alias).join(", ");
  const where = eventName(e);
  return `- [${where}](${ORIGIN}/events/${e.slug}): ${formatDate(e.date)}${e.description ? ` — ${e.description}` : ""} · with ${crew}`;
};

export function llmsText(now: Date = new Date()): string {
  const { site, collective, join } = content;
  const L: string[] = [];
  L.push(`# ${site.name}`, "", `> ${site.description}`, "");
  L.push(collective.blurb, "");
  L.push(`Genres: ${site.genres.join(", ")}. Founded ${site.founded}. Contact: ${site.email}. Instagram: ${site.instagram}`, "");

  L.push("## Founders");
  for (const f of founders) L.push(`- [${f.alias} (${f.name})](${ORIGIN}/about/${f.slug}): ${f.role}. “${f.quote}”`);

  const soon = upcoming(now);
  L.push("", "## Next up");
  if (soon.length) for (const e of soon) L.push(line(e));
  else L.push(`- Nothing announced yet. Follow ${site.instagram}`);

  L.push("", "## Events played");
  for (const e of past(now)) L.push(line(e));

  L.push("", "## Join");
  L.push(`- [Open call](${ORIGIN}/join): ${join.intro} Roles: ${join.roles.join(", ")}. Send ${join.send}.`);

  L.push("", "## Optional");
  L.push(`- [Music](${ORIGIN}/music): latest releases from Spotify and SoundCloud`);
  L.push(`- [Sitemap](${ORIGIN}/sitemap.xml)`);
  return L.join("\n") + "\n";
}
