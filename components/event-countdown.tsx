"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface CountdownState {
  days: number
  hours: number
  minutes: number
  seconds: number
  isLive: boolean
}

interface EventCountdownProps {
  eventDate?: string
  audioReactivity?: number
}

export default function EventCountdown({
  eventDate = process.env.NEXT_PUBLIC_EVENT_DATE || "2026-01-01T00:00:00Z",
  audioReactivity = 0,
}: EventCountdownProps) {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  })

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date().getTime()
      const eventTime = new Date(eventDate).getTime()
      const distance = eventTime - now

      if (distance <= 0) {
        setCountdown({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
        })
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds, isLive: false })
    }

    calculateCountdown()
    const interval = setInterval(calculateCountdown, 1000)

    return () => clearInterval(interval)
  }, [eventDate])

  return (
    <div className="w-full">
      {countdown.isLive ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <motion.h3 
            className="text-4xl md:text-6xl font-black text-yellow-600/90 tracking-wider font-cinzel"
            animate={{
              textShadow: [
                "0 0 20px rgba(234,179,8,0.3)",
                "0 0 30px rgba(234,179,8,0.5)",
                "0 0 20px rgba(234,179,8,0.3)"
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            EVENT LIVE NOW
          </motion.h3>
        </motion.div>
      ) : (
        <div className="flex justify-center items-center gap-6 md:gap-12 py-8 px-4">
          {/* Days */}
          <div className="flex flex-col items-center">
            <motion.div 
              className="text-3xl md:text-5xl font-black text-white/95 font-cinzel"
              key={countdown.days}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {String(countdown.days).padStart(2, '0')}
            </motion.div>
            <span className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mt-3 font-light font-cinzel">
              Days
            </span>
          </div>

          <motion.span 
            className="text-3xl md:text-5xl text-gray-600/70 font-light font-cinzel mb-8"
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatType: "reverse"
            }}
          >
            :
          </motion.span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <motion.div 
              className="text-3xl md:text-5xl font-black text-white/95 font-cinzel"
              key={countdown.hours}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {String(countdown.hours).padStart(2, '0')}
            </motion.div>
            <span className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mt-3 font-light font-cinzel">
              Hours
            </span>
          </div>

          <motion.span 
            className="text-3xl md:text-5xl text-gray-600/70 font-light font-cinzel mb-8"
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: 0.4,
              repeatType: "reverse"
            }}
          >
            :
          </motion.span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <motion.div 
              className="text-3xl md:text-5xl font-black text-white/95 font-cinzel"
              key={countdown.minutes}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {String(countdown.minutes).padStart(2, '0')}
            </motion.div>
            <span className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mt-3 font-light font-cinzel">
              Minutes
            </span>
          </div>

          <motion.span 
            className="text-3xl md:text-5xl text-gray-600/70 font-light font-cinzel mb-8"
            animate={{ 
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut", 
              delay: 0.8,
              repeatType: "reverse"
            }}
          >
            :
          </motion.span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <motion.div 
              className="text-3xl md:text-5xl font-black text-white/95 font-cinzel"
              key={countdown.seconds}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {String(countdown.seconds).padStart(2, '0')}
            </motion.div>
            <span className="text-xs md:text-sm text-gray-500 uppercase tracking-widest mt-3 font-light font-cinzel">
              Seconds
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
