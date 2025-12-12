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
    role: "DJ & Artist Relations",
    bio: "Peter Jacob was born and raised in Silver Spring, MD. For the past year and half he has focused on both music production and DJing. Growing up, PJ always had a passion for music, creating events, and planning parties. Cofounding the collective allowed him to take on event curation as well as DJing. He took piano lessons for 8 years which provided some musical foundation but also made me more interested in creating music. Over the past year and half PJ has been investing much more time into music production. His style right now is \"the 90s inspired tech house sound coming out of Europe and the UK.\" But when it comes to DJing, he \"likes to have a little bit of everything under [his] belt\" whether it be Latin house, deep house, minimal, or tech house. ",
    quote: " No matter what I play or make, the goal is always to get people grooving and moving.",
    image: "/pj.optimized.webp",
    equipment: ["Bose L1"],
    socialLinks: {
      instagram: "https://www.instagram.com/peterjacobmusic/",
      spotify: "https://on.soundcloud.com/o4XsvYTdPIszv5EKCF",
    },
  },
  {
    id: "b",
    name: "Brody Montag",
    role: "Lead Organizer & DJ",
    bio: "Brody Montag (aka Monty) is a rising house artist from New Jersey now rooted in the DMV. With performances across the East Coast at venues like Soundcheck and Zebbie's Garden, Brody has built a reputation for dynamic sets defined by tight mixing, warm basslines, crisp percussion, and an ear for tracks that create forward motion without losing subtlety or vibe.\nGrowing up, Brody fell in love with music, playing a variety of instruments including the piano, oboe, viola, and drums, but he eventually landed on production given the breadth of his interests. At age 10, he started learning Garageband and algoriddim's \"djay\" eventually graduating to FL Studio and Rekordbox about 2 years after. During Highschool Brody's music career took form in rap/hip-hop production where he began producing beats and instrumentals for commission. Entering college at the University of Maryland, Brody's interest in DJing, and naturally EDM, was reignited. Since then, his sound has been shaped by years of crate-digging, leaning into deep tech house, minimal, and disco-influenced cuts.\nBeyond his musical background, his formal ___ in signal processing, AI, and audio technology, gives him a ___ approach to DJing.\nFrom club basements to sunset rooftops, Brody's mission is simple: As co-founder and lead organizer of PB&J Sounds, he spearheads planning and strategy.Echostage, Power Plant Live!, Somewhere Nowhere, Soundcheck,  and scores of PB&J Sounds events, ",
    
    quote: "Crafting sonic landscapes since 2013",
    image: "/brody.optimized.webp",
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
    role: "Visual/Lighting Coordinator",
    bio: "Jack has always been a tech nerd who lives by the motto 'work hard, rave harder.' He got his start in the event production world in 2021, throwing parties for fraternity brothers and friends alike. But in 2024, Jack decided he wanted something more... something that combined his love for dance music and lighting design. That's when he teamed up with Peter and Brody to form PB&J. As the spatial illumination guru of the group, Jack is responsible for creating the light shows and immersive environments that have become a hallmark of PB&J's live performances. He draws inspiration from the countless raves and music festivals he's attended over the past 6 years, always paying attention to the visual effects that are quintessential to the dance music experience. In particular, Jack has his own mobile lighting rig that he's been building over the past two years, and he uses it for PB&J events and for collaboarting with other local event producers.",
    quote: "Blending visual creativity with technical expertise to turn any space into an electric atmosphere for dance music",
    image: "/jack.optimized.webp",
    equipment: ["ProX Truss System - 10 and 15ft configurations with adjustable height", "5 x 100W Moving Head Lights", "3 x 60W Pixel Light Bars", "10x40W Moving Sweeper", "4 x 120W RGB Strobes/Blinders", "Haze Machine", "DMX Equipment Controlled by Onyx NX1", "JBL EON715 Powered Speaker"],
    socialLinks: {
      instagram: "https://www.instagram.com/jack_humphreys_/",
      spotify: "https://open.spotify.com/user/xxboomboomxx/",
    },
  },
];