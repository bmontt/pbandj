"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import EventCountdown from "./event-countdown"

interface HeaderWithCountdownProps {
  audioReactivity?: number
}

export default function HeaderWithCountdown({ audioReactivity = 0 }: HeaderWithCountdownProps) {
  return (
    <header className="fixed top-0 w-full z-50">
      {/* Enhanced glassy backdrop */}
      <div className="absolute inset-0 glass-nav"></div>
      
      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-30"></div>
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 md:px-16 py-1">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex gap-3 sm:gap-8 text-xs sm:text-sm">
            <a
              href="#epk"
              className="text-gray-200/90 hover:text-white transition-all duration-300 uppercase tracking-widest font-light glass-text hover:scale-105"
            >
              Team
            </a>
            <a
              href="#demo"
              className="text-gray-200/90 hover:text-white transition-all duration-300 uppercase tracking-widest font-light glass-text hover:scale-105"
            >
              Submit
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-light text-white/95 tracking-wider glass-text"
          >
            <Image src="/pbj_logo_transparent.optimized.webp" alt="PB&J" width={100} height={25} />
          </motion.div>

          <div className="flex gap-3 sm:gap-8 text-xs sm:text-sm">
            <a
              href="#"
              className="text-gray-200/90 hover:text-white transition-all duration-300 uppercase tracking-widest font-light glass-text hover:scale-105"
            >
              Events
            </a>
            <a
              href="#"
              className="text-gray-200/90 hover:text-white transition-all duration-300 uppercase tracking-widest font-light glass-text hover:scale-105"
            >
              About
            </a>
          </div>
        </div>

        <div className="-mt-5">
          <h3 className="text-center text-xs sm:text-sm text-gray-300/70 uppercase tracking-widest mt-2 mb-2 glass-text">Event Series Release</h3>
          <EventCountdown audioReactivity={audioReactivity} />
        </div>
      </div>
    </header>
  )
}
