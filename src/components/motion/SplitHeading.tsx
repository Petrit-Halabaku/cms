"use client";

import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "./gsap";

type Props = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  /** Style the last word in the italic serif accent. */
  accentLast?: boolean;
  /** Animate when scrolled into view (default) instead of on mount. */
  onScroll?: boolean;
};

/**
 * Heading whose words rise out of overflow masks. SSR renders the plain
 * words (SEO-safe, visible without JS); GSAP only animates after mount.
 * The mask spans carry a padding/negative-margin pair so descenders are
 * not clipped, and the inter-word space lives OUTSIDE the masks so it
 * survives inline-block whitespace collapsing.
 */
export function SplitHeading({
  text,
  as: Tag = "h2",
  className = "",
  delay = 0,
  accentLast = false,
  onScroll = true,
}: Props) {
  const ref = useRef<HTMLHeadingElement & HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current!.querySelectorAll("[data-word]"),
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.07,
          delay,
          ...(onScroll
            ? { scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } }
            : {}),
        },
      );
    },
    { scope: ref },
  );

  const words = text.split(/\s+/).filter(Boolean);

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => {
        const accent = accentLast && i === words.length - 1;
        return (
          <span key={`${word}-${i}`}>
            <span className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-top">
              <span
                data-word
                className={`inline-block will-change-transform ${
                  accent ? "font-serif font-normal italic tracking-normal" : ""
                }`}
              >
                {word}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        );
      })}
    </Tag>
  );
}
