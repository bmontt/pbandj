"use client"

// import EnterButton from "@/components/enter-button"
import ScrollContainer from "@/components/scroll-container"
import SoundCloudPlayer from "@/components/soundcloud-player"
import ParticleBackground from "@/components/particle-background"
// import VinylBackground from "@/components/vinyl-background"
// import { Canvas } from "@react-three/fiber"
import { Suspense, useRef, useState, useEffect } from "react"

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  // Audio reactivity is disabled when using SoundCloud Widget (no audio graph access)
  const mainScrollRef = useRef<HTMLDivElement>(null)

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Auto fade-in effect after page load
  useEffect(() => {
    // Disable scroll during assembly animation
    if (!showContent) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showContent])

  useEffect(() => {
    // Small delay to ensure everything is mounted
    const timer = setTimeout(() => {
      setIsLoaded(true)
      // Start content fade much earlier for longer overlap with particle dispersal
      const contentTimer = setTimeout(() => {
        setShowContent(true)
      }, 400) // Start fade much earlier (was 800ms) for longer overlap

      return () => clearTimeout(contentTimer)
    }, 0) // Start particles sooner (was 300ms)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="relative w-full bg-black overflow-x-hidden">
      {/* Particle background - temporarily disabled */}
      <div className="fixed inset-0 w-full h-full z-0">
        {/* <ParticleBackground 
          scrollY={scrollY} 
          forceVisible={!showContent} // Force visible during loading, then use normal scroll behavior
          isAssembling={!showContent} // Assembly animation during loading
        /> */}
      </div>

      {/* Main content with fade in effect */}
      <div 
        className={`relative z-20 transition-opacity duration-[2500ms] ease-in-out ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* SoundCloud playlist player */}
        <SoundCloudPlayer
          playlistUrl={process.env.NEXT_PUBLIC_SOUNDCLOUD_PLAYLIST_URL || "https://soundcloud.com/you/sets/your-playlist"}
          play={showContent}
          targetSectionId="demo"
          lowVolume={30}
          normalVolume={100}
        />

        <ScrollContainer ref={mainScrollRef} audioReactivity={0} />
      </div>
    </main>
  )
}
