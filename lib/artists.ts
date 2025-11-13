export interface Artist {
  id: string;
  name: string;
  role: string;
  bio: string;
  quote: string;
  image: string;
  equipment: string[];
  socialLinks: { instagram: string; spotify: string };
}

export const artists: Artist[] = [
  {
    id: "p",
    name: "Peter Gomes",
    role: "Sound Design & Mixing",
    bio: "Portfolio coming soon...",
    quote: "Creating immersive audio experiences",
    image: "/pj.JPG",
    equipment: ["Bose L1"],
    socialLinks: {
      instagram: "https://www.instagram.com/peterjacobmusic/",
      spotify: "https://on.soundcloud.com/o4XsvYTdPIszv5EKCF",
    },
  },
  {
    id: "b",
    name: "Brody Montag",
    role: "Lead DJ & Producer",
    bio: "Portfolio coming soon...",
    quote: "Crafting sonic landscapes since 2013",
    image: "/brody.JPG",
    equipment: ["Pioneer CDJ-3000", "Pioneer XDJ-XZ"],
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
    bio: "Jack has always been a tech nerd who lives by the motto 'work hard, rave harder.' He got his start in the event production world in 2021, throwing parties for fraternity brothers and friends alike. But in 2024, Jack decided he wanted something more... something that combined his love for dance music and lighting design. That's when he teamed up with Peter and Brody to form PB&J. As the spatial illumination guru of the group, Jack is responsible for creating the light shows and immersive environments that have become a hallmark of PB&J's live performances. He draws inspiration from the countless raves and music festivals he's attended over the past 6 years, always paying attention to the visual effects that are quintessential to the dance music experience. In particular, Jack has his own mobile lighting rig that he's been building over the past two years, and he uses it for PB&J events and for collaboarting with other local event producers.",
    quote: "Blending visual creativity with technical expertise to turn any space into an electric atmosphere for dance music",
    image: "/jack.jpg",
    equipment: ["ProX Truss System - 10 and 15ft configurations with adjustable height", "5 x 100W Moving Head Lights", "3 x 60W Pixel Light Bars", "10x40W Moving Sweeper", "4 x 120W RGB Strobes/Blinders", "Haze Machine", "DMX Equipment Controlled by Onyx NX1"],
    socialLinks: {
      instagram: "https://www.instagram.com/jack_humphreys_/",
      spotify: "https://open.spotify.com/user/xxboomboomxx/",
    },
  },
];