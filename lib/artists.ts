// Kept for app/api/latest-tracks (owned by the backend), which reads
// `artists`. The data now lives in lib/content.json; this maps it back to
// the old shape so that route keeps working unchanged.
import { content } from "./content";

export interface Artist {
  id: string;
  name: string;
  nickname: string;
  role: string;
  bio: string;
  quote: string;
  image: string;
  equipment: string[];
  supportFor: string[];
  email: string;
  socialLinks: { instagram?: string; spotify?: string; soundcloud?: string; github?: string };
}

export const artists: Artist[] = content.founders.map((f) => ({
  id: f.id,
  name: f.name,
  nickname: f.alias,
  role: f.role,
  bio: f.bio.join("\n\n"),
  quote: f.quote,
  image: f.image,
  equipment: f.gear,
  supportFor: f.supports,
  email: f.email,
  socialLinks: f.links,
}));

export const supportArtistLogos: Record<string, string> = Object.fromEntries(
  content.supportArtists.flatMap((a) => (a.logo ? [[a.name, a.logo]] : [])),
);
