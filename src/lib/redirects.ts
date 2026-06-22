/**
 * Legacy WordPress URL → new URL mapping (301s, applied in proxy.ts).
 * Product→category lookup mirrors the seed data; new products never get
 * legacy /project/ URLs, so a static map is correct here.
 */

/** Exact-path redirects. */
export const WP_EXACT_REDIRECTS: Record<string, string> = {
  "/about-us": "/about",
  "/about-us/contact-us": "/contact",
  "/service": "/services",
  "/single-shop": "/products",
};

/** Old /project/{slug} → category slug, from seed data. */
export const WP_PRODUCT_CATEGORY: Record<string, string> = {
  // windows
  "bluevolution-73": "windows",
  "bluevolution-82": "windows",
  "bluevolution-92": "windows",
  "greenevolution-box": "windows",
  "self-locking-drive-gear": "windows",
  "multi-secuair-secured-ventilation-position": "windows",
  // doors
  "doorsystem-bluevolution-82": "doors",
  "doorsystem-bluevolution-92": "doors",
  "a-ts-self-locking-door-lock": "doors",
  "z-tf": "doors",
  // sliding systems
  "evolutiondrive-hst": "sliding-systems",
  // aluminium
  "smartia-m6": "aluminium",
  "smartia-m11000": "aluminium",
  "smartia-s67": "aluminium",
  "supreme-s77": "aluminium",
  // glass
  "climaguard-premium2": "glass",
  "climaguard-solar": "glass",
  extraclear: "glass",
  "laminated-glass": "glass",
  // blinds
  mecoclassic: "blinds",
  // roller shutters
  "built-in-roller-shutters": "roller-shutters",
};

/**
 * EN→SQ segment map for ?lang=sq redirects (pages + categories from seed).
 * Unknown segments pass through unchanged — most product slugs are identical
 * in both locales.
 */
export const EN_TO_SQ_SEGMENT: Record<string, string> = {
  about: "rreth-nesh",
  services: "sherbimet",
  products: "produktet",
  contact: "kontakti",
  windows: "dritare",
  doors: "dyer",
  "sliding-systems": "sisteme-rreshqitese",
  aluminium: "alumin",
  glass: "xhama",
  blinds: "perde",
  "roller-shutters": "roleta",
};

/** Resolve a legacy WordPress path to its new EN path, or null if not legacy. */
export function resolveWpRedirect(pathname: string): string | null {
  const exact = WP_EXACT_REDIRECTS[pathname];
  if (exact) return exact;

  const categoryMatch = pathname.match(/^\/project-category\/([a-z0-9-]+)\/?$/);
  if (categoryMatch) return `/products/${categoryMatch[1]}`;

  const productMatch = pathname.match(/^\/project\/([a-z0-9-]+)\/?$/);
  if (productMatch) {
    const category = WP_PRODUCT_CATEGORY[productMatch[1]];
    return category ? `/products/${category}/${productMatch[1]}` : "/products";
  }

  return null;
}

/** Translate an EN path to its /sq equivalent, segment by segment. */
export function toSqPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const mapped = segments.map((segment) => EN_TO_SQ_SEGMENT[segment] ?? segment);
  return mapped.length > 0 ? `/sq/${mapped.join("/")}` : "/sq";
}
