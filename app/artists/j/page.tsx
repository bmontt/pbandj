"use client";

import PortfolioCard from "@/components/portfolio-card";
import EventCard from "@/components/event-card";
import { artists } from "@/lib/artists";
import { events } from "@/lib/jack-events";
import { useScroll, useTransform } from "framer-motion";

export default function ArtistJPage() {
  const artist = artists.find((a) => a.id === "j");

  if (!artist) return <div>Artist not found</div>;

  const { scrollY } = useScroll();

  return (
    <div className="relative">
      <div className="relative z-10 flex items-start p-8">
        <PortfolioCard artist={artist} />
        <div className="ml-8">
          <h1 className="text-4xl font-light">Welcome to {artist.name}'s Portfolio</h1>
          <p className="mt-4 text-gray-400">{artist.bio}</p>
        </div>
      </div>

      {/* Past Events Section */}
      <div className="mt-16 p-8">
        <h2 className="text-3xl font-light text-white mb-8">Past Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              description={event.description}
              media={event.media}
            />
          ))}
        </div>
      </div>
    </div>
  );
}