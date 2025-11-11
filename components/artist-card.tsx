"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Artist {
  id: number
  name: string
  role: string
  bio: string
  videoUrl: string
  quote: string
  image: string
  socialLinks: {
    instagram: string
    spotify: string
  }
}

interface ArtistCardProps {
  artist: Artist
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      className="bg-gray-900/10 border border-gray-700/20 rounded-sm overflow-hidden glow-yellow-sm"
      whileHover={{ borderColor: "rgb(234 179 8 / 0.3)", boxShadow: "0 0 20px rgba(234,179,8,0.2)" }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-8">
        <div className="flex items-start gap-8">
          <img
            src={artist.image || "/placeholder.svg"}
            alt={artist.name}
            className="w-28 h-28 rounded-sm object-cover opacity-90"
          />
          <div className="flex-1">
            <h3 className="text-2xl font-light text-white/95">{artist.name}</h3>
            <p className="text-yellow-600/70 font-light mb-2 text-sm">{artist.role}</p>
            <p className="text-gray-400 font-light text-sm leading-relaxed">{artist.bio}</p>
          </div>
          <motion.button
            onClick={() => setExpanded(!expanded)}
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-gray-500 hover:text-yellow-600/70 transition-colors flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0, marginTop: 0 }}
          animate={{
            opacity: expanded ? 1 : 0,
            marginTop: expanded ? 24 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="mt-6 p-6 border-l border-gray-700/30 bg-gray-900/10 rounded-sm glow-yellow-sm"
        >
          <p className="text-gray-400 italic font-light text-sm">"{artist.quote}"</p>
        </motion.div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700/20 overflow-hidden"
          >
            <div className="p-8 space-y-8">
              {/* Video Snippet */}
              <div>
                <h4 className="text-xs font-light text-gray-500 mb-4 uppercase tracking-widest">Behind the Scenes</h4>
                <video src={artist.videoUrl} controls className="w-full rounded-sm bg-black aspect-video" playsInline />
              </div>

              {/* Social Links */}
              <div className="flex gap-6">
                <a
                  href={artist.socialLinks.instagram}
                  className="text-gray-500 hover:text-yellow-600/70 transition-all flex items-center gap-2 text-sm font-light"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m5.521 17.561a6.684 6.684 0 01-13.042 0V6.439a6.684 6.684 0 0113.042 0z" />
                  </svg>
                  Instagram
                </a>
                <a
                  href={artist.socialLinks.spotify}
                  className="text-gray-500 hover:text-yellow-600/70 transition-all flex items-center gap-2 text-sm font-light"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.7 17.3c-.4.5-1.1.7-1.7.3-4.7-2.9-10.6-3.5-17.6-1.9-.6.2-1.3-.1-1.5-.7-.2-.6.1-1.3.7-1.5 7.5-1.8 14-1 19.1 2.2.5.3 1 .7 1.3 1.3.3.6 0 1.3-.5 1.7z" />
                  </svg>
                  Spotify
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
