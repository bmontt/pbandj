// The four section pages, in reading order. Each chains to the next with a
// big next-section link, the last back to the start.

export interface Section {
  id: "events" | "sounds" | "collective" | "join";
  href: string;
  index: string;
  label: string;
}

export const SECTIONS: Section[] = [
  { id: "events", href: "/events", index: "01", label: "events" },
  { id: "sounds", href: "/sounds", index: "02", label: "sounds" },
  { id: "collective", href: "/collective", index: "03", label: "collective" },
  { id: "join", href: "/join", index: "04", label: "join" },
];

export const section = (id: Section["id"]) => SECTIONS.find((s) => s.id === id)!;
export const nextOf = (id: Section["id"]) => SECTIONS[SECTIONS.indexOf(section(id)) + 1];
