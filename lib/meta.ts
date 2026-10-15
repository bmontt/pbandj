// Per-page metadata. Next merges metadata shallowly, so a page that sets
// openGraph or alternates replaces the layout's whole object: this helper
// writes them complete. The OG image itself is file-based (app/opengraph-image).
import type { Metadata } from "next";
import { content } from "./content";

export function pageMeta({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const full = title ? `${title} · ${content.site.name}` : `${content.site.name} · ${content.site.tagline}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path, types: { "text/plain": "/llms.txt" } },
    openGraph: { title: full, description, url: path, siteName: content.site.name, type: "website", locale: "en_US" },
    twitter: { card: "summary_large_image", title: full, description },
  };
}
