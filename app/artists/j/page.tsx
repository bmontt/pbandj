"use client";

import PortfolioCard from "@/components/portfolio-card";
import EventCard from "@/components/event-card";
import ParticleBackground from "@/components/particle-background";
import { artists } from "@/lib/artists";
import { events } from "@/lib/jack-events";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function ArtistJPage() {
  const artist = artists.find((a) => a.id === "j");

  if (!artist) return <div>Artist not found</div>;

  const [scrollYValue, setScrollYValue] = useState(0);

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
      <div className="relative z-10 flex items-start p-8">
        <PortfolioCard artist={artist} />
        <div className="ml-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-4xl font-light"
          >
            Welcome to {artist.name}'s Portfolio
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-4 text-gray-400"
          >
            {artist.bio}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl font-light mt-4"
          >
            Equipment
          </motion.h2>
          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-2 list-disc pl-5 text-gray-300"
          >
            {artist.equipment.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </motion.ul>
        </div>
      </div>

      {/* Past Events Section */}
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
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: false, amount: 0.2 }}
            >
              <EventCard
                title={event.title}
                date={event.date}
                description={event.description}
                media={event.media}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}