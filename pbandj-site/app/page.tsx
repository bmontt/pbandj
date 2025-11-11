'use client';
import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AudioProvider } from './components/AudioContextProvider';
import DemoForm from './components/DemoForm';
import ScrollSections from './components/ScrollSections';
import { Canvas } from '@react-three/fiber';

// Dynamic import for LiquidGlassShader with ssr: false
const LiquidGlassShader = dynamic(() => import('./components/LiquidGlassShader'), { ssr: false });

export default function Home() {
  const [entered, setEntered] = useState(false);

  return (
    <AudioProvider>
      {/* Main container with min-h-screen to ensure it covers the whole page height and has position relative */}
      <div className="min-h-screen w-full bg-[linear-gradient(180deg,#05060a,#000)] text-white relative">
        
        {/* Three.js shader background overlay */}
        {/* Position absolute at top-0 left-0 to cover the whole viewport (parent div) */}
        {/* We use z-0 so it's behind everything else */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Suspense fallback={null}>
            {/* Canvas takes up the full width and height of its parent div (which is the full page height) */}
            <Canvas style={{ width: '100%', height: '100%' }} camera={{ position: [0, 0, 2], fov: 75 }}>
              <ambientLight intensity={0.6} />
              {/* Pass the entered state to the shader */}
              <LiquidGlassShader dissolve={entered ? 1 : 0} />
            </Canvas>
          </Suspense>
        </div>

        {/* Content Container - everything else should be positioned relative and have a higher z-index */}
        {/* z-10 makes sure all content is on top of the shader (z-0) */}
        <div className="relative z-10">
          {/* Landing Section */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Video background remains specific to the landing section */}
            {/* It sits on top of the shader but behind the text content */}
            <video src="/video/loop.mp4" className="absolute inset-0 w-full h-full object-cover autoPlay muted loop playsInline" />
            
            {/* Content within landing section has an even higher z-index to be above the video */}
            <div className="relative z-20 text-center">
              <h1 className="text-6xl font-black tracking-tight mb-6">PB&amp;J Sounds</h1>
              <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                Immersive audio-visual experience. Press ENTER to dissolve the glass and enter the experience.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button className="px-8 py-3 rounded-full bg-[#ff0051] text-white font-semibold shadow-lg" onClick={() => setEntered(true)}>
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
      </div>
    </AudioProvider>
  );
}
