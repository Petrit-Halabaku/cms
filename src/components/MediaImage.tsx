import Image from "next/image";

import type { Locale, Tables } from "@/lib/database.types";
import { storageUrl } from "@/lib/site";

type Props = {
  media: Tables<"media">;
  locale: Locale;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * next/image for a media row in Supabase Storage. Uses stored width/height
 * when available, otherwise renders in fill mode (parent must be relative
 * with an explicit aspect/size).
 */
export function MediaImage({ media, locale, className, sizes, priority }: Props) {
  const src = storageUrl("media", media.storage_path);
  const alt = (locale === "sq" ? media.alt_sq : media.alt_en) ?? "";

  if (media.width && media.height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={media.width}
        height={media.height}
        className={className}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image src={src} alt={alt} fill className={className} sizes={sizes} priority={priority} />
  );
}
