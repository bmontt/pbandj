"use client";

import PortfolioCard from "@/components/portfolio-card";
import EventCard from "@/components/event-card";
import { artists } from "@/lib/artists";
import { events } from "@/lib/jack-events";
import { useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ArtistJPage() {
  const artist = artists.find((a) => a.id === "j");

  if (!artist) return <div>Artist not found</div>;

  const { scrollY } = useScroll();

  return (
    <div className="relative bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Home Button */}
      <div className="absolute top-4 right-4 z-20">
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05, opacity: 0.9 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-6 py-3 text-sm font-light text-white bg-blue-500 rounded hover:bg-blue-600 transition-all"
          >
            Back to PB&J
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </motion.button>
        </Link>
      </div>

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
      <div className="mt-16 p-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl font-light text-white mb-8"
        >
          Past Events
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex flex-col gap-8"
        >
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              description={event.description}
              media={event.media}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}