"use client"

import { useState, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import ShaderBackground from "@/components/shader-background"
import EnterButton from "@/components/enter-button"
import AudioController from "@/components/audio-controller"
import ScrollContainer from "@/components/scroll-container"

export default function HomePage() {
  const [entered, setEntered] = useState(false)
  const [audioReactivity, setAudioReactivity] = useState(0)
  const mainScrollRef = useRef<HTMLDivElement>(null)

  return (
    <main className="relative w-full bg-black overflow-x-hidden">
      {!entered ? (
        <div className="relative w-full h-screen overflow-hidden">
          <div className="absolute inset-0 w-full h-screen">
            <Canvas dpr={[1, 2]}>
              <Suspense fallback={null}>
                <ShaderBackground isActive={!entered} />
              </Suspense>
            </Canvas>
          </div>

          <AudioController onReady={() => {}} isEntered={entered} onFFTUpdate={setAudioReactivity} />

          <div className="absolute inset-0 flex items-center justify-center z-10">
            <EnterButton onClick={() => setEntered(true)} />
          </div>
        </div>
      ) : (
        <ScrollContainer ref={mainScrollRef} audioReactivity={audioReactivity} />
      )}
    </main>
  )
}
