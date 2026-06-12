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
    getQuote: "get-quote",
  },
  sq: {
    about: "rreth-nesh",
    services: "sherbimet",
    products: "produktet",
    contact: "kontakti",
    getQuote: "kerko-oferte",
  },
} as const;

/** Public URL for a file in Supabase Storage. */
export function storageUrl(bucket: "media" | "brochures", path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
