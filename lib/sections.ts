// The four section pages, in the original site's order (The Collective, Past
// Events, Latest Releases, Join Our Team). Each opens with the original small
// label and heading and chains to the next with a big next-section link; the
// last goes back to the start. `nav` is the short label in the top bar.
import { content } from "./content";

export interface Section {
  id: "collective" | "events" | "releases" | "join";
  href: string;
  index: string;
  nav: string;
  /** the small label over the heading on the original site */
  label: string;
  /** the heading itself */
  heading: string;
  /** what the section is called when linked to: its heading, except The
   *  Collective, whose heading on the original site was "PB&J Sounds" */
  name: string;
}

const { collective, highlights, releases, join } = content;

export const SECTIONS: Section[] = [
  { id: "collective", href: "/collective", index: "01", nav: "collective", label: collective.label, heading: collective.heading, name: collective.label },
  { id: "events", href: "/events", index: "02", nav: "events", label: highlights.label, heading: highlights.heading, name: highlights.heading },
  { id: "releases", href: "/releases", index: "03", nav: "releases", label: releases.label, heading: releases.heading, name: releases.heading },
  { id: "join", href: "/join", index: "04", nav: "join", label: join.label, heading: join.heading, name: join.heading },
];

export const section = (id: Section["id"]) => SECTIONS.find((s) => s.id === id)!;
export const nextOf = (id: Section["id"]) => SECTIONS[SECTIONS.indexOf(section(id)) + 1];
