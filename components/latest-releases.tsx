"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Track {
  id: string;
  title: string;
  artist: string;
  nickname: string;
  image: string;
  url: string;
  releaseDate: string;
  platform: "spotify" | "soundcloud";
}

export default function LatestReleases() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTracks() {
      try {
        const response = await fetch("/api/latest-tracks");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch tracks"
          );
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setTracks(data);
        } else if (data.tracks && Array.isArray(data.tracks)) {
          setTracks(data.tracks);
        }
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
  }, []);

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
    <div className="grid grid-cols-3 gap-2 justify-items-center">
      {tracks.map((track, index) => (
        <motion.a
          key={track.id}
          href={track.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6}}
          viewport={{ once: false, margin: "-50px" }}
          whileHover={{ scale: 1.05 }}
          className="group cursor-pointer w-full max-w-70"
        >
          <div className="relative overflow-hidden rounded-sm bg-black/40 aspect-square">
            {track.image && (
              <img
                src={track.image}
                alt={track.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex flex-col items-center justify-center p-3 opacity-0 group-hover:opacity-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-white">
                  {track.platform === "spotify" ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.7 17.3c-.4.5-1.1.7-1.7.3-4.7-2.9-10.6-3.5-17.6-1.9-.6.2-1.3-.1-1.5-.7-.2-.6.1-1.3.7-1.5 7.5-1.8 14-1 19.1 2.2.5.3 1 .7 1.3 1.3.3.6 0 1.3-.5 1.7z" />
                      </svg>
                      <span className="text-xs">Play</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 4v16h10V4H7zm6 13.5c-1.933 0-3.5-1.567-3.5-3.5s1.567-3.5 3.5-3.5 3.5 1.567 3.5 3.5-1.567 3.5-3.5 3.5z" />
                      </svg>
                      <span className="text-xs">Play</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-white text-sm font-light line-clamp-2">
              {track.title}
            </p>
            <p className="text-gray-400 text-xs font-light">
              {track.nickname}
            </p>
          </div>
        </motion.a>
      ))}
    </div>
  );
}
