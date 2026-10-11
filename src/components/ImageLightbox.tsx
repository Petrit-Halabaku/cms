"use client";

import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type LightboxImage = { src: string; alt: string };

export function ImageLightbox({
  images,
  openIndex,
  onClose,
  onStep,
}: {
  images: LightboxImage[];
  openIndex: number | null;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  useEffect(() => {
    if (openIndex === null) return;

    document.documentElement.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onStep(-1);
      if (event.key === "ArrowRight") onStep(1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, onClose, onStep]);

  if (openIndex === null) return null;

  const image = images[openIndex];
  if (!image) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/95 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery"
      onClick={onClose}
    >
      <button
        type="button"
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          className="absolute left-3 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-6"
          onClick={(event) => {
            event.stopPropagation();
            onStep(-1);
          }}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      <div className="relative h-[82vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
        <Image
          src={image.src}
          alt={image.alt}
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
          onClick={(event) => {
            event.stopPropagation();
            onStep(1);
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
    </div>,
    document.body,
  );
}
