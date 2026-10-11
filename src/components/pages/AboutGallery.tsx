import { FramedLightboxGallery } from "@/components/FramedLightboxGallery";
import { storageUrl } from "@/lib/site";

type GalleryImage = { path: string; alt: string };

/**
 * About-page gallery: storage-path images shown in the shared framed lightbox
 * (same grid + lightbox as the product gallery).
 */
export function AboutGallery({ images }: { images: GalleryImage[] }) {
  return (
    <FramedLightboxGallery
      images={images.map((image) => ({ src: storageUrl("media", image.path), alt: image.alt }))}
    />
  );
}
