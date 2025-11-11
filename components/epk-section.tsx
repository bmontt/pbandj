"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import ArtistCard from "./artist-card"
import NewsletterSidebar from "./newsletter-sidebar"

export default function EPKSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])

  const artists = [
    {
      id: 2,
      name: "Peter Gomes",
      role: "Sound Design & Mixing",
      bio: "Creating immersive audio experiences",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4",
      quote: "Every frequency tells a story",
      image: "/pj.jpg",
      socialLinks: {
        instagram: "#",
        spotify: "#",
      },
    },
    {
      id: 1,
      name: "Brody Montag",
      role: "Lead DJ & Producer",
      bio: "Crafting sonic landscapes since 2013",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4",
      quote: "Music is the language of the soul",
      image: "/brody.jpg",
      socialLinks: {
        instagram: "#",
        spotify: "#",
      },
    },
    {
      id: 3,
      name: "Jack Humphreys",
      role: "Visual Direction & Tech",
      bio: "Blending visuals with sound",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4",
      quote: "Synesthesia through technology",
      image: "/jack.jpg",
      socialLinks: {
        instagram: "#",
        spotify: "#",
      },
    },
  ]

  return (
    <div ref={containerRef} className="relative w-full bg-transparent" id="epk">
      <div className="w-full px-8 md:px-16 py-32 flex gap-20">
        <motion.div className="flex-1" style={{ opacity }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            className="mb-48 space-y-6 glow-yellow-sm"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest">The Collective</p>
            <h2 className="text-5xl md:text-6xl font-light text-white/95">PB&J Sounds</h2>
            <p className="text-lg text-gray-400 font-light max-w-3xl leading-relaxed">
              Exploring the intersection of sound, vision, and technology
            </p>
          </motion.div>

          <div className="space-y-32">
            {artists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: index * 0.15 }}
                viewport={{ once: false, margin: "-150px" }}
                className="glow-yellow-sm"
              >
                <ArtistCard artist={artist} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: false, margin: "-100px" }}
            className="mt-48 pt-32 space-y-16 glow-yellow-sm"
          >
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Highlights</p>
              <h3 className="text-4xl font-light text-white/95">Past Events</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03, opacity: 0.95 }}
                  className="aspect-video bg-gray-800/20 rounded-sm overflow-hidden border border-gray-700/10 cursor-pointer transition-all glow-yellow-sm"
                >
                  <img
                    src={`/event-.jpg`}
                    alt={`Event ${i}`}
                    className="w-full h-full object-cover opacity-70 hover:opacity-85 transition-opacity"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}
            className="mt-48 pt-32 space-y-12 glow-yellow-sm"
          >
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Music</p>
              <h3 className="text-4xl font-light text-white/95">Latest Releases</h3>
            </div>
            <div className="bg-gray-900/10 rounded-sm p-16 border border-gray-700/10">
              <p className="text-gray-500 text-center text-sm font-light">Spotify playlist embed will appear here</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: false, margin: "-100px" }}
            className="mt-48 pt-32"
          >
            <a
              href="#"
              className="inline-flex items-center gap-3 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-sm font-light transition-all border border-white/10 hover:border-yellow-600/30 text-sm glow-yellow-sm hover:glow-yellow"
            >
              Download EPK
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </a>
          </motion.div>
        </motion.div>

        <NewsletterSidebar />
      </div>
    </div>
  )
}
