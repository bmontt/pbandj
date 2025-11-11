"use client";

import { useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { AudioProvider } from "./components/AudioContextProvider";
import DemoForm from "./components/DemoForm";
import ScrollSections from "./components/ScrollSections";
import { Canvas } from "@react-three/fiber";

const LiquidGlassShader = dynamic(() => import("./components/LiquidGlassShader"), { ssr: false });

export default function Home() {
  const [entered, setEntered] = useState(false);

  return (
    <AudioProvider>
      <div className="min-h-screen w-full bg-[linear-gradient(180deg,#05060a,#000)] text-white">
        {/* Landing */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <video
            src="/video/loop.mp4"
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />

          {/* Three.js shader overlay */}
          <div className="absolute inset-0 pointer-events-none w-full h-full">
            <Suspense fallback={null}>
              <Canvas
                style={{ width: "100%", height: "100%" }}
                camera={{ position: [0, 0, 2], fov: 75 }}
              >
                <ambientLight intensity={0.6} />
                <LiquidGlassShader dissolve={entered ? 1 : 0} />
              </Canvas>
            </Suspense>
          </div>

          <div className="relative z-20 text-center">
            <h1 className="text-6xl font-black tracking-tight mb-6">PB&amp;J Sounds</h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Immersive audio-visual experience. Press ENTER to dissolve the glass and enter the experience.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                className="px-8 py-3 rounded-full bg-[#ff0051] text-white font-semibold shadow-lg"
                onClick={() => setEntered(true)}
              >
                ENTER
              </button>
              <a href="/pbj-epk.pdf" className="px-6 py-3 rounded-full border border-white/10 text-white">
                Download EPK
              </a>
            </div>
          </div>
        </section>

        {/* Main scroll sections */}
        <main>
          <ScrollSections />

          <section id="demos" className="min-h-screen flex items-center justify-center p-12">
            <div className="max-w-3xl w-full">
              <h2 className="text-4xl font-bold mb-4">Submit a Demo</h2>
              <p className="mb-6 text-gray-300">Send us your track and we'll give it a spin.</p>
              <DemoForm />
            </div>
          </section>
        </main>
      </div>
    </AudioProvider>
  );
}
