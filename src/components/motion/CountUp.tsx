"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "./gsap";

/**
 * Animates the numeric part of a stat like "1500+" or "25 yrs" from zero
 * when scrolled into view. Non-numeric prefix/suffix render untouched, and
 * SSR output is the final value so the stat is correct without JS.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(/([\d.,]*\d)/);

  useGSAP(
    () => {
      if (!match || prefersReducedMotion()) return;
      const target = Number(match[1].replace(/,/g, ""));
      if (!Number.isFinite(target)) return;
      const el = ref.current!.querySelector("[data-count]")!;
      const grouped = match[1].includes(",");
      const state = { n: 0 };
      gsap.to(state, {
        n: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
        onUpdate: () => {
          const n = Math.round(state.n);
          el.textContent = grouped ? n.toLocaleString("en-US") : String(n);
        },
      });
    },
    { scope: ref },
  );

  if (!match || match.index === undefined) {
    return <span className={className}>{value}</span>;
  }

  const prefix = value.slice(0, match.index);
  const suffix = value.slice(match.index + match[1].length);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <span data-count>{match[1]}</span>
      {suffix}
    </span>
  );
}
