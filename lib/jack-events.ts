export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  media: Array<{ type: "image" | "video"; src: string }>;
}

export const events: Event[] = [
  {
    id: "event1",
    title: "Bonnaroo Renegade Stage",
    date: "June 2025",
    description: "Jack rented a truck and hauled all of his gear down to Tennessee to set up an insane stage for his 125-person campsite. When Bonnaroo got cancelled due to weather, Jack threw an 18 hour rave for the devastated campers, and it turned out to be one of the most memorable events of the year.",
    media: [
      { type: "image", src: "/JackEvents/rooAftermath.jpg" },
      { type: "video", src: "/JackEvents/coolLights.mp4" },
      { type: "image", src: "/JackEvents/rooParty.jpg" },
      { type: "video", src: "/JackEvents/rooReel.mp4" },
    ],
  },
  {
    id: "event2",
    title: "Rooftop Party",
    date: "April 2025",
    description: "We partnered with a apartment building to throw a rooftop party for 70 people, complete with a full suite of production gear including lights, sound, and DJs.",
    media: [
      { type: "video", src: "/JackEvents/rooftopSunset.mp4" },
      { type: "image", src: "/JackEvents/rooftopSetup.jpg" },
      { type: "video", src: "/JackEvents/rooftopDance.mp4" },
    ],
  },
  {
    id: "event3",
    title: "Spring Jam Session",
    date: "April 10, 2025",
    description: "A lively jam session featuring talented local artists.",
    media: [
      { type: "image", src: "/images/event4.jpg" },
      { type: "image", src: "/images/event5.jpg" },
    ],
  },
];