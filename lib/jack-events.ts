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
    id: "event4",
    title: "PB&J Disco Anniversary",
    date: "March 2025",
    description: "To celebrate the 1 year anniversary of PB&J, Jack went all out in his house with a disco-themed party. The lighting, video and crowd was sublime, and it represented the first true coming together of the truss setup.",
    media: [
      { type: "image", src: "/JackEvents/discoNight.jpg" },
      { type: "image", src: "/JackEvents/discoParty.jpg" },
      { type: "video", src: "/JackEvents/discoJam.mp4" },
    ],
  },
  {
    id: "event2",
    title: "Rooftop Party",
    date: "April 2025",
    description: "We partnered with a apartment building to throw a rooftop party for 70 people, complete with a full suite of production gear including lights, sound, and DJs.",
    media: [
      { type: "video", src: "/JackEvents/rooftopSunset.MOV" },
      { type: "image", src: "/JackEvents/rooftopSetup.jpg" },
      { type: "video", src: "/JackEvents/rooftopParty.mp4" },
    ],
  },
  {
    id: "event5",
    title: "House Party",
    date: "January 2025",
    description: "Jack setup his full truss system in a friend's house for an intimate dance party. The lighting design transformed the living room into a vibrant dance floor, setting the precendent for future production to come.",
    media: [
      { type: "video", src: "/JackEvents/housePartyDance.mp4" },
      { type: "video", src: "/JackEvents/houseVintage.mp4" },
      { type: "video", src: "/JackEvents/houseVibes.mp4" },
    ],
  },
  {
    id: "event3",
    title: "Office Jam Session",
    date: "September 2025",
    description: "When Jack moved to DC, he setup his lighting rig in his new office space and had friends over to show off the new apartment and lighting scenes. It was a great way to pregame for our Echostage debut :)",
    media: [
      { type: "video", src: "/JackEvents/officeSetup.mp4" },
      { type: "video", src: "/JackEvents/officeJam.mp4" },
      { type: "video", src: "/JackEvents/officeDance.mp4" },
    ],
  },
];