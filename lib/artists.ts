export interface Artist {
  id: string;
  name: string;
  nickname: string;
  role: string;
  bio: string;
  quote: string;
  image: string;
  equipment: string[];
  supportFor: string[];
  email: string;
  socialLinks: { instagram?: string; spotify?: string; soundcloud?: string; github?: string };
}

export const supportArtistLogos: { [key: string]: string } = {
  "Biscits": "/artistLogos/biscits_logo.webp",
  "Jake Shore": "/artistLogos/jake_shore.webp",
  "Madds": "/artistLogos/madds_logo.webp",
  "Martin Ikin": "/artistLogos/martin_ikin_logo.webp",
  "Ownboss": "/artistLogos/ownboss_logo.webp",
  "Side Quest": "/artistLogos/sidequest_logo.webp",
  "Veggi": "/artistLogos/veggi.webp",
};

export const artists: Artist[] = [
  {
    id: "p",
    name: "Peter Gomes",
    nickname: "Peter Jacob",
    role: "DJ & Artist Relations",
    bio: "Peter Jacob was born and raised in Silver Spring, MD. For the past year and half he has focused on both music production and DJing. Growing up, PJ always had a passion for music, creating events, and planning parties. Cofounding the collective allowed him to take on event curation as well as DJing. He took piano lessons for 8 years which provided some musical foundation but also made him more interested in creating music. Over the past year and half PJ has been investing much more time into music production. His style right now is \"the 90s inspired tech house sound coming out of Europe and the UK.\" But when it comes to DJing, he \"likes to have a little bit of everything under [his] belt\" whether it be Latin house, deep house, minimal, or tech house. ",
    quote: "\"No matter what I play or make, the goal is always to get people grooving and moving.\"",
    image: "/pj.optimized.webp",
    equipment: ["Bose L1"],
    email: "peter@pbanjsounds.com",
    supportFor: [],
    socialLinks: {
      instagram: "https://www.instagram.com/peterjacobmusic/",
      soundcloud: "https://soundcloud.com/jake-johns-696075672",
    },
  },
  {
    id: "b",
    name: "Brody Montag",
    nickname: "Monty",
    role: "DJ & Lead Organizer",
    bio: "Brody Montag (aka Monty) is a rising house/indie-dance artist from New Jersey rooted in the DMV. With performances across the East Coast at venues like Somewhere Nowhere, Zebbie's Garden, and Soundcheck, Brody has built his reputation on dynamic sets defined by warm basslines, crisp percussion, and an ear for tracks that create forward motion without forfeiting subtlety.\n\nGrowing up, Brody fell in love with music through labels like Monstercat and OWSLA -- playing a variety of instruments including the piano, oboe, viola, and drums. He eventually landed on digital production given the breadth of his interests, and at age 10, learned Garageband and Algoriddim's \"DJay\". Roughly 2 years later, he transitioned to FL Studio and Rekordbox as well as rap/hip-hop production where he began shipping out beats and instrumentals to local artists for commission. After high school at the University of Maryland, Brody's interest in DJing, and naturally dance music, was reignited. Since then, his sound has been shaped by years of crate-digging -- leaning into deep house, minimal, and disco-influenced cuts.\n\nBeyond his musical background, his formal education/research in signal processing and machine learning gives him a uniquely technical approach to production and DJing. From club basements to sunset rooftops, Brody is drawn to the grassroots, community-driven energy that defines dance music; and as co-founder/lead organizer of PB&J Sounds, he spearheads planning and strategy.",
    
    quote: "\"Passionate about the intersection of technology and music\"",
    image: "/brody.optimized.webp",
    equipment: ["Pioneer CDJ-3000", "Pioneer XDJ-XZ"],
    email: "brody@pbanjsounds.com",
    supportFor: ["Biscits", "Jake Shore", "Madds", "Martin Ikin", "Ownboss", "Side Quest", "Veggi"],
    socialLinks: {
      instagram: "https://www.instagram.com/brodymontag/",
      spotify:
        "https://open.spotify.com/artist/3uIzwP6Ab6TgP61naHtDMO?si=M5QYA5cjQDqtxIUvM2HZ8A",
      soundcloud: "https://soundcloud.com/brodymontag",
      github: "https://github.com/bmontt",
    },
  },
  {
    id: "j",
    name: "Jack Humphreys",
    nickname: "Humphreys",
    role: "DJ & Visual Coordinator",
    bio: "Jack has always been a tech nerd who lives by the motto 'work hard, rave harder.' He got his start in the event production world in 2021, throwing parties for fraternity brothers and friends alike. But in 2024, Jack decided he wanted something more... something that combined his love for dance music and lighting design. That's when he teamed up with Peter and Brody to form PB&J. As the spatial illumination guru of the group, Jack is responsible for creating the light shows and immersive environments that have become a hallmark of PB&J's live performances. He draws inspiration from the countless raves and music festivals he's attended over the past 6 years, always paying attention to the visual effects that are quintessential to the dance music experience. In particular, Jack has his own mobile lighting rig that he's been building over the past two years, and he uses it for PB&J events and for collaboarting with other local event producers.",
    quote: "\"Blending visual creativity with technical expertise to turn any space into an electric atmosphere for dance music\"",
    image: "/jack.optimized.webp",
    equipment: ["ProX Truss System - 10 and 15ft configurations with adjustable height", "5 x 100W Moving Head Lights", "3 x 60W Pixel Light Bars", "10x40W Moving Sweeper", "4 x 120W RGB Strobes/Blinders", "Haze Machine", "DMX Equipment Controlled by Onyx NX1", "JBL EON715 Powered Speaker"],
    email: "jack@pbanjsounds.com",
    supportFor: [],
    socialLinks: {
      instagram: "https://www.instagram.com/jack_humphreys_/",
    },
  },
];