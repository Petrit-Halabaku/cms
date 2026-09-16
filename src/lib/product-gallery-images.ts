import type { Locale } from "./database.types.ts";
import { storageUrl } from "./site.ts";

type ProductImage = {
  storage_path: string;
  alt_en: string | null;
  alt_sq: string | null;
};

export function buildProductGalleryImages(
  featured: ProductImage,
  gallery: ProductImage[],
  locale: Locale,
  toSrc: (path: string) => string = (path) => storageUrl("media", path),
) {
  return [featured, ...gallery].map((media) => ({
    src: toSrc(media.storage_path),
    alt: (locale === "sq" ? media.alt_sq : media.alt_en) ?? "",
  }));
}
