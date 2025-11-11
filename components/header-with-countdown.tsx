"use client"

import { motion } from "framer-motion"
import EventCountdown from "./event-countdown"

interface HeaderWithCountdownProps {
  audioReactivity?: number
}

export default function HeaderWithCountdown({ audioReactivity = 0 }: HeaderWithCountdownProps) {
  return (
    <header className="w-full bg-black/50 backdrop-blur-md border-b border-gray-800/20">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-3">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-light text-white/80 tracking-wider"
          >
            PB&J
          </motion.div>

          <div className="hidden md:flex gap-8">
            <a
              href="#epk"
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs uppercase tracking-widest font-light"
            >
              Artists
            </a>
            <a
              href="#demo"
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs uppercase tracking-widest font-light"
            >
              Submit
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs uppercase tracking-widest font-light"
            >
              Events
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800/20 pt-3">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-2">Next Event</p>
          <EventCountdown audioReactivity={audioReactivity} />
        </div>
      </div>
    </header>
  )
}
