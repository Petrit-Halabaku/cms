"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "./gsap";

/**
 * Abstract window elevation: a hairline frame whose mullions draw in on
 * load, a slow shaft of light sweeping across the glass, and a solid blue
 * pane carrying the workshop's coordinates. Gentle parallax on scroll.
 */
export function HeroVisual({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from("[data-frame]", { autoAlpha: 0, y: 40, duration: 1, delay: 0.2 })
        .from(
          "[data-mullion-v]",
          { scaleY: 0, transformOrigin: "top", duration: 0.9, stagger: 0.12 },
          "-=0.5",
        )
        .from(
          "[data-mullion-h]",
          { scaleX: 0, transformOrigin: "left", duration: 0.9, stagger: 0.12 },
          "<0.1",
        )
        .from("[data-pane]", { autoAlpha: 0, duration: 0.8 }, "-=0.4")
        .from("[data-chip]", { autoAlpha: 0, y: 16, duration: 0.7 }, "-=0.3");

      // Endless slow light sweep across the glass.
      gsap.fromTo(
        "[data-light]",
        { xPercent: -120 },
        { xPercent: 120, duration: 7, ease: "power1.inOut", repeat: -1, repeatDelay: 2.5 },
      );

      // Parallax drift as the hero scrolls away.
      gsap.to(ref.current, {
        y: -48,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`relative ${className}`} aria-hidden>
      {/* Offset echo pane behind the frame */}
      <div className="absolute -top-5 -left-5 h-full w-full border border-brand-200 bg-brand-50" />

      <div
        data-frame
        className="relative aspect-3/4 w-full overflow-hidden border border-brand-900/70 bg-gradient-to-br from-white via-brand-50 to-brand-100"
      >
        {/* Light sweep */}
        <div
          data-light
          className="absolute inset-y-0 -inset-x-1/3 bg-[linear-gradient(105deg,transparent_42%,rgba(255,255,255,0.7)_50%,transparent_58%)]"
        />

        {/* Mullions */}
        <span data-mullion-v className="absolute left-1/2 top-0 h-full w-px bg-brand-900/70" />
        <span data-mullion-h className="absolute left-0 top-1/3 h-px w-full bg-brand-900/70" />
        <span data-mullion-h className="absolute left-0 top-2/3 h-px w-full bg-brand-900/70" />

        {/* Solid blue pane, bottom-right */}
        <div
          data-pane
          className="absolute bottom-0 right-0 flex h-1/3 w-1/2 flex-col justify-end bg-brand-700 p-4"
        >
          <p className="font-display text-[10px] tracking-[0.18em] text-brand-100">
            42.65° N — 20.29° E
          </p>
          <p className="font-display text-[10px] tracking-[0.18em] text-white">PEJË, KOSOVË</p>
        </div>
      </div>

      {/* Floating spec chip */}
      <div
        data-chip
        className="absolute -bottom-6 left-6 border border-line bg-white px-5 py-4 shadow-[0_24px_48px_-24px_rgba(23,43,102,0.35)]"
      >
        <p className="kicker">PVC · ALU · GLASS</p>
      </div>
    </div>
  );
}
