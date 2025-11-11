"use client"

import { motion } from "framer-motion"
import type { MotionValue } from "framer-motion"

interface ParallaxBackgroundProps {
  backgroundY: MotionValue<number>
  secondLayerY: MotionValue<number>
  thirdLayerY: MotionValue<number>
}

export default function ParallaxBackground({ backgroundY, secondLayerY, thirdLayerY }: ParallaxBackgroundProps) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 bg-gradient-to-b from-gray-900/20 via-black to-black"
      />

      <motion.div
        style={{ y: secondLayerY }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_-30%,rgba(234,179,8,0.08),transparent)] opacity-40"
      />

      <motion.div
        style={{ y: thirdLayerY }}
        className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/10 to-black/40"
      />

      <div className="absolute inset-0 opacity-[0.01] bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><filter id=%22noise%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 result=%22noise%22/></filter><rect width=%22100%22 height=%22100%22 filter=%22url(%23noise)%22 fill=%22white%22/></svg>')]" />
    </div>
  )
}
