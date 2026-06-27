"use client";

import { useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

import { HERO_INTRO_FLAG, HERO_MEDIA } from "@/lib/site";
import { gsap, prefersReducedMotion, useGSAP } from "./gsap";

/**
 * Hero window. A Navy "shutter" overlay carrying the white GERGOCI symbol covers
 * the panel; on first load it holds for 1s then swings open like a French window
 * (GSAP, hinged on the mullion) to reveal what's behind — the client's video when
 * one is configured (see HERO_MEDIA in site.ts), otherwise an animated window
 * elevation. The intro plays once per cache (localStorage flag) and is skipped
 * for prefers-reduced-motion. Keeps the existing mullion + light-sweep motif.
 */
export function HeroVisual({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useGSAP(
    () => {
      const reduce = prefersReducedMotion();
      let seen = false;
      try {
        seen = localStorage.getItem(HERO_INTRO_FLAG) === "1";
      } catch {
        /* private mode / blocked storage — treat as first load */
      }

      const playVideo = () => {
        const v = videoRef.current;
        if (!v) return;
        v.play().then(() => setPlaying(true)).catch(() => {
          /* autoplay may be refused — controls remain available */
        });
      };
      const openInstant = () => {
        gsap.set("[data-shutter-l]", { rotateY: -105, autoAlpha: 0 });
        gsap.set("[data-shutter-r]", { rotateY: 105, autoAlpha: 0 });
        gsap.set("[data-hero-logo]", { autoAlpha: 0 });
      };

      // Endless light sweep — only when the abstract glass art is the backdrop.
      if (!HERO_MEDIA.enabled && !reduce) {
        gsap.fromTo(
          "[data-light]",
          { xPercent: -120 },
          { xPercent: 120, duration: 7, ease: "power1.inOut", repeat: -1, repeatDelay: 2.5 },
        );
      }

      // Gentle parallax as the hero scrolls away.
      if (!reduce) {
        gsap.to(ref.current, {
          y: -40,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      }

      // Reduced motion: no animation, no autoplay — poster/static + controls.
      if (reduce) {
        openInstant();
        return;
      }
      // Already seen this session/cache: skip straight to the open, resting hero.
      if (seen) {
        openInstant();
        playVideo();
        return;
      }

      // First load — the window-opening intro.
      const tl = gsap.timeline({
        delay: 1,
        onComplete: () => {
          try {
            localStorage.setItem(HERO_INTRO_FLAG, "1");
          } catch {
            /* ignore */
          }
          playVideo();
        },
      });
      tl.to("[data-hero-logo]", { autoAlpha: 0, scale: 0.92, duration: 0.45, ease: "power2.in" })
        .to("[data-shutter-l]", { rotateY: -105, duration: 1.1, ease: "power3.inOut" }, "-=0.1")
        .to("[data-shutter-r]", { rotateY: 105, duration: 1.1, ease: "power3.inOut" }, "<")
        .to(["[data-shutter-l]", "[data-shutter-r]"], { autoAlpha: 0, duration: 0.3 }, "-=0.4");
    },
    { scope: ref },
  );

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Offset echo pane behind the frame */}
      <div aria-hidden className="absolute -top-5 -left-5 h-full w-full border border-brand-200 bg-brand-50" />

      <div
        className="relative aspect-3/4 w-full overflow-hidden border border-brand-900/70 bg-brand-950"
        style={{ perspective: "1200px" }}
      >
        {/* BEHIND THE GLASS: the configured video, or the animated window art */}
        <div className="absolute inset-0">
          {HERO_MEDIA.enabled ? (
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              poster={HERO_MEDIA.poster}
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="GERGOCI workshop"
            >
              {HERO_MEDIA.webm && <source src={HERO_MEDIA.webm} type="video/webm" />}
              {HERO_MEDIA.mp4 && <source src={HERO_MEDIA.mp4} type="video/mp4" />}
            </video>
          ) : (
            <HeroArt />
          )}
        </div>

        {/* Persistent window frame + mullions */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-30">
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-brand-900/40" />
          <span className="absolute top-1/3 left-0 h-px w-full bg-brand-900/25" />
          <span className="absolute top-2/3 left-0 h-px w-full bg-brand-900/25" />
        </div>

        {/* Navy shutter overlay — the white GERGOCI symbol over Navy, opens on first load */}
        <div aria-hidden className="absolute inset-0 z-20" style={{ transformStyle: "preserve-3d" }}>
          <div
            data-shutter-l
            className="absolute inset-y-0 left-0 w-1/2 origin-left bg-gradient-to-br from-brand-900 to-brand-950"
            style={{ backfaceVisibility: "hidden" }}
          />
          <div
            data-shutter-r
            className="absolute inset-y-0 right-0 w-1/2 origin-right bg-gradient-to-bl from-brand-900 to-brand-950"
            style={{ backfaceVisibility: "hidden" }}
          />
          <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-white/10" />
          <div
            data-hero-logo
            className="absolute inset-0 bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/brand/gergoci-symbol-white.webp)", backgroundSize: "40%" }}
          />
        </div>

        {/* Playback controls — only when a real video is configured */}
        {HERO_MEDIA.enabled && (
          <div className="absolute right-3 bottom-3 z-40 flex gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause video" : "Play video"}
              className="rounded-full bg-white/15 p-2 text-white backdrop-blur transition-colors hover:bg-white/30"
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute video" : "Mute video"}
              className="rounded-full bg-white/15 p-2 text-white backdrop-blur transition-colors hover:bg-white/30"
            >
              {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Abstract window elevation shown behind the glass when no video is configured. */
function HeroArt() {
  return (
    <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-white via-brand-50 to-brand-100">
      <div
        data-light
        className="absolute inset-y-0 -inset-x-1/3 bg-[linear-gradient(105deg,transparent_42%,rgba(255,255,255,0.7)_50%,transparent_58%)]"
      />
      <div className="absolute right-0 bottom-0 flex h-1/3 w-1/2 flex-col justify-end bg-brand-700 p-4">
        <p className="font-display text-[10px] tracking-[0.18em] text-white">PEJË, KOSOVË</p>
      </div>
    </div>
  );
}
