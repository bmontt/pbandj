import type { MetadataRoute } from "next";
import { events, founders, ORIGIN } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly" = "weekly") => ({
    url: `${ORIGIN}${path}`,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "daily"),
    page("/events", 0.9, "daily"),
    page("/releases", 0.8, "daily"),
    page("/collective", 0.8),
    page("/join", 0.6, "monthly"),
    ...founders.map((f) => page(`/collective/${f.slug}`, 0.7, "monthly")),
    ...events.map((e) => page(`/events/${e.slug}`, 0.6, "monthly")),
  ];
}
