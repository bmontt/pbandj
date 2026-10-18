// ── landing ───────────────────────────────────────────────────────────────────
// The front door: the blackletter mark over the background, the live line
// (next event and its countdown, else the latest release, else the last
// event), and the original site's sections as huge display words, stepping
// down the page in its order. Then "Join Our Team". Server-rendered;
// re-rendered hourly so the live line stays true without a redeploy.

import Image from "next/image";
import Link from "next/link";
import mark from "@/assets/pbj-mark.webp";
import NowLine from "@/components/now-line";
import { DisplayWord } from "@/components/display-word";
import { content, upcoming } from "@/lib/content";
import { enterStyle } from "@/lib/enter";
import { pageMeta } from "@/lib/meta";
import { nowLine } from "@/lib/now";
import { section } from "@/lib/sections";
import { getTracks } from "@/lib/tracks";

export const revalidate = 3600;

export const metadata = pageMeta({ description: content.site.description, path: "/" });

const RISE = "cubic-bezier(0.22, 1, 0.36, 1)";

export default async function Home() {
  const { site, join } = content;
  const line = nowLine(upcoming().length ? [] : await getTracks(1));

  const choices = [
    { ...section("collective"), place: "md:justify-self-start" },
    { ...section("events"), place: "md:justify-self-center" },
    { ...section("releases"), place: "md:justify-self-end md:text-right" },
  ];

  return (
    <main data-stage-scene="landing" className="relative z-10 flex min-h-svh flex-col px-5 md:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center pt-14 pb-8 md:pt-12">
        <div data-stage-anchor="mark" className="flex flex-col items-center text-center">
          <h1 className="enter" style={enterStyle({ y: 10, blur: 10, dur: 1.2, ease: RISE })}>
            <Image src={mark} alt={site.name} priority sizes="(min-width: 768px) 22rem, 66vw" className="h-auto w-[min(66vw,22rem)]" />
          </h1>
          {line && (
            <div className="enter mt-7" style={enterStyle({ dur: 0.9, delay: 0.6 })}>
              <NowLine line={line} className="-my-2 py-2" />
            </div>
          )}
        </div>

        <nav aria-label="sections" className="choices mt-12 grid gap-y-6 md:mt-14 md:gap-y-2">
          {choices.map((c, i) => (
            <div key={c.id} className={`choice enter ${c.place}`} style={enterStyle({ y: 24, blur: 8, dur: 1, delay: 0.85 + i * 0.14, ease: RISE })}>
              <Link href={c.href} data-stage-anchor={`choice-${c.id}`} className="group inline-block">
                <span style={{ fontSize: "clamp(2.6rem, 11vw, 6.25rem)" }} className="display-choice halo-none block text-foreground">
                  <DisplayWord text={c.name} tracking={-0.045} /> <span aria-hidden="true" className="nudge text-foreground/40">→</span>
                </span>
              </Link>
            </div>
          ))}
        </nav>
      </div>

      <div className="enter mx-auto flex w-full max-w-6xl items-center pb-6 font-mono text-xs" style={enterStyle({ dur: 0.9, delay: 1.4 })}>
        <Link href="/join" className="group flex min-h-11 items-center text-foreground/70 hover:text-foreground">
          {join.heading}&nbsp;<span className="nudge">→</span>
        </Link>
      </div>
    </main>
  );
}
