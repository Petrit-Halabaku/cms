"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { MediaImage } from "@/components/MediaImage";
import type { Locale, Tables } from "@/lib/database.types";

type Props = {
  images: Tables<"media">[];
  locale: Locale;
  heading: string;
};

/** Thumbnail grid + full-screen lightbox with keyboard navigation. */
export function ProductGallery({ images, locale, heading }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) => (i === null ? null : (i + delta + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, step]);

  if (images.length === 0) return null;

  return (
    <section aria-label={heading}>
      <h2 className="flex items-center gap-3 font-display text-2xl text-slate-900">
        <span aria-hidden className="block h-2.5 w-2.5 bg-brand-700" />
        {heading}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((media, index) => (
          <button
            key={media.id}
            type="button"
            className="group relative aspect-square overflow-hidden border border-line bg-brand-50"
            onClick={() => setOpenIndex(index)}
          >
            <MediaImage
              media={media}
              locale={locale}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {images.length > 1 && (
            <button
              type="button"
              className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <MediaImage
              media={images[openIndex]}
              locale={locale}
              className="mx-auto h-full w-full rounded-lg object-contain"
              sizes="100vw"
              priority
            />
          </div>
          {images.length > 1 && (
            <button
              type="button"
              className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
