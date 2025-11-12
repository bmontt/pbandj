"use client"

import { useEffect, useRef, useState } from "react"

declare global {
  interface Window {
    SC?: any
  }
}

interface SoundCloudPlayerProps {
  playlistUrl: string
  play?: boolean
  /** Section id to watch (e.g., "demo") */
  targetSectionId?: string
  /** Volume when section is active (0-100) */
  lowVolume?: number
  /** Volume when section is inactive (0-100) */
  normalVolume?: number
}

export default function SoundCloudPlayer({
  playlistUrl,
  play = false,
  targetSectionId = "demo",
  lowVolume = 35,
  normalVolume = 100,
}: SoundCloudPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const widgetRef = useRef<any>(null)
  const pendingVolumeRef = useRef<number | null>(null)
  const [ready, setReady] = useState(false)

  // Load the SoundCloud Widget API script if needed
  useEffect(() => {
    if (window.SC && window.SC.Widget) return
    const script = document.createElement("script")
    script.src = "https://w.soundcloud.com/player/api.js"
    script.async = true
    document.body.appendChild(script)
    return () => {
      // leave script in place; widget may persist across route changes
    }
  }, [])

  // Initialize widget when iframe and API are available
  useEffect(() => {
    if (!iframeRef.current) return
    const init = () => {
      if (!window.SC || !window.SC.Widget) return
      const widget = window.SC.Widget(iframeRef.current!)
      widgetRef.current = widget

      widget.bind(window.SC.Widget.Events.READY, () => {
        setReady(true)
        if (typeof pendingVolumeRef.current === "number") {
          widget.setVolume(pendingVolumeRef.current)
          pendingVolumeRef.current = null
        } else {
          widget.setVolume(play ? normalVolume : 0)
        }
        if (play) widget.play()
      })
    }

    const id = window.setInterval(() => {
      if (window.SC && window.SC.Widget) {
        window.clearInterval(id)
        init()
      }
    }, 50)

    return () => window.clearInterval(id)
  }, [play, normalVolume])

  // Handle play/pause changes
  useEffect(() => {
    const widget = widgetRef.current
    if (!widget) return
    if (play) {
      widget.setVolume(normalVolume)
      widget.play()
    } else {
      widget.pause()
    }
  }, [play, normalVolume])

  // Observe target section visibility to duck volume (simulating lowpass)
  useEffect(() => {
    const el = document.getElementById(targetSectionId)
    if (!el) return
    const widget = widgetRef.current

    const applyVolume = (vol: number) => {
      if (widget) {
        widget.setVolume(vol)
      } else {
        pendingVolumeRef.current = vol
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const inView = entries.some((e) => e.isIntersecting)
        if (inView) {
          applyVolume(lowVolume)
        } else {
          applyVolume(normalVolume)
        }
      },
      { root: null, rootMargin: "0px", threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [targetSectionId, lowVolume, normalVolume])

  // If no playlist, render nothing
  if (!playlistUrl) return null

  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    playlistUrl
  )}&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&visual=false`

  return (
    // Keep the iframe visually hidden but present so the widget can play
    <iframe
      ref={iframeRef}
      title="SoundCloud Player"
      width="0"
      height="0"
      style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
      scrolling="no"
      frameBorder="no"
      allow="autoplay"
      src={src}
    />
  )
}
