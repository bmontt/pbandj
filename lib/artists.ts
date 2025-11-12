export interface Artist {
  id: string;
  name: string;
  role: string;
  bio: string;
  videoUrl: string;
  quote: string;
  image: string;
  socialLinks: { instagram: string; spotify: string };
}

export const artists: Artist[] = [
  {
    id: "p",
    name: "Peter Gomes",
    role: "Sound Design & Mixing",
    bio: "Creating immersive audio experiences",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4",
    quote: "Up the Stuss",
    image: "/pj.JPG",
    socialLinks: {
      instagram: "https://www.instagram.com/peterjacobmusic/",
      spotify: "https://on.soundcloud.com/o4XsvYTdPIszv5EKCF",
    },
  },
  {
    id: "b",
    name: "Brody Montag",
    role: "Lead DJ & Producer",
    bio: "Crafting sonic landscapes since 2013",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4",
    quote: "I spent way too long making this website.",
    image: "/brody.JPG",
    socialLinks: {
      instagram: "https://www.instagram.com/brodymontag/",
      spotify:
        "https://open.spotify.com/artist/3uIzwP6Ab6TgP61naHtDMO?si=M5QYA5cjQDqtxIUvM2HZ8A",
    },
  },
  {
    id: "j",
    name: "Jack Humphreys",
    role: "Visual Direction & Tech",
    bio: "Blending visuals with sound",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4",
    quote: "Ferda is simply a state of being.",
    image: "/jack.jpg",
    socialLinks: {
      instagram: "https://www.instagram.com/jack_humphreys_/",
      spotify: "https://open.spotify.com/user/xxboomboomxx/",
    },
  },
];