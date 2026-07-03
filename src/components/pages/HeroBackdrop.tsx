"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, prefersReducedMotion, useGSAP } from "@/components/motion/gsap";
import { storageUrl } from "@/lib/site";

/**
 * Full-bleed hero background: an image or looping video, a navy gradient scrim,
 * and the three "mullion" sightlines. Client-side so GSAP can drive a slow
 * Ken-Burns drift on the media and draw the sightlines in on load. All motion
 * no-ops under prefers-reduced-motion (the SSR output is the resting state).
 */
export function HeroBackdrop({
  mediaType = "image",
  path,
  alt = "",
}: {
  mediaType?: "image" | "video";
  /** Storage path in the `media` bucket. Empty → solid navy fallback. */
  path?: string;
  alt?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const root = ref.current!;
      const media = root.querySelector<HTMLElement>("[data-hero-media]");
      if (media) {
        gsap
          .timeline()
          .fromTo(
            media,
            { scale: 1.14, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 1.8, ease: "power3.out" },
          )
          .to(media, {
            scale: 1.06,
            duration: 14,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
      }
      gsap.fromTo(
        root.querySelectorAll("[data-sightline]"),
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top",
          duration: 1.2,
          ease: "power2.out",
          stagger: 0.12,
          delay: 0.2,
        },
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="absolute inset-0">
      {path && mediaType === "video" ? (
        <video
          data-hero-media
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover object-top"
        >
          <source src={storageUrl("media", path)} />
        </video>
      ) : path ? (
        <div data-hero-media className="absolute inset-0">
          <Image
            src={storageUrl("media", path)}
            alt={alt}
            fill
            quality={75}
            priority
            loading="eager"
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>
      ) : null}

      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-brand-950 via-brand-950/50 to-brand-950/20"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span data-sightline className="absolute top-0 left-1/4 h-full w-px bg-white/8" />
        <span data-sightline className="absolute top-0 left-2/4 h-full w-px bg-white/8" />
        <span data-sightline className="absolute top-0 left-3/4 h-full w-px bg-white/8" />
      </div>
    </div>
  );
}
