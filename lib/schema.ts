// ── schema.org ────────────────────────────────────────────────────────────────
// JSON-LD from content.json: the collective as a MusicGroup (and the
// organization behind the label), each founder as a member, each event as a
// MusicEvent with the founders who played or lit it as performers. Only facts
// the content file states: no organizer (many of these nights were someone
// else's), no times or addresses we don't have.

import { content, eventName, founders, ORIGIN, venueName, type Event, type Founder } from "./content";

const GROUP_ID = `${ORIGIN}/#collective`;

export function musicGroupLd() {
  const { site, collective } = content;
  return {
    "@context": "https://schema.org",
    "@type": ["MusicGroup", "Organization"],
    "@id": GROUP_ID,
    name: site.name,
    alternateName: site.short,
    url: ORIGIN,
    logo: `${ORIGIN}/icon.png`,
    description: collective.blurb,
    genre: site.genres,
    foundingDate: site.founded,
    email: site.email,
    sameAs: [site.instagram],
    member: founders.map((f) => ({ "@type": "Person", "@id": `${ORIGIN}/about/${f.slug}#person`, name: f.name, alternateName: f.alias })),
  };
}

export function personLd(f: Founder) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${ORIGIN}/about/${f.slug}#person`,
    name: f.name,
    alternateName: f.alias,
    jobTitle: f.role,
    image: `${ORIGIN}${f.image}`,
    url: `${ORIGIN}/about/${f.slug}`,
    memberOf: { "@id": GROUP_ID },
    sameAs: Object.values(f.links).filter(Boolean),
  };
}

export function eventLd(e: Event) {
  const performers = e.crew.map((id) => founders.find((f) => f.id === id)!);
  const photos = e.media.filter((m) => m.type === "image");
  return {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: eventName(e),
    startDate: e.date,
    url: `${ORIGIN}/events/${e.slug}`,
    ...(e.description ? { description: e.description } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    ...(e.city ? { location: { "@type": "Place", name: venueName(e), address: e.city } } : {}),
    performer: performers.map((f) => ({ "@type": "Person", name: f.alias })),
    ...(photos.length ? { image: photos.map((m) => `${ORIGIN}${m.src}`) } : {}),
  };
}
