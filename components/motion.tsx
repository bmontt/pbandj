"use client";

// ── motion ────────────────────────────────────────────────────────────────────
// Every scroll-driven change on the page, in one place. GSAP ScrollTrigger is
// the only scroll writer (Lenis feeds it, components/smooth-scroll.tsx); all
// of it is calm, damped and one-shot:
//   - [data-reveal] blocks below the fold rise in once as they arrive
//     (batched, so a list arrives as one gentle stagger, however fast you
//     scroll). Anything already on screen is left alone; the CSS .enter
//     entrances own the first screen.
//   - .rule-line labels draw the founders' three-color hairline once.
//   - [data-drift] display words lift a little as their opener scrolls away
//     (scrubbed with damping, capped at 10% of their height).
// Reduced motion registers nothing: every element keeps its rendered state,
// and the start states are only ever set here, never in CSS, so no-JS and
// reduced-motion readers always see all text.

import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Motion() {
  const path = usePathname();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const html = document.documentElement;
        const fold = window.innerHeight * 0.9;

        const rules = gsap.utils.toArray<HTMLElement>(".rule-line");
        for (const el of rules) {
          if (el.getBoundingClientRect().top < fold) el.classList.add("rule-on");
          else ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => el.classList.add("rule-on") });
        }
        html.dataset.motion = "on";

        const below = gsap.utils.toArray<HTMLElement>("[data-reveal]").filter((el) => el.getBoundingClientRect().top > fold);
        if (below.length) {
          gsap.set(below, { autoAlpha: 0, y: 28 });
          ScrollTrigger.batch(below, {
            start: "top 94%",
            once: true,
            onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, overwrite: true }),
          });
        }

        for (const el of gsap.utils.toArray<HTMLElement>("[data-drift]")) {
          const scope = el.closest("header") ?? el;
          gsap.to(el, { yPercent: -10, ease: "none", scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: 0.8 } });
        }

        return () => {
          for (const el of rules) el.classList.remove("rule-on");
          delete html.dataset.motion;
        };
      });
      // the page's images and fonts can still move things after setup
      const refresh = () => ScrollTrigger.refresh();
      document.fonts?.ready.then(refresh);
      return () => mm.revert();
    },
    { dependencies: [path], revertOnUpdate: true },
  );

  return null;
}
