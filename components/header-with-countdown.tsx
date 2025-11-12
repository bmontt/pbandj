"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import EventCountdown from "./event-countdown"

interface HeaderWithCountdownProps {
  audioReactivity?: number
}

export default function HeaderWithCountdown({ audioReactivity = 0 }: HeaderWithCountdownProps) {
  return (
    <header className="relative w-full bg-black/80 border-b border-gray-800/20 z-50">
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-8">
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
          </div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-light text-white/80 tracking-wider"
          >
            <Image src="pbj_logo_transparent.png" alt="PB&J" width={120} height={30} />
          </motion.div>

          <div className="flex gap-8">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs uppercase tracking-widest font-light"
            >
              Events
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs uppercase tracking-widest font-light"
            >
              About
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800/20 pt-3">
          <EventCountdown audioReactivity={audioReactivity} />
          <h3 className="text-center text-xs text-gray-600 uppercase tracking-widest mb-2">2.0 Launch Countdown</h3>
        </div>
      </div>
    </header>
  )
}
