// Support-artist logos, cropped to their ink (scripts/media.mjs) and sized to
// equal visual area, so a wide wordmark and a square badge weigh the same.
// Always in full color.
import Image from "next/image";
import { media, type SupportArtist } from "@/lib/content";

const AREA = 5200; // px² of ink per logo at desktop size

export default function SupportLogos({ artists }: { artists: SupportArtist[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-10 gap-y-8 md:gap-x-14">
      {artists.map((a) => {
        const info = media[a.logo];
        const w = info?.tw ?? info?.w ?? 200;
        const h = info?.th ?? info?.h ?? 80;
        const ratio = w / h;
        const width = Math.round(Math.min(Math.sqrt(AREA * ratio), 220));
        return (
          <li key={a.name} data-reveal>
            {info ? (
              <Image
                src={info.trimmed ?? a.logo}
                alt={a.name}
                width={w}
                height={h}
                sizes={`${width}px`}
                style={{ width: `min(${width}px, ${Math.round((width / 220) * 42)}vw)`, height: "auto" }}
              />
            ) : (
              <span className="font-sans text-2xl text-foreground/80">{a.name}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
