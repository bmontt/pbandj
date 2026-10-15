// The four section pages, in reading order. Each chains to the next with a
// big next-section link, the last back to the start. `accent` picks the
// P/B/J family the section speaks in (globals.css [data-accent]).
import type { FounderId } from "./content";

export interface Section {
  id: "events" | "sounds" | "collective" | "join";
  href: string;
  index: string;
  label: string;
  accent: FounderId;
}

export const SECTIONS: Section[] = [
  { id: "events", href: "/events", index: "01", label: "events", accent: "j" },
  { id: "sounds", href: "/sounds", index: "02", label: "sounds", accent: "p" },
  { id: "collective", href: "/collective", index: "03", label: "collective", accent: "b" },
  { id: "join", href: "/join", index: "04", label: "join", accent: "b" },
];

export const section = (id: Section["id"]) => SECTIONS.find((s) => s.id === id)!;
export const nextOf = (id: Section["id"]) => SECTIONS[SECTIONS.indexOf(section(id)) + 1];
