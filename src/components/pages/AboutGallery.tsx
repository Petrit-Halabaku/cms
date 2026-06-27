"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { FramedPhoto } from "@/components/pages/editorial";
import { Reveal } from "@/components/motion/Reveal";
import { storageUrl } from "@/lib/site";

type GalleryImage = { path: string; alt: string };

/**
 * Editorial framed-photo grid with the same full-screen lightbox as the product
 * gallery — click a frame to open, then step through with the on-screen arrows
 * or the ←/→ keys (Escape closes, navigation wraps). Sourced from Storage paths
 * rather than media rows, so it takes plain { path, alt } images.
 */
export function AboutGallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

  // Lock background scroll + wire keyboard navigation while the lightbox is open.
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

  return (
    <>
      <Reveal stagger={0.08} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:gap-5">
        {images.map((image, index) => (
          <button
            key={image.path}
            type="button"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open image ${index + 1} of ${images.length}`}
            className="block w-full cursor-zoom-in"
          >
            <FramedPhoto image={image} index={index} />
          </button>
        ))}
      </Reveal>

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
              src={storageUrl("media", images[openIndex].path)}
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
