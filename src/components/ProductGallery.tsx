import { FramedLightboxGallery } from "@/components/FramedLightboxGallery";
import type { Locale, Tables } from "@/lib/database.types";
import { storageUrl } from "@/lib/site";

type Props = {
  images: Tables<"media">[];
  locale: Locale;
  heading: string;
};

/**
 * Product gallery — the same framed grid + lightbox as the About gallery, fed
 * from media rows (locale-aware alt text resolved here).
 */
export function ProductGallery({ images, locale, heading }: Props) {
  return (
    <FramedLightboxGallery
      heading={heading}
      images={images.map((media) => ({
        src: storageUrl("media", media.storage_path),
        alt: (locale === "sq" ? media.alt_sq : media.alt_en) ?? "",
      }))}
    />
  );
}
