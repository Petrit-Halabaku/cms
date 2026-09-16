"use client";

import { useCallback, useState } from "react";

import { ImageLightbox } from "@/components/ImageLightbox";
import { MediaImage } from "@/components/MediaImage";
import { WindowFrame } from "@/components/pages/WindowFrame";
import type { Locale, Tables } from "@/lib/database.types";
import { buildProductGalleryImages } from "@/lib/product-gallery-images";

export function ProductHeroGallery({
  featured,
  gallery,
  locale,
  galleryLabel,
}: {
  featured: Tables<"media">;
  gallery: Tables<"media">[];
  locale: Locale;
  galleryLabel: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const images = buildProductGalleryImages(featured, gallery, locale);
  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((index) =>
        index === null ? null : (index + delta + images.length) % images.length,
      ),
    [images.length],
  );

  return (
    <>
      <button
        type="button"
        className="block w-full cursor-zoom-in text-left"
        onClick={() => setOpenIndex(0)}
        aria-label={galleryLabel}
      >
        <WindowFrame aspect="landscape">
          <MediaImage
            media={featured}
            locale={locale}
            className="h-full w-full object-cover transition-transform duration-700 ease-expo group-hover:scale-[1.03]"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        </WindowFrame>
      </button>

      <ImageLightbox images={images} openIndex={openIndex} onClose={close} onStep={step} />
    </>
  );
}
