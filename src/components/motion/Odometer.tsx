"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "./gsap";

/** Full 0–9 cycles each digit strip rolls through before settling. */
const ROLLS = 2;

/**
 * Mechanical odometer. Each digit sits in a clipped slot and a 0–9 strip rolls
 * up to land on its value when scrolled into view, fading at the slot edges as
 * if turning behind glass. SSR renders the settled number (the strip is
 * pre-translated to the final digit) so it is correct with no JS and when the
 * user prefers reduced motion.
 */
export function Odometer({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const digits = String(Math.trunc(Math.abs(value))).split("");

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const cols = gsap.utils.toArray<HTMLElement>("[data-col]", ref.current!);

      gsap.fromTo(
        cols,
        { y: "0em", immediateRender: false },
        {
          y: (_, el) => `-${(el as HTMLElement).dataset.target}em`,
          duration: 1.6,
          ease: "power4.out",
          stagger: 0.14,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
            once: true,
          },
        },
      );
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={`inline-flex items-baseline leading-none ${className ?? ""}`}>
      {digits.map((d, i) => {
        const target = ROLLS * 10 + Number(d);
        return (
          <span
            key={`${i}-${d}`}
            aria-hidden
            className="relative inline-block h-[1em] w-[1ch] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,#000_22%,#000_78%,transparent)]"
          >
            <span
              data-col
              data-target={String(target)}
              className="absolute inset-x-0 top-0 flex flex-col tabular-nums leading-none"
              style={{ transform: `translateY(-${target}em)` }}
            >
              {Array.from({ length: (ROLLS + 1) * 10 }).map((_, n) => (
                <span key={n} className="flex h-[1em] items-center justify-center">
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
      {suffix && (
        <span aria-hidden className="ml-[0.02em]">
          {suffix}
        </span>
      )}
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}
