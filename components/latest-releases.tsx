"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export interface Track {
  id: string;
  title: string;
  artist: string;
  nickname: string;
  image: string;
  url: string;
  releaseDate: string;
  platform: "spotify" | "soundcloud";
}

interface TracksGridProps {
  apiEndpoint?: string;
  filterFn?: (track: Track) => boolean;
  gridCols?: number;
  title?: string;
  showTitle?: boolean;
  limit?: number;
}

export default function TracksGrid({ 
  apiEndpoint = "/api/latest-tracks",
  filterFn,
  gridCols = 3,
  title = "Latest Releases",
  showTitle = false,
  limit = 9,
}: TracksGridProps) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tappedTrackId, setTappedTrackId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const url = new URL(apiEndpoint, window.location.origin);
        url.searchParams.set("limit", limit.toString());
        
        const response = await fetch(url.toString());
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch tracks"
          );
        }
        const data = await response.json();
        let tracksData = Array.isArray(data) ? data : (data.tracks && Array.isArray(data.tracks) ? data.tracks : []);
        
        if (filterFn) {
          tracksData = tracksData.filter(filterFn);
        }
        
        setTracks(tracksData);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load tracks";
        console.error("Track fetch error:", message);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchTracks();
  }, [apiEndpoint, limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-16 text-gray-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      {showTitle && (
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-3xl font-light text-white mb-8"
        >
          {title}
        </motion.h2>
      )}
      <div className="w-full px-4">
        <div className={`grid grid-cols-${gridCols} gap-4 justify-items-center`}>
        {tracks.map((track, index) => (
          <motion.a
            key={track.id}
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: false, margin: "-50px" }}
            whileHover={{ 
              scale: 1.08,
              transition: { duration: 0.3 }
            }}
            onTap={() => {
              setTappedTrackId(track.id)
              setTimeout(() => setTappedTrackId(null), 1000)
            }}
            className="group cursor-pointer w-full max-w-xs"
          >
            <div className="relative overflow-hidden rounded-lg bg-black/40 aspect-square shadow-lg group-hover:shadow-2xl transition-all duration-300">
              {/* Image with enhanced effects */}
              <div className="absolute inset-0 overflow-hidden">
                {track.image && (
                  <motion.img
                    src={track.image}
                    alt={track.title}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </div>

              {/* Gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-all duration-300" />
              
              {/* Subtle border glow on hover */}
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-lg transition-all duration-300 pointer-events-none" />

              {/* Play button overlay */}
              <motion.div 
                className="absolute inset-0 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100 transition-all duration-300"
                initial={{ scale: 0.8 }}
                animate={tappedTrackId === track.id ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 group-hover:bg-white/30 group-hover:border-white/60 transition-all duration-300"
                  whileHover={{ 
                    scale: 1.15,
                    backgroundColor: "rgba(255,255,255,0.35)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-7 h-7 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </motion.div>
              </motion.div>
            </div>

            {/* Enhanced text section with better spacing */}
            <motion.div 
              className="mt-4 space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-white text-sm font-medium line-clamp-2 tracking-wide leading-snug group-hover:text-white/95 transition-colors duration-300">
                {track.title}
              </p>
              <p className="text-gray-400 text-xs font-light group-hover:text-gray-300 transition-colors duration-300">
                {track.nickname}
              </p>
            </motion.div>
          </motion.a>
        ))}
      </div>
      </div>
    </>
  );
}
