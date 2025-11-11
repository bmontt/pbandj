"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface EnterButtonProps {
  onClick: () => void
}

export default function EnterButton({ onClick }: EnterButtonProps) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="relative px-12 py-4 text-lg font-bold text-black bg-white rounded-full hover:bg-pink-600 hover:text-white transition-all duration-300 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span animate={{ opacity: isHovering ? 0 : 1 }} transition={{ duration: 0.2 }}>
        ENTER
      </motion.span>
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-white"
        animate={{ opacity: isHovering ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        START
      </motion.span>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-pink-600"
        animate={{
          boxShadow: isHovering ? "0 0 30px rgba(255, 0, 81, 0.8)" : "0 0 15px rgba(255, 0, 81, 0.3)",
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}
