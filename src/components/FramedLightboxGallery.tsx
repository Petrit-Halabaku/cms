"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { WindowFrame } from "@/components/pages/WindowFrame";

export type LightboxImage = { src: string; alt: string };

/**
 * Editorial framed-photo grid + full-screen lightbox. Click a frame to open,
 * then step through with the on-screen arrows or the ←/→ keys (Escape closes,
 * navigation wraps, background scroll locks, a counter shows position). Shared
 * by the About and product galleries so both look and behave identically;
 * callers resolve their images to { src, alt }. When `heading` is given the grid
 * is wrapped in a labelled section with a title.
 */
export function FramedLightboxGallery({
  images,
  heading,
}: {
  images: LightboxImage[];
  heading?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

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

  if (images.length === 0) return null;

  const grid = (
    <Reveal stagger={0.08} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
      {images.map((image, index) => (
        <button
          key={image.src}
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
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
          </WindowFrame>
        </button>
      ))}
    </Reveal>
  );

  return (
    <>
      {heading ? (
        <section aria-label={heading}>
          <h2 className="flex items-center gap-3 font-display text-2xl text-slate-900 sm:text-3xl">
            <span aria-hidden className="block h-2.5 w-2.5 bg-brand-700" />
            {heading}
          </h2>
          {grid}
        </section>
      ) : (
        grid
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
    </>
  );
}
