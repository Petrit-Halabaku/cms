/** Site-wide constants. Content (phone, address, hours) lives in the DB. */
export const SITE_NAME = "Gergoci";
export const SITE_URL = "https://gergoci.eu";

/** Map pin coordinates from env — override CMS-stored lat/lng on the public site. */
export const MAP_LAT = parseFloat(process.env.NEXT_PUBLIC_MAP_LAT!);
export const MAP_LNG = parseFloat(process.env.NEXT_PUBLIC_MAP_LNG!);

/** Google Business Profile CID — ties the link to the named listing (not an anonymous pin). */
export const MAPS_CID = process.env.NEXT_PUBLIC_MAPS_CID ?? "8132120818804921462";

/** Google Maps link centered on env coords and opening the GERGOCI business profile. */
export function mapsPlaceUrl(lat = MAP_LAT, lng = MAP_LNG): string {
  return `https://www.google.com/maps?ll=${lat},${lng}&z=19&cid=${MAPS_CID}`;
}

/** Coordinate embed for the contact-page map iframe (no API key). */
export function mapsEmbedUrl(lat = MAP_LAT, lng = MAP_LNG): string {
  return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
}

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

/** Folder (within the `media` bucket) where the admin-uploaded homepage hero lives. */
export const HERO_MEDIA_FOLDER = "homepage";

/**
 * Stable product-category UUID → locale-independent key. Lets locale-independent
 * references (e.g. homepage feature-card `key`s) resolve to the localized category
 * slug via `getCategories()`. Only the categories referenced by the homepage cards
 * need entries here.
 */
export const CATEGORY_KEY_BY_ID: Record<string, string> = {
  "a0000000-0000-4000-8000-000000000001": "windows",
  "a0000000-0000-4000-8000-000000000002": "doors",
  "a0000000-0000-4000-8000-000000000003": "sliding-systems",
  "a0000000-0000-4000-8000-000000000004": "aluminium",
  "a0000000-0000-4000-8000-000000000005": "glass",
  "a0000000-0000-4000-8000-000000000006": "blinds",
  "a0000000-0000-4000-8000-000000000007": "roller-shutters",
};

/** Reverse of {@link CATEGORY_KEY_BY_ID} — legacy card `key` → category UUID. */
export const CATEGORY_ID_BY_KEY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_KEY_BY_ID).map(([id, key]) => [key, id]),
);

/** True when a storage path points at a video the hero should render with `<video>`. */
export function isVideoPath(path: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(path);
}

/**
 * Storage path (in the `media` bucket) of the CMS-managed site logo. The admin
 * Branding page replaces this exact object in place; every consumer (header,
 * footer, JSON-LD) reads it through `getLogoUrl()`, which appends a
 * cache-busting token so the swap is picked up despite the long cache lifetime.
 */
export const LOGO_PATH = "icons/gergoci-symbol-color.webp";

/** White GERGOCI symbol on the hero shutter overlay (`media` bucket). */
export const HERO_SYMBOL_PATH = "icons/gergoci-symbol-white.webp";

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
