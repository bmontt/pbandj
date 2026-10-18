"use client";

// The SoundCloud playlist (NEXT_PUBLIC_SOUNDCLOUD_PLAYLIST_URL), behind a
// button: the ~3 MB player loads only when asked for, and never autoplays.

import { useState } from "react";

export default function SoundCloudEmbed({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex min-h-11 w-full items-center justify-between gap-4 border border-border px-5 py-5 text-left transition-colors hover:border-foreground/30"
      >
        <span>
          <span className="block font-sans text-xl text-foreground">{title}</span>
          <span className="mt-1 block font-mono text-xs text-foreground/55">load the player</span>
        </span>
        <span aria-hidden="true" className="nudge font-mono text-sm text-foreground/70">
          ▸
        </span>
      </button>
    );
  }
  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23b58657&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false`;
  return <iframe title={title} src={src} className="block h-[450px] w-full border-0" loading="lazy" allow="encrypted-media" />;
}
