"use client";

// ── smooth scroll ─────────────────────────────────────────────────────────────
// Lenis, as on brodymontag.com: wheel scrolling glides (damped, lerp 0.12)
// instead of stepping per tick. GSAP's ticker drives Lenis and every Lenis
// scroll updates ScrollTrigger, so there is one clock for scroll and for every
// scroll-driven motion. Touch keeps native momentum (no syncTouch). Off under
// reduced motion and with ?lenis=0 (A/B).
//
// Wheel steps scale with the window's height (REF_H px = 1×), so a notch moves
// the same share of a screen on a phone, a laptop or a 4K monitor; line-mode
// wheels (Firefox) are brought to the 100 px/notch pixel-mode wheels report.

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
// mobile toolbars collapsing mid-scroll must not re-measure every trigger
ScrollTrigger.config({ ignoreMobileResize: true });

const REF_H = 800;
const LINE_TO_NOTCH = 2;

export default function SmoothScroll() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("lenis") === "0") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      autoRaf: false,
      anchors: true,
      lerp: 0.12,
      virtualScroll: (data) => {
        const e = data.event;
        if (e.type !== "wheel") return true;
        const k = ((e as WheelEvent).deltaMode === 1 ? LINE_TO_NOTCH : 1) * Math.min(Math.max(window.innerHeight / REF_H, 0.75), 1.6);
        data.deltaX *= k;
        data.deltaY *= k;
        return true;
      },
    });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.dataset.lenis = "on";
    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      delete document.documentElement.dataset.lenis;
    };
  }, []);
  return null;
}
