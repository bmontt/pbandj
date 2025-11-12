"use client";

import PortfolioCard from "@/components/portfolio-card";
import ParticleBackground from "@/components/particle-background";
import ParallaxBackground from "@/components/parallax-background";
import { artists } from "@/lib/artists";
import { useScroll, useTransform } from "framer-motion";

export default function ArtistPPage() {
  const artist = artists.find((a) => a.id === "p");

  if (!artist) return <div>Artist not found</div>;

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, -200]);
  const secondLayerY = useTransform(scrollY, [0, 500], [0, -100]);
  const thirdLayerY = useTransform(scrollY, [0, 500], [0, -50]);

  return (
    <div className="relative">
      <ParticleBackground scrollY={0} />
      <ParallaxBackground
        backgroundY={backgroundY}
        secondLayerY={secondLayerY}
        thirdLayerY={thirdLayerY}
      />
      <div className="relative z-10 flex items-start p-8">
        <PortfolioCard artist={artist} />
        <div className="ml-8">
          <h1 className="text-4xl font-light">Welcome to {artist.name}'s Portfolio</h1>
          <p className="mt-4 text-gray-400">{artist.bio}</p>
        </div>
      </div>
    </div>
  );
}