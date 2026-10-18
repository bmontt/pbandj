// ── /events ───────────────────────────────────────────────────────────────────
// The original "Highlights / Past Events" section: its six photos, then every
// event from the founders' pages, newest first, grouped by year. When an
// upcoming event is in content.json it leads, with its countdown. Re-rendered
// hourly, so a show moves to the archive on its own.

import Image from "next/image";
import Link from "next/link";
import Countdown from "@/components/countdown";
import Crew from "@/components/crew";
import JsonLd from "@/components/json-ld";
import NextSection from "@/components/next-section";
import NowLine from "@/components/now-line";
import Opener from "@/components/opener";
import { Photo } from "@/components/media";
import { content, coverOf, past, upcoming } from "@/lib/content";
import { countdown, formatDate, formatShort } from "@/lib/dates";
import { pageMeta } from "@/lib/meta";
import { nextLine } from "@/lib/now";
import { eventLd } from "@/lib/schema";
import { nextOf, section } from "@/lib/sections";

export const revalidate = 3600;

export const metadata = pageMeta({ title: content.highlights.heading, description: content.site.description, path: "/events" });

export default function EventsPage() {
  const s = section("events");
  const next = nextOf("events");
  const soon = upcoming();
  const played = past();
  const years = [...new Set(played.map((e) => e.date.slice(0, 4)))];

  return (
    <main data-stage-scene="events" className="relative z-10">
      <Opener index={s.index} label={s.label} title={s.heading}>
        {soon[0] && <NowLine line={nextLine(soon[0])} />}
      </Opener>

      {soon.length > 0 && (
        <section aria-labelledby="next-up" data-stage-anchor="next-up" className="mb-24 px-5 md:mb-32 md:px-12">
          <div className="mx-auto max-w-6xl">
            <h2 id="next-up" className="label rule-line mb-8">
              <span>next up</span>
            </h2>
            <ul className="grid gap-10">
              {soon.map((e, i) => (
                <li key={e.slug} data-reveal>
                  <Link href={`/events/${e.slug}`} className="group block">
                    <span className="block font-mono text-xs text-foreground/85">
                      {formatDate(e.date)} · {i === 0 ? <Countdown date={e.date} initial={countdown(e.date)} /> : countdown(e.date)}
                    </span>
                    <span className="display-section halo-none mt-2 block text-foreground">{e.title}</span>
                  </Link>
                  {e.description && <p className="copy mt-4 max-w-2xl">{e.description}</p>}
                  {e.links?.length ? (
                    <p className="mt-3 flex gap-5 font-mono text-xs">
                      {e.links.map((l) => (
                        <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="text-foreground/80 underline decoration-foreground/40 underline-offset-4 hover:text-foreground">
                          {l.label} ↗
                        </a>
                      ))}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section aria-label={content.highlights.label} data-stage-anchor="highlights" className="px-5 md:px-12">
        <ul className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {content.highlights.photos.map((m) => (
            <li key={m.src} data-reveal className="frame relative aspect-video overflow-hidden">
              <Photo src={m.src} alt={m.alt} sizes="(min-width: 768px) 23rem, (min-width: 640px) 46vw, 92vw" className="absolute inset-0 h-full object-cover" />
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="all events" data-stage-anchor="archive" className="mt-20 px-5 md:mt-28 md:px-12">
        <div className="mx-auto max-w-6xl">
          {years.map((y) => (
            <div key={y} className="mt-10 first:mt-0 md:grid md:grid-cols-[8rem_minmax(0,1fr)] md:gap-x-8">
              <h2 className="display-sub halo-none mb-3 text-foreground/35 md:sticky md:top-24 md:self-start" data-reveal>
                {y}
              </h2>
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

      <NextSection href={next.href} word={next.name} caption={next.label} />
      <JsonLd data={[...soon, ...played].map(eventLd)} />
    </main>
  );
}
