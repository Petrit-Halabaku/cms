"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { gsap, prefersReducedMotion, useGSAP } from "@/components/motion/gsap";
import { Reveal } from "@/components/motion/Reveal";
import { WindowFrame } from "@/components/pages/WindowFrame";

export type LightboxImage = { src: string; alt: string };

/**
 * Editorial framed-photo gallery + full-screen lightbox. Click a frame to open,
 * then step through with the on-screen arrows or the ←/→ keys (Escape closes,
 * navigation wraps, background scroll locks, a counter shows position). Shared
 * by the About, product and home-projects galleries so they look and behave
 * identically; callers resolve their images to { src, alt }.
 *
 * `variant`:
 *   "grid"     — static reveal-staggered grid (default).
 *   "carousel" — a GSAP-driven horizontal carousel with snap, eased prev/next
 *                navigation, an entrance stagger and gentle hover-pausing
 *                autoplay. Clicking a frame still opens the same lightbox.
 */
export function FramedLightboxGallery({
  images,
  heading,
  variant = "grid",
  priorityFirst = false,
}: {
  images: LightboxImage[];
  heading?: string;
  variant?: "grid" | "carousel";
  /** Eager-load the first frame — use when it is likely the LCP element. */
  priorityFirst?: boolean;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const updatePlayingRef = useRef<(() => void) | null>(null);
  const openIndexRef = useRef<number | null>(openIndex);
  openIndexRef.current = openIndex;

  // Reduced-motion users get the static grid instead of the moving carousel.
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

  // Lightbox keyboard + scroll lock.
  useEffect(() => {
    if (openIndex === null) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, step]);

  const useCarousel = variant === "carousel" && !reduced;

  // Seamless infinite marquee + drag-to-scroll. The track holds two identical
  // copies of the frames; a single `pos` (in px) is wrapped into one copy's
  // width, so any value renders seamlessly. A gsap.ticker advances `pos` for the
  // auto-glide; pointer dragging offsets it directly and the glide resumes from
  // wherever it's released. Hover, dragging and an open lightbox pause autoplay.
  useGSAP(
    () => {
      if (!useCarousel) return;
      const track = trackRef.current;
      if (!track) return;

      let shift = 0;
      let pos = 0;
      let hovering = false;
      let pressing = false;
      let dragging = false;
      let playing = false;
      let startX = 0;
      let startPos = 0;
      let draggedFar = false;
      let pointerId = -1;
      let wrap = gsap.utils.wrap(0, 1);
      const speed = 60; // px per second
      const DRAG_THRESHOLD = 6; // px before a press becomes a drag

      const apply = () => gsap.set(track, { x: wrap(pos) });
      const measure = () => {
        // First item of the second copy — its offset is one seamless loop width.
        const marker = track.children[images.length] as HTMLElement | undefined;
        shift = marker ? marker.offsetLeft : track.scrollWidth / 2;
        wrap = gsap.utils.wrap(-shift, 0);
        apply();
        updatePlaying();
      };
      function updatePlaying() {
        playing = !hovering && !dragging && openIndexRef.current === null && shift > 0;
      }
      updatePlayingRef.current = updatePlaying;

      const onTick = (_time: number, deltaMs: number) => {
        if (!playing) return;
        pos -= (speed * deltaMs) / 1000;
        apply();
      };

      const onEnter = () => ((hovering = true), updatePlaying());
      const onLeave = () => ((hovering = false), updatePlaying());
      const onDown = (e: PointerEvent) => {
        // Record the press but don't drag (or capture) yet — a press that never
        // moves stays a plain click so the frame's button opens the lightbox.
        pressing = true;
        dragging = false;
        draggedFar = false;
        startX = e.clientX;
        startPos = pos;
        pointerId = e.pointerId;
      };
      const onMove = (e: PointerEvent) => {
        if (!pressing) return;
        const delta = e.clientX - startX;
        if (!dragging) {
          if (Math.abs(delta) < DRAG_THRESHOLD) return;
          // Crossed the threshold: promote to a drag and capture the pointer.
          dragging = true;
          draggedFar = true;
          track.dataset.dragging = "true";
          track.setPointerCapture?.(pointerId);
          updatePlaying();
        }
        pos = startPos + delta;
        apply();
      };
      const onUp = () => {
        if (!pressing) return;
        pressing = false;
        if (dragging) {
          dragging = false;
          track.dataset.dragging = "false";
          track.releasePointerCapture?.(pointerId);
          updatePlaying();
        }
      };
      // Swallow the click that trails a real drag so it doesn't open the lightbox.
      // Plain clicks (no drag) pass straight through to the frame's button.
      const onClick = (e: MouseEvent) => {
        if (draggedFar) {
          e.stopPropagation();
          e.preventDefault();
          draggedFar = false;
        }
      };
      const onDragStart = (e: Event) => e.preventDefault();
      const onResize = () => measure();

      measure();
      gsap.ticker.add(onTick);
      track.addEventListener("pointerenter", onEnter);
      track.addEventListener("pointerleave", onLeave);
      track.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      track.addEventListener("click", onClick, true);
      track.addEventListener("dragstart", onDragStart);
      window.addEventListener("resize", onResize);

      return () => {
        gsap.ticker.remove(onTick);
        track.removeEventListener("pointerenter", onEnter);
        track.removeEventListener("pointerleave", onLeave);
        track.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        track.removeEventListener("click", onClick, true);
        track.removeEventListener("dragstart", onDragStart);
        window.removeEventListener("resize", onResize);
        updatePlayingRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [useCarousel, images.length] },
  );

  // Re-evaluate autoplay when the lightbox opens/closes.
  useEffect(() => {
    updatePlayingRef.current?.();
  }, [openIndex]);

  if (images.length === 0) return null;

  const frame = (image: LightboxImage, index: number, sizes: string, priority = false) => (
    <button
      type="button"
      onClick={() => setOpenIndex(index)}
      aria-label={`Open image ${index + 1} of ${images.length}`}
      className="block w-full cursor-zoom-in"
    >
      <WindowFrame index={index}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      </WindowFrame>
    </button>
  );

  const grid = (
    <Reveal stagger={0.08} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
      {images.map((image, index) => (
        <div key={image.src}>
          {frame(image, index, "(max-width: 768px) 50vw, 33vw", priorityFirst && index === 0)}
        </div>
      ))}
    </Reveal>
  );

  // Two copies so the marquee can wrap seamlessly. Each frame maps back to its
  // real index so clicks open the correct lightbox slide regardless of copy.
  const carousel = (
    <div className="relative mt-8 overflow-hidden">
      <ul
        ref={trackRef}
        className="flex w-max touch-pan-y gap-4 select-none lg:gap-5 cursor-grab [&_button]:!cursor-grab data-[dragging=true]:cursor-grabbing data-[dragging=true]:[&_button]:!cursor-grabbing"
      >
        {[...images, ...images].map((image, i) => {
          const realIndex = i % images.length;
          return (
            <li key={`${image.src}-${i}`} className="w-[78%] shrink-0 sm:w-[46%] lg:w-[30%]">
              {frame(
                image,
                realIndex,
                "(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 30vw",
                priorityFirst && i === 0,
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );

  const layout = useCarousel ? carousel : grid;

  return (
    <div ref={rootRef}>
      {heading ? (
        <section aria-label={heading}>
          <h2 className="flex items-center gap-3 font-display text-2xl text-slate-900 sm:text-3xl">
            <span aria-hidden className="block h-2.5 w-2.5 bg-brand-700" />
            {heading}
          </h2>
          {layout}
        </section>
      ) : (
        layout
      )}

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/95 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery"
          onClick={close}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              className="absolute left-3 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-6"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="relative h-[82vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[openIndex].src}
              alt={images[openIndex].alt}
              fill
              priority
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              className="absolute right-3 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-6"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {images.length > 1 && (
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-display text-sm tracking-[0.18em] text-white/70">
              {String(openIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
