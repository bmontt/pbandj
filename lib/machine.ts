// ── machine ───────────────────────────────────────────────────────────────────
// The machine-readable face of the site: /llms.txt (llmstxt.org), every fact
// as plain text, generated from content.json so it can't drift from the pages.

import { content, founders, ORIGIN, past, upcoming, type Event } from "./content";
import { formatDate } from "./dates";

const line = (e: Event) => {
  const crew = e.crew.map((id) => founders.find((f) => f.id === id)!.name).join(", ");
  return `- [${e.title}](${ORIGIN}/events/${e.slug}): ${formatDate(e.date)}${e.description ? ` — ${e.description}` : ""} · ${crew}`;
};

export function llmsText(now: Date = new Date()): string {
  const { site, collective, highlights, join } = content;
  const L: string[] = [];
  L.push(`# ${site.name}`, "", `> ${site.description}`, "");
  L.push(collective.blurb, "");

  L.push("## Founders");
  for (const f of founders) L.push(`- [${f.name} (${f.alias})](${ORIGIN}/collective/${f.slug}): ${f.role}. “${f.quote}”`);

  const soon = upcoming(now);
  if (soon.length) {
    L.push("", "## Next up");
    for (const e of soon) L.push(line(e));
  }

  L.push("", `## ${highlights.heading}`);
  for (const e of past(now)) L.push(line(e));

  L.push("", `## ${join.heading}`);
  L.push(`- [${join.heading}](${ORIGIN}/join): ${join.intro}`);

  L.push("", "## Optional");
  L.push(`- [${content.releases.heading}](${ORIGIN}/sounds)`);
  L.push(`- [Sitemap](${ORIGIN}/sitemap.xml)`);
  return L.join("\n") + "\n";
}
