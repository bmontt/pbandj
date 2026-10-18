// Per-page metadata. Next merges metadata shallowly, so a page that sets
// openGraph or alternates replaces the layout's whole object: this helper
// writes them complete. The share card is app/opengraph-image.tsx; a nested
// page that sets openGraph doesn't inherit it, so it's named here too.
import type { Metadata } from "next";
import { content } from "./content";

const card = { url: "/opengraph-image", width: 1200, height: 630, type: "image/png", alt: "PB&J Sounds" };

export function pageMeta({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const full = title ? `${title} · ${content.site.short}` : content.site.short;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path, types: { "text/plain": "/llms.txt" } },
    openGraph: { title: full, description, url: path, siteName: content.site.name, type: "website", locale: "en_US", images: [card] },
    twitter: { card: "summary_large_image", title: full, description, images: [card] },
  };
}
