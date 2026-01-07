export interface Event {
    id: string;
    title: string;
    date: string;
    description: string;
    media: Array<{ type: "image" | "video"; src: string }>;
  }
  
  export const events: Event[] = [
    {
      id: "event91",
      title: "TBD",
      date: "February 2026",
      description: "Beatprint Residency Debut",
      media: [
        { type: "video", src: "" },
      ],
    },
    {
      id: "event92",
      title: "Flash Rooftop",
      date: "September 2025",
      description: "Opening for Veggi",
      media: [
        { type: "video", src: "" },
      ],
    },
    {
      id: "event93",
      title: "Soundcheck",
      date: "July 2025",
      description: "Opened for Biscits",
      media: [
        { type: "video", src: "" },
      ],
    },
    {
      id: "event94",
      title: "Sound Garden (Offstage)",
      date: "July 2025",
      description: "Opening for LF System",
      media: [
        { type: "video", src: "" },
      ],
    },
    {
      id: "event95",
      title: "Public Art Space",
      date: "June 2025",
      description: "",
      media: [
        { type: "video", src: "" },
      ],
    },
    {
      id: "event96",
      title: "Zebbie's Garden",
      date: "April 2025",
      description: "Opening for Martin Ikin",
      media: [
        { type: "video", src: "" },
      ],
    },
    {
      id: "event97",
      title: "Power Plant Live!",
      date: "October 2024",
      description: "",
      media: [
        { type: "video", src: "" },
      ],
    },
    {
      id: "event98",
      title: "Somewhere Nowhere",
      date: "July 2024",
      description: "",
      media: [
        { type: "video", src: "" },
      ],
    },
    {
      id: "event99",
      title: "Looney's Pub",
      date: "July 2024",
      description: "",
      media: [
        { type: "video", src: "" },
      ],
    },

  ];