// Release cards, as the original grid had them: the artwork, the title and
// the artist's stage name, linking out to Spotify or SoundCloud. Tracks with
// no artwork (some block embeds) show the founder's initial instead.
import Image from "next/image";
import type { Track } from "@/lib/tracks";

export default function TrackGrid({ tracks }: { tracks: Track[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-8">
      {tracks.map((t) => (
        <li key={t.id} data-reveal data-founder={t.founder}>
          <a href={t.url} target="_blank" rel="noopener noreferrer" className="group block">
            <span className="frame relative block aspect-square overflow-hidden">
              {t.image ? (
                <Image src={t.image} alt="" fill sizes="(min-width: 768px) 22rem, 46vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
              ) : (
                <span aria-hidden="true" className="display-hero halo-none absolute inset-0 flex items-center justify-center text-founder/70">
                  {t.founder.toUpperCase()}
                </span>
              )}
            </span>
            <span className="mt-3 block font-sans text-lg leading-snug text-foreground md:text-xl">{t.title}</span>
            <span className="mt-1 block font-mono text-xs text-foreground/55">
              {t.artist} <span aria-hidden="true">↗</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
