/** Site-wide constants. Content (phone, address, hours) lives in the DB. */
export const SITE_NAME = "Gergoci";
export const SITE_URL = "https://gergoci.eu";

/**
 * Top-level route slugs per locale — mirrors page_translations seed data.
 * Phase 2 reads these from the DB for dynamic locale routing.
 */
export const ROUTE_SLUGS = {
  en: {
    about: "about",
    services: "services",
    products: "products",
    contact: "contact",
  },
  sq: {
    about: "rreth-nesh",
    services: "sherbimet",
    products: "produktet",
    contact: "kontakti",
  },
} as const;

/** Public URL for a file in Supabase Storage. */
export function storageUrl(bucket: "media" | "brochures", path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Homepage hero video — swappable single source of truth.
 *
 * The client's professional video isn't delivered yet, so `enabled` is false and
 * the hero reveals the animated window graphic instead. To go live with the real
 * video, drop the encoded files in `public/hero/` and flip `enabled` to true:
 *   public/hero/hero.mp4    — H.264/MP4, compressed (~1080p, a few MB)
 *   public/hero/hero.webm   — optional VP9/WebM (smaller; served first)
 *   public/hero/poster.jpg  — still frame shown before play (becomes the LCP)
 * The mp4/webm/poster values may also point at Supabase storage URLs instead.
 */
export const HERO_MEDIA = {
  enabled: false,
  webm: "/hero/hero.webm",
  mp4: "/hero/hero.mp4",
  poster: "/hero/poster.jpg",
} as const;

/** localStorage key gating the once-per-cache hero intro. Bump to force replay. */
export const HERO_INTRO_FLAG = "gergoci_hero_intro_v1";
