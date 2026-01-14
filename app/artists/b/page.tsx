'use client';

import PortfolioCard from "@/components/portfolio-card";
import EventCard from "@/components/event-card";
import TracksGrid from "@/components/latest-releases";
import ParticleBackground from "@/components/particle-background";
import { artists, supportArtistLogos } from "@/lib/artists";
import { events } from "@/lib/brody-events";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import Image from "next/image";


export default function ArtistBPage() {
  const artist = artists.find((a) => a.id === "b");
  const [scrollYValue, setScrollYValue] = useState(0);

  if (!artist) return <div>Artist not found</div>;

  // Update scroll position for the ParticleBackground
  useEffect(() => {
    const updateScrollY = () => {
      setScrollYValue(window.scrollY);
    };

    window.addEventListener("scroll", updateScrollY);
    return () => window.removeEventListener("scroll", updateScrollY);
  }, []);
  return (
    <div className="relative bg-black text-white">
      <Link href="/" className="sticky top-0 z-20 w-full flex items-center justify-between px-3 sm:px-4 md:px-6 py-2 sm:py-2 md:py-3 text-gray-400/80 hover:text-white/95 transition-colors bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </motion.div>
        <motion.div
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/pbj_logo_transparent.optimized.webp" alt="PB&J" width={60} height={10} />
        </motion.div>
      </Link>
      <div className="relative z-10 flex flex-col md:flex-row items-start gap-4 md:gap-8 p-4 sm:p-6 md:p-8">
        <PortfolioCard artist={artist} />
        <div className="flex-1 flex flex-col md:flex-row gap-8">
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-2xl sm:text-3xl md:text-4xl font-light"
            >
              {artist.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mt-4 text-gray-400 whitespace-pre-wrap leading-relaxed"
            >
              {artist.bio}
            </motion.p>
          </div>
          {artist.equipment && artist.equipment.length > 0 && (
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
          )}
        </div>
      </div>
      {/* Support Section */}
      {artist.supportFor && artist.supportFor.length > 0 && (
        <div className="p-4 sm:p-8 mt-16 sm:mt-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-3xl font-light text-white mb-2"
          >
            Support
          </motion.h2>
          {/* Mobile/Tablet layout */}
          <div className="grid md:hidden grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 justify-items-center mt-6" style={{"--logo-width": "280px"} as React.CSSProperties}>
            {artist.supportFor.map((supportArtist, index) => {
              const logoSrc = supportArtistLogos[supportArtist];
              const isBiscits = supportArtist === "Biscits";
              const isMadds = supportArtist === "Madds";
              const sizeClass = isBiscits 
                ? "w-56 h-56 sm:w-80 sm:h-80" 
                : isMadds
                ? "w-40 h-40 sm:w-48 sm:h-48"
                : "w-44 h-44 sm:w-64 sm:h-64";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.5}}
                  viewport={{ once: true, amount: 0.3 }}
                  className="flex flex-col items-center cursor-pointer">
                  {logoSrc ? (
                    <div className={`${sizeClass} relative`}>
                      <Image
                        src={logoSrc}
                        alt={supportArtist}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className={`${sizeClass} bg-gray-700 rounded-lg flex items-center justify-center text-white font-light text-sm text-center px-2`}>
                      {supportArtist}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {/* Desktop layout - original styling */}
          <div className="hidden md:flex flex-wrap gap-x-8 gap-y-0 justify-center items-center max-w-[calc(4*(var(--logo-width)+3rem))] mx-auto overflow-visible -mt-20" style={{"--logo-width": "280px"} as React.CSSProperties}>
            {artist.supportFor.map((supportArtist, index) => {
              const logoSrc = supportArtistLogos[supportArtist];
              const isBiscits = supportArtist === "Biscits";
              const isMadds = supportArtist === "Madds";
              const sizeClass = isBiscits 
                ? "w-56 h-56 sm:w-80 sm:h-80" 
                : isMadds
                ? "w-40 h-40 sm:w-48 sm:h-48"
                : "w-44 h-44 sm:w-64 sm:h-64";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.15 }}
                  transition={{ duration: 0.5}}
                  viewport={{ once: true, amount: 0.3 }}
                  className={`flex flex-col items-center cursor-pointer ${supportArtist === "Jake Shore" ? "-ml-16" : ""} ${index >= 4 ? "-mt-16" : ""}`}>
                  {logoSrc ? (
                    <div className={`${sizeClass} relative`}>
                      <Image
                        src={logoSrc}
                        alt={supportArtist}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className={`${sizeClass} bg-gray-700 rounded-lg flex items-center justify-center text-white font-light text-sm text-center px-2`}>
                      {supportArtist}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
      {/* Events Section */}
      <div className=" p-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl font-light text-white mb-8"
        >
        Past Events
        </motion.h2>
        <div className="flex flex-col gap-8">
          {events.map((event, index) => {
            const isEven = index % 2 === 0;
            
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: false, amount: 0.2 }}
              >
                <EventCard
                  title={event.title}
                  date={event.date}
                  description={event.description}
                  media={event.media}
                  isRightAligned={!isEven}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Releases Section */}
      <div className="w-full px-4 sm:px-8 md:px-16 py-16 sm:py-24 md:py-32">
        <div className="max-w-6xl mx-auto">
          <TracksGrid
            limit={30}
            filterFn={(track) =>
              track.artist.toLowerCase().includes("brody") ||
              track.artist.toLowerCase().includes("monty")
            }
            title="Latest Releases"
            showTitle={true}
          />
        </div>
      </div>

      {/* Contact Section - commented out for now
      <div className="p-4 sm:p-8 md:p-16 bg-gradient-to-b from-black to-gray-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-6">
            Get in Touch
          </h2>
          <p className="text-gray-400 mb-8 text-sm sm:text-base">
            Have a collaboration opportunity, booking inquiry, or just want to say hello? Reach out!
          </p>
          <a
            href={`mailto:${artist.email}`}
            className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-white text-black font-light text-sm sm:text-base rounded-lg hover:bg-gray-200 transition-colors duration-300"
          >
            {artist.email}
          </a>
        </motion.div>
      </div>
      */}
    </div>
  )
};