// ── landing ───────────────────────────────────────────────────────────────────
// The front door: the blackletter mark over the background, the live line
// (next event and its countdown, else the latest release, else the last
// night), and the three ways in as huge display words, stepping down the
// page. Then the open call. Server-rendered; re-rendered hourly so the live
// line stays true without a redeploy.

import Image from "next/image";
import Link from "next/link";
import mark from "@/assets/pbj-mark.webp";
import NowLine from "@/components/now-line";
import { DisplayWord } from "@/components/display-word";
import { ICONS } from "@/components/icons";
import { content, past, upcoming } from "@/lib/content";
import { enterStyle } from "@/lib/enter";
import { pageMeta } from "@/lib/meta";
import { nowLine } from "@/lib/now";
import { section } from "@/lib/sections";
import { getTracks } from "@/lib/tracks";

export const revalidate = 3600;

export const metadata = pageMeta({ description: content.site.description, path: "/" });

const RISE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default async function Home() {
  const { site, founders } = content;
  const line = nowLine(upcoming().length ? [] : await getTracks(1));
  const played = past();
  const since = played.at(-1)?.date.slice(0, 4);

  const choices = [
    { ...section("events"), caption: `${played.length} events since ${since}`, place: "md:justify-self-start" },
    { ...section("sounds"), caption: "releases, tracks & mixes", place: "md:justify-self-center" },
    { ...section("collective"), caption: founders.map((f) => f.slug).join(" · "), place: "md:justify-self-end md:text-right" },
  ];
  const Instagram = ICONS.instagram;

  return (
    <main data-stage-scene="landing" className="relative z-10 flex min-h-svh flex-col px-5 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center pt-14 pb-8 md:pt-12">
        <div data-stage-anchor="mark" className="flex flex-col items-center text-center">
          <h1 className="enter" style={enterStyle({ y: 10, blur: 10, dur: 1.2, ease: RISE })}>
            <Image src={mark} alt={site.name} priority sizes="(min-width: 768px) 22rem, 66vw" className="h-auto w-[min(66vw,22rem)]" />
          </h1>
          <p className="label enter mt-7" style={enterStyle({ dur: 0.9, delay: 0.5 })}>
            {site.tagline} · est. {site.founded}
          </p>
          {line && (
            <div className="enter mt-2" style={enterStyle({ dur: 0.9, delay: 0.7 })}>
              <NowLine line={line} className="-my-2 py-2" />
            </div>
          )}
        </div>

        <nav aria-label="sections" className="choices mt-12 grid gap-y-6 md:mt-12 md:gap-y-1">
          {choices.map((c, i) => (
            <div
              key={c.id}
              data-accent={c.accent}
              className={`choice enter ${c.place}`}
              style={enterStyle({ y: 24, blur: 8, dur: 1, delay: 0.85 + i * 0.14, ease: RISE })}
            >
              <Link href={c.href} data-stage-anchor={`choice-${c.id}`} className="group inline-block">
                <span style={{ fontSize: "clamp(3rem, 14vw, 7rem)" }} className="display-choice halo-none block text-foreground transition-colors duration-500 group-hover:text-accent group-focus-visible:text-accent">
                  <DisplayWord text={c.label} tracking={-0.045} />
                </span>
                <span className="mt-2 flex items-center gap-2 font-mono text-xs text-foreground/55 transition-colors group-hover:text-foreground/80 md:inline-flex">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {c.caption}
                  <span aria-hidden="true" className="nudge">→</span>
                </span>
              </Link>
            </div>
          ))}
        </nav>
      </div>

      <div className="enter mx-auto flex w-full max-w-6xl items-center justify-between gap-4 pb-6 font-mono text-xs" style={enterStyle({ dur: 0.9, delay: 1.4 })}>
        <Link href="/join" className="group flex min-h-11 items-center text-foreground/70 hover:text-foreground">
          open call<span className="hidden sm:inline">&nbsp;· {content.join.roles.join(", ")}</span>&nbsp;<span className="nudge">→</span>
        </Link>
        <a href={site.instagram} target="_blank" rel="noopener noreferrer" aria-label="PB&J Sounds on Instagram" className="-mr-3 flex min-h-11 min-w-11 items-center justify-center text-foreground/60 hover:text-foreground">
          <Instagram className="h-4 w-4" />
        </a>
      </div>
    </main>
  );
}
