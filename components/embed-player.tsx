"use client";

// An official player (SoundCloud, Spotify, YouTube) behind a click. Until
// someone presses play, the box is a link to the release with its artwork and
// a play button: no third-party request, no cookies, nothing that can play on
// its own. On press, the player loads into the same box (so nothing moves) and
// starts. Without JavaScript the box is a plain link to the platform.

import { useState, type ReactNode } from "react";
import type { Embed } from "@/lib/embeds";
import { PLATFORM_NAME } from "@/lib/links";

export default function EmbedPlayer({
  embed,
  href,
  title,
  className = "",
  children,
  icon,
}: {
  embed: Embed;
  /** the release or profile on the platform (the no-JS fallback) */
  href: string;
  /** what plays: "Can't Slow Down", "Monty" */
  title: string;
  /** the box's size and shape, e.g. "aspect-square" or "h-[352px]"; the player fills it */
  className?: string;
  /** the poster: artwork or a quiet card */
  children: ReactNode;
  /** the platform's icon, rendered on the server and passed in */
  icon: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const platform = PLATFORM_NAME[embed.platform];

  return (
    <div className={`frame relative overflow-hidden ${className}`} data-embed={embed.platform}>
      {open ? (
        <iframe
          title={`${title} on ${platform}`}
          src={embed.src}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="eager"
        />
      ) : (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            setOpen(true);
          }}
          aria-label={`Play ${title} on ${platform}`}
          data-embed-facade
          className="group absolute inset-0 block"
        >
          {children}
          <span
            aria-hidden="true"
            className="absolute bottom-3 left-3 flex h-11 items-center gap-2 rounded-full bg-background/80 pl-1.5 pr-4 font-mono text-xs text-foreground backdrop-blur-sm transition-colors group-hover:bg-background/95"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background">
              <svg viewBox="0 0 16 16" className="ml-0.5 h-3 w-3" fill="currentColor">
                <path d="M4 2.5v11l9-5.5z" />
              </svg>
            </span>
            <span className="flex items-center gap-1.5">
              {icon}
              {platform.toLowerCase()}
            </span>
          </span>
        </a>
      )}
    </div>
  );
}
