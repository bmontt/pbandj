import { AudioProvider } from "../components/AudioContextProvider";
import { Canvas } from "@react-three/fiber";
import LiquidGlassShader from "../components/LiquidGlassShader";
import DemoForm from "../components/DemoForm";
import ScrollSections from "../components/ScrollSections";

export default function HomePage() {
  return (
    <AudioProvider>
      <main className="relative w-full h-screen overflow-x-hidden">
        <Canvas className="fixed top-0 left-0 w-full h-full -z-10">
          <LiquidGlassShader />
        </Canvas>
        <ScrollSections />
        <section id="demos" className="min-h-screen bg-black text-white">
          <DemoForm />
        </section>
      </main>
    </AudioProvider>
  );
}
