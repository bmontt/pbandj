// ── /events ───────────────────────────────────────────────────────────────────
// Next up (with its countdown) when something is announced, then every night
// played, newest first, grouped by year. Server-rendered from content.json and
// re-rendered hourly, so a show moves to the archive on its own.

import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/countdown";
import Crew from "@/components/crew";
import JsonLd from "@/components/json-ld";
import NextSection from "@/components/next-section";
import NowLine from "@/components/now-line";
import Opener from "@/components/opener";
import { cityLabel, content, coverOf, past, plural, upcoming } from "@/lib/content";
import { countdown, formatDate, formatShort } from "@/lib/dates";
import { pageMeta } from "@/lib/meta";
import { nextLine } from "@/lib/now";
import { eventLd } from "@/lib/schema";
import { nextOf, section } from "@/lib/sections";
import LinkChip from "@/components/link-chip";
import { ICONS } from "@/components/icons";

export const revalidate = 3600;

export const metadata = pageMeta({
  title: "events",
  description: "Upcoming and past PB&J Sounds events: DJ sets, lighting and production in DC, Baltimore and New York.",
  path: "/events",
});

export default function EventsPage() {
  const s = section("events");
  const next = nextOf("events");
  const soon = upcoming();
  const played = past();
  const years = [...new Set(played.map((e) => e.date.slice(0, 4)))];

  return (
    <main data-stage-scene="events" className="relative z-10">
      <Opener
        index={s.index}
        label={s.label}
        title="events"
        line={
          <p className="display-sub text-foreground/85">
            {soon.length ? `${plural(soon.length, "date")} announced, ${played.length} played.` : "DJ sets, lighting and production, from DC and Baltimore to New York."}
          </p>
        }
      >
        {soon[0] && <NowLine line={nextLine(soon[0])} />}
      </Opener>

      <section aria-labelledby="next-up" data-stage-anchor="next-up" className="px-5 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="next-up" className="label rule-line mb-8">
            <span>next up</span>
          </h2>
          {soon.length ? (
            <ul className="grid gap-10">
              {soon.map((e, i) => (
                <li key={e.slug} data-reveal>
                  <Link href={`/events/${e.slug}`} className="group block">
                    <span className="block font-mono text-xs text-foreground/85">
                      {formatDate(e.date)} · {i === 0 ? <Countdown date={e.date} initial={countdown(e.date)} /> : countdown(e.date)}
                    </span>
                    <span className="display-section halo-none mt-2 block text-foreground transition-colors">{e.title}</span>
                    {cityLabel(e) && <span className="mt-2 block font-mono text-xs text-foreground/60">{cityLabel(e)!.toLowerCase()}</span>}
                  </Link>
                  {e.description && <p className="copy mt-4 max-w-2xl">{e.description}</p>}
                  {e.links?.length ? (
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {e.links.map((l) => (
                        <li key={l.href}>
                          <LinkChip href={l.href} label={l.label} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="copy max-w-2xl" data-reveal>
              No dates announced.{" "}
              <a href={content.site.instagram} target="_blank" rel="noopener noreferrer" className="underline decoration-foreground/40 underline-offset-4 hover:text-foreground">
                <ICONS.instagram aria-hidden="true" className="mr-1.5 inline h-[0.9em] w-[0.9em] -translate-y-px" />
                Follow @pbandjsounds
              </a>{" "}
              for the next one.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="archive" data-stage-anchor="archive" className="mt-24 px-5 md:mt-32 md:px-12">
        <div className="mx-auto max-w-6xl">
          <h2 id="archive" className="label rule-line mb-4">
            <span>past events · {played.length}</span>
          </h2>
          {years.map((y) => (
            <div key={y} className="mt-10 md:grid md:grid-cols-[8rem_minmax(0,1fr)] md:gap-x-8">
              <h3 className="display-sub halo-none mb-3 text-foreground/35 md:sticky md:top-24 md:self-start" data-reveal>
                {y}
              </h3>
              <ul className="divide-y divide-border border-y border-border">
                {played
                  .filter((e) => e.date.startsWith(y))
                  .map((e) => {
                    const cover = coverOf(e);
                    return (
                      <li key={e.slug} data-reveal>
                        <Link href={`/events/${e.slug}`} className="group grid grid-cols-[minmax(0,1fr)_4rem] items-center gap-4 py-4 sm:grid-cols-[6.5rem_minmax(0,1fr)_5rem] sm:gap-6">
                          <span className="hidden font-mono text-xs text-foreground/55 sm:block">{formatShort(e.date)}</span>
                          <span className="min-w-0">
                            <span className="block font-sans text-xl leading-tight text-foreground transition-transform duration-500 group-hover:translate-x-1 md:text-2xl">{e.title}</span>
                            <span className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-foreground/55">
                              <span className="sm:hidden">{formatShort(e.date)}</span>
                              {cityLabel(e) && <span>{cityLabel(e)!.toLowerCase()}</span>}
                              <Crew ids={e.crew} />
                            </span>
                          </span>
                          <span className="frame relative block aspect-square w-16 overflow-hidden sm:w-20">
                            {cover && <Image src={cover.src} alt="" fill sizes="80px" className="object-cover" />}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <NextSection href={next.href} word={next.label} caption="releases, tracks & mixes" />
      <JsonLd data={[...soon, ...played].map(eventLd)} />
    </main>
  );
}

