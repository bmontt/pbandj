"use client";

import PortfolioCard from "@/components/portfolio-card";
import ParticleBackground from "@/components/particle-background";
import ParallaxBackground from "@/components/parallax-background";
import { artists } from "@/lib/artists";
import { useScroll, useTransform, motion } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function ArtistPPage() {
  const artist = artists.find((a) => a.id === "p");

  if (!artist) return <div>Artist not found</div>;

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, -200]);
  const secondLayerY = useTransform(scrollY, [0, 500], [0, -100]);
  const thirdLayerY = useTransform(scrollY, [0, 500], [0, -50]);

  return (
    <div className="relative">
      <Link href="/" className="relative z-20 inline-flex items-center gap-2 p-4 sm:p-6 md:p-8 text-gray-400/80 hover:text-white/95 transition-colors">
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </motion.div>
      </Link>
      <div className="relative z-10 flex flex-col md:flex-row items-start gap-4 md:gap-8 p-4 sm:p-6 md:p-8">
        <PortfolioCard artist={artist} />
        <div className="flex-1 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light">Welcome to {artist.name}'s Portfolio</h1>
            <p className="mt-4 text-gray-400 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{artist.bio}</p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="md:pl-6 border-l border-gray-700/30 md:min-w-[200px]"
          >
            <h3 className="text-lg font-light text-white/95 mb-4">Equipment</h3>
            <ul className="space-y-2">
              {artist.equipment.map((item, index) => (
                <li key={index} className="text-sm text-gray-400 font-light">
                  • {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}