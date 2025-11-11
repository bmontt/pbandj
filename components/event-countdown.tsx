"use client"

import { useEffect, useState, useRef } from "react"
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
  eventDate = process.env.NEXT_PUBLIC_EVENT_DATE || "2025-12-31T23:59:59Z",
  audioReactivity = 0,
}: EventCountdownProps) {
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  })
  const animationRef = useRef<NodeJS.Timeout>()

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
    animationRef.current = setInterval(calculateCountdown, 1000)

    return () => clearInterval(animationRef.current)
  }, [eventDate])

  const CountdownUnit = ({
    value,
    label,
    index,
  }: {
    value: number
    label: string
    index: number
  }) => (
    <motion.div
      className="flex flex-col items-center"
      animate={{
        scale: 1 + audioReactivity * 0.1,
      }}
      transition={{ duration: 0.1 }}
    >
      <motion.div
        className="text-3xl md:text-5xl font-bold text-pink-600 tabular-nums"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        {String(value).padStart(2, "0")}
      </motion.div>
      <span className="text-xs md:text-sm text-gray-400 uppercase tracking-wider mt-2">{label}</span>
    </motion.div>
  )

  return (
    <div className="w-full">
      {countdown.isLive ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <h3 className="text-4xl md:text-6xl font-bold text-pink-600 animate-pulse">EVENT LIVE NOW</h3>
        </motion.div>
      ) : (
        <div className="flex justify-center items-center gap-4 md:gap-8 py-8 px-4">
          <CountdownUnit value={countdown.days} label="Days" index={0} />
          <span className="text-2xl md:text-4xl text-pink-600 font-bold">:</span>
          <CountdownUnit value={countdown.hours} label="Hours" index={1} />
          <span className="text-2xl md:text-4xl text-pink-600 font-bold">:</span>
          <CountdownUnit value={countdown.minutes} label="Minutes" index={2} />
          <span className="text-2xl md:text-4xl text-pink-600 font-bold">:</span>
          <CountdownUnit value={countdown.seconds} label="Seconds" index={3} />
        </div>
      )}
    </div>
  )
}
