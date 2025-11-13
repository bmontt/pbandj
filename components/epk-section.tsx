"use client"

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import ArtistCard from "./artist-card"
import ParticleBackground from "./particle-background"
import { PBJ_COLORS } from "@/lib/colors"
import { artists } from "@/lib/artists";

export default function EPKSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [expandedArtist, setExpandedArtist] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState(0)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1])
  
  // Update scroll position for Three.js
  useEffect(() => {
    const updateScrollY = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', updateScrollY)
    return () => window.removeEventListener('scroll', updateScrollY)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full bg-transparent" id="epk">
      {/* Particle Background */}
      <ParticleBackground scrollY={scrollY} />
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div 
          className="h-[1000px] w-full bg-cover bg-center bg-no-repeat opacity-15 -mt-32"
          style={{
            backgroundImage: "url('/mosaicDreamy.JPG')",
            backgroundPosition: "center 40%",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0) 100%)"
          }}
        />
        {/* Subtle overlay for better text readability */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-transparent -mt-32"
          style={{
            height: "1000px"
          }}
        />
      </div>
      
      <div className="relative z-10 w-full px-8 md:px-16 py-32">
        <motion.div className="w-full max-w-6xl mx-auto" style={{ opacity }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            className="mb-48 space-y-6"
          >
            <p className="text-xs text-gray-500 uppercase tracking-widest">The Collective</p>
            <h2 className="text-5xl md:text-6xl font-light text-white/95">PB&J Sounds</h2>
            <p className="text-lg text-gray-400 font-light max-w-3xl leading-relaxed">
              Bringing a fresh new sound to the electronic music scene, PB&J Sounds is a dynamic collective of artists and producers dedicated to crafting immersive audio experiences. With a focus on innovative sound design and genre-blending compositions, PB&J Sounds aims to captivate audiences and redefine the boundaries of electronic music.
            </p>
          </motion.div>

          <div className="space-y-16">
            {/* Artists in a row */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              viewport={{ once: false, margin: "-150px" }}
              className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12"
            >
              {artists.map((artist, index) => (
                <div key={artist.id} className="flex items-center gap-8 md:gap-12">
                  <Link href={`/artists/${artist.id}`} className="block">
                    <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer transition-all p-6">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <img
                          src={artist.image || "/placeholder.svg"}
                          alt={artist.name}
                          className="w-100 h-100 rounded-sm object-cover opacity-90"
                          style={{ objectPosition: "center top" }}
                        />
                        <div>
                          <h3 className="text-xl font-light text-white/95">
                            {artist.id === "p" && (
                              <>
                                <span className="text-3xl font-black text-[#B58657]/90">P</span>
                                {artist.name.slice(1)}
                              </>
                            )}
                            {artist.id === "b" && (
                              <>
                                <span className="text-3xl font-black text-[#C44D58]/90">B</span>
                                {artist.name.slice(1)}
                              </>
                            )}
                            {artist.id === "j" && (
                              <>
                                <span className="text-3xl font-black text-[#935BAD]/90">J</span>
                                {artist.name.slice(1)}
                              </>
                            )}
                          </h3>
                          <p className="text-[#C69A6C]/70 font-light text-sm">{artist.role}</p>
                        </div>
                      </div>
                    </motion.div>
                  </Link>

                  {/* Add ampersand only between B and J */}
                  {index === 1 && (
                    <motion.span 
                      className="text-4xl md:text-5xl font-light text-[#EA9A6C]/50 hidden md:block"
                      animate={{ 
                        opacity: [0.3, 0.8, 0.3],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut",
                        delay: index * 0.5
                      }}
                    >
                      &amp;
                    </motion.span>
                  )}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: false, margin: "-100px" }}
            className="mt-48 pt-32 space-y-16"
          >
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Highlights</p>
              <h3 className="text-4xl font-light text-white/95">Past Events</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

                <motion.div
                  key={"echostage"}
                  whileHover={{ scale: 1.03, opacity: 0.95 }}
                  className="aspect-video rounded-sm overflow-hidden cursor-pointer transition-all"
                >
                  <img
                    src={`/echostage.JPG`}
                    alt={`Event 1`}
                    className="w-full h-full object-cover opacity-70 hover:opacity-85 transition-opacity"
                  />
                </motion.div>

                <motion.div
                  key={"charity"}
                  whileHover={{ scale: 1.03, opacity: 0.95 }}
                  className="aspect-video rounded-sm overflow-hidden cursor-pointer transition-all"
                >
                  <img
                    src={`/charityCrowd.png`}
                    alt={`Event 2`}
                    className="w-full h-full object-cover opacity-70 hover:opacity-85 transition-opacity"
                  />
                </motion.div>

                <motion.div
                  key={"mosaic"}
                  whileHover={{ scale: 1.03, opacity: 0.95 }}
                  className="aspect-video rounded-sm overflow-hidden cursor-pointer transition-all"
                >
                  <img
                    src={`/mosaicLockedIn.JPG`}
                    alt={`Event 3`}
                    className="w-full h-full object-cover opacity-70 hover:opacity-85 transition-opacity"
                  />
                </motion.div>

                <motion.div
                  key={"lfsystem"}
                  whileHover={{ scale: 1.03, opacity: 0.95 }}
                  className="aspect-video rounded-sm overflow-hidden cursor-pointer transition-all"
                >
                  <img
                    src={`/lfsystem.jpg`}
                    alt={`Event 4`}
                    className="w-full h-full object-cover opacity-70 hover:opacity-85 transition-opacity"
                  />
                </motion.div>

                <motion.div
                  key={"discoversary"}
                  whileHover={{ scale: 1.03, opacity: 0.95 }}
                  className="aspect-video rounded-sm overflow-hidden cursor-pointer transition-all"
                >
                  <img
                    src={`/discoversary.JPG`}
                    alt={`Event 5`}
                    className="w-full h-full object-cover opacity-70 hover:opacity-85 transition-opacity"
                  />
                </motion.div>

                <motion.div
                  key={"wayward"}
                  whileHover={{ scale: 1.03, opacity: 0.95 }}
                  className="aspect-video rounded-sm overflow-hidden cursor-pointer transition-all"
                >
                  <img
                    src={`/WaywardSnowGlow_Feb1-56.jpg`}
                    alt={`Event 6`}
                    className="w-full h-full object-cover opacity-70 hover:opacity-85 transition-opacity"
                  />
                </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            viewport={{ once: false, margin: "-100px" }}
            className="mt-48 pt-32 space-y-12"
          >
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Music</p>
              <h3 className="text-4xl font-light text-white/95">Latest Releases</h3>
            </div>
            <div className="p-16">
              <p className="text-gray-500 text-center text-sm font-light">Spotify playlist embed will appear here</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            viewport={{ once: false, margin: "-100px" }}
            className="mt-48 pt-32 items-center"
          >
            <a
              href="#"
              className="inline-flex items-center gap-3 px-8 py-3 text-white font-light transition-all text-sm hover:text-[#C44D58]/70"
            >
              Download EPK
              <svg className="w-4 h-4 items-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>
  )
}
