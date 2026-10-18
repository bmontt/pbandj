// ── /events/[slug] ────────────────────────────────────────────────────────────
// One night: what it was, who was behind it, and every photo and video in full
// color. Prerendered for every event in content.json.

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Countdown from "@/components/countdown";
import Crew from "@/components/crew";
import JsonLd from "@/components/json-ld";
import { MediaGrid } from "@/components/media";
import { eventBySlug, events, upcoming } from "@/lib/content";
import { countdown, formatDate, isUpcoming } from "@/lib/dates";
import { enterStyle } from "@/lib/enter";
import { pageMeta } from "@/lib/meta";
import { eventLd } from "@/lib/schema";
import LinkChip from "@/components/link-chip";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const e = eventBySlug((await params).slug);
  if (!e) return {};
  const title = e.city ? `${e.title} (${e.city})` : e.title;
  return pageMeta({
    title: `${title}, ${formatDate(e.date)}`,
    description: e.description || `${title}, ${formatDate(e.date)}. Photos and video from PB&J Sounds.`,
    path: `/events/${e.slug}`,
  });
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const e = eventBySlug((await params).slug);
  if (!e) notFound();
  const soon = isUpcoming(e.date);
  const i = events.indexOf(e);
  const newer = events[i - 1];
  const older = events[i + 1];
  const name = e.city ? `${e.title} (${e.city})` : e.title;

  return (
    <main data-stage-scene="event" className="relative z-10 px-5 md:px-12">
      <article className="mx-auto max-w-6xl">
        <header data-stage-anchor="event" className="pt-32 pb-12 md:pt-40 md:pb-16">
          <Link href="/events" className="-my-3 inline-flex min-h-11 items-center font-mono text-xs text-foreground/60 hover:text-foreground">
            ← events
          </Link>
          <p className="label rule-line mt-6 enter" style={enterStyle({ dur: 0.7 })}>
            <span>
              {soon ? "next up" : "played"} · {formatDate(e.date)}
              {e.city ? ` · ${e.city.toLowerCase()}` : ""}
            </span>
          </p>
          <h1 className="display-section halo-none mt-5 text-foreground enter" style={enterStyle({ y: 20, blur: 6, dur: 1, delay: 0.06 })}>
            {e.title}
          </h1>
          {soon && (
            <p className="mt-4 font-mono text-sm text-foreground/85">
              <Countdown date={e.date} initial={countdown(e.date)} />
            </p>
          )}
          <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_16rem] md:gap-12 enter" style={enterStyle({ y: 12, dur: 0.9, delay: 0.25 })}>
            {e.description ? <p className="copy max-w-2xl">{e.description}</p> : <span />}
            <dl className="grid content-start gap-3 font-mono text-xs">
              <div>
                <dt className="text-foreground/45">with</dt>
                <dd className="mt-1 text-foreground/80">
                  <Crew ids={e.crew} link />
                </dd>
              </div>
              {e.links?.map((l) => (
                <div key={l.href}>
                  <dt className="text-foreground/45">{l.label}</dt>
                  <dd className="mt-2">
                    <LinkChip href={l.href} label={new URL(l.href).hostname.replace(/^www\./, "")} className="inline-flex" />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        {e.media.length > 0 && (
          <section aria-label="photos and video">
            <MediaGrid items={e.media} title={name} />
          </section>
        )}

        <nav aria-label="more events" className="mt-20 grid gap-6 border-t border-border pt-6 font-mono text-xs sm:grid-cols-2">
          {older ? (
            <Link href={`/events/${older.slug}`} className="group block min-h-11 text-foreground/60 hover:text-foreground">
              <span className="block text-foreground/40">← before</span>
              <span className="mt-1 block font-sans text-lg text-foreground/85 group-hover:text-foreground">{older.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {newer && (
            <Link href={`/events/${newer.slug}`} className="group block min-h-11 text-foreground/60 hover:text-foreground sm:text-right">
              <span className="block text-foreground/40">{upcoming().includes(newer) ? "next up" : "after"} →</span>
              <span className="mt-1 block font-sans text-lg text-foreground/85 group-hover:text-foreground">{newer.title}</span>
            </Link>
          )}
        </nav>
      </article>
      <JsonLd data={eventLd(e)} />
    </main>
  );
}
