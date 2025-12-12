"use client"

import { useEffect, useRef } from "react"

interface FlipProps {
  value: number | string
  className?: string
}

let Tick: any = null

if (typeof window !== 'undefined') {
  import("@pqina/flip").then(module => {
    Tick = module.default
  })
}

export default function Flip({ value, className = "" }: FlipProps) {
  const tickRef = useRef<HTMLDivElement>(null)
  const tickInstanceRef = useRef<any>(null)

  useEffect(() => {
    const initTick = () => {
      if (!Tick || !tickRef.current) {
        requestAnimationFrame(initTick)
        return
      }

      // Destroy previous instance if it exists
      if (tickInstanceRef.current) {
        Tick.DOM.destroy(tickRef.current)
      }

      // Create new Tick instance with proper structure
      tickInstanceRef.current = Tick.DOM.create(tickRef.current, {
        value: String(value).padStart(2, '0'),
      })

      // Hide PQINA branding after creation
      setTimeout(() => {
        if (tickRef.current) {
          const links = tickRef.current.querySelectorAll('a')
          links.forEach((link: HTMLElement) => {
            link.style.display = 'none'
          })
        }
      }, 50)
    }

    initTick()

    // Cleanup
    return () => {
      if (tickInstanceRef.current && tickRef.current && Tick) {
        Tick.DOM.destroy(tickRef.current)
        tickInstanceRef.current = null
      }
    }
  }, [])

  // Update value
  useEffect(() => {
    if (!tickInstanceRef.current) return
    tickInstanceRef.current.value = String(value).padStart(2, '0')
  }, [value])

  return (
    <div ref={tickRef} className={`tick ${className}`}>
      <div data-repeat="true" aria-hidden="true">
        <span data-view="flip"></span>
      </div>
    </div>
  )
}
