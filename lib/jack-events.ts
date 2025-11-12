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
    title: "Summer Music Festival",
    date: "July 15, 2025",
    description: "An unforgettable night of music, dancing, and fun under the stars.",
    media: [
      { type: "image", src: "/images/event1.jpg" },
      { type: "image", src: "/images/event2.jpg" },
      { type: "video", src: "/videos/event1.mp4" },
    ],
  },
  {
    id: "event2",
    title: "Winter Wonderland Concert",
    date: "December 20, 2025",
    description: "A magical evening of music and holiday cheer.",
    media: [
      { type: "image", src: "/images/event3.jpg" },
      { type: "video", src: "/videos/event2.mp4" },
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