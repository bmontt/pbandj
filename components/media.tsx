// ── media ─────────────────────────────────────────────────────────────────────
// Photos go through next/image (AVIF/WebP, sized per screen); every box is
// reserved from lib/media.json before anything loads, so nothing shifts.
// Videos never autoplay: muted, inline, preload="none", behind a poster frame
// (scripts/media.mjs) served through the image optimizer, with native
// controls. A video the manifest doesn't know yet gets a 9:16 box.

import Image, { getImageProps } from "next/image";
import { media, type MediaItem } from "@/lib/content";

const FALLBACK = { w: 1080, h: 1920 };

export function Photo({ src, alt, sizes, priority = false, className = "" }: { src: string; alt: string; sizes: string; priority?: boolean; className?: string }) {
  const info = media[src] ?? FALLBACK;
  return (
    <Image
      src={src}
      alt={alt}
      width={info.w}
      height={info.h}
      sizes={sizes}
      priority={priority}
      className={`frame block h-auto w-full ${className}`}
    />
  );
}

const TYPES: Record<string, string> = { mp4: "video/mp4", m4v: "video/mp4", mov: "video/quicktime", webm: "video/webm" };

export function Video({ src, label }: { src: string; label: string }) {
  const info = media[src] ?? FALLBACK;
  const posterW = 640;
  const poster = info.poster
    ? getImageProps({ src: info.poster, alt: "", width: posterW, height: Math.round((posterW * info.h) / info.w) }).props.src
    : undefined;
  const ext = src.split(".").pop()?.toLowerCase() ?? "";
  return (
    <video
      className="frame block h-auto w-full"
      style={{ aspectRatio: `${info.w} / ${info.h}` }}
      width={info.w}
      height={info.h}
      controls
      muted
      playsInline
      preload="none"
      poster={poster}
      aria-label={label}
    >
      <source src={src} type={TYPES[ext]} />
      <a href={src}>{label}</a>
    </video>
  );
}

/** an event's photos and videos as a masonry of full-color frames */
export function MediaGrid({ items, title }: { items: MediaItem[]; title: string }) {
  let photo = 0;
  let video = 0;
  return (
    <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4 [&>li]:break-inside-avoid">
      {items.map((m) => (
        <li key={m.src} data-reveal>
          {m.type === "image" ? (
            <Photo src={m.src} alt={`${title}, photo ${++photo}`} sizes="(min-width: 1024px) 23rem, (min-width: 640px) 46vw, 92vw" />
          ) : (
            <Video src={m.src} label={`${title}, video ${++video}`} />
          )}
        </li>
      ))}
    </ul>
  );
}
