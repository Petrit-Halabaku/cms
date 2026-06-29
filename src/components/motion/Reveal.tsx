"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "./gsap";

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Initial vertical offset in px. */
  y?: number;
  delay?: number;
  /** When > 0, direct children animate in sequence instead of the wrapper. */
  stagger?: number;
};

/**
 * Fade-and-rise on scroll. SSR output is fully visible — GSAP hides and
 * animates only after hydration, so content is never lost without JS.
 */
export function Reveal({ children, className, y = 32, delay = 0, stagger = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const el = ref.current!;
      const targets = stagger > 0 && el.children.length > 0 ? Array.from(el.children) : el;
      gsap.from(targets, {
        autoAlpha: 0,
        y,
        duration: 0.9,
        ease: "power3.out",
        stagger,
        delay,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
