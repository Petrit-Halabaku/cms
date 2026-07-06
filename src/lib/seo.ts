import type { Metadata } from "next";

import type { Locale } from "@/lib/database.types";
import { alternatesFor, localePath } from "@/lib/i18n/urls";
import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Central SEO helpers: metadata builders + schema.org structured-data builders.
 * Page `generateMetadata` functions call {@link buildPageMetadata}; server
 * components render the schema builders through `<JsonLd>`.
 */

/** Open Graph BCP-47-ish locale codes per app locale (og:locale expects xx_XX). */
export const OG_LOCALE: Record<Locale, string> = { en: "en_US", sq: "sq_AL" };

/**
 * Social profile URLs for schema.org `sameAs`. Wire via env (comma-separated),
 * e.g. NEXT_PUBLIC_SOCIAL_LINKS="https://facebook.com/…,https://instagram.com/…".
 * Empty until set — nothing is fabricated.
 */
export const SOCIAL_LINKS: string[] = (process.env.NEXT_PUBLIC_SOCIAL_LINKS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Google Search Console verification token (server env). Empty ⇒ tag omitted. */
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION || undefined;

/** X/Twitter handle for twitter:site + twitter:creator (e.g. "@gergoci"). */
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || undefined;

/** Localized one-line brand tagline — default description / share subtitle. */
export const TAGLINE: Record<Locale, string> = {
  en: `${SITE_NAME} — windows, doors & glass systems in Pejë, Kosovo.`,
  sq: `${SITE_NAME} — dritare, dyer & sisteme xhami në Pejë, Kosovë.`,
};

/** Locale-appropriate SEO keywords. */
export const KEYWORDS: Record<Locale, string[]> = {
  en: ["windows", "doors", "glass systems", "aluminium", "PVC", "facades", "Pejë", "Kosovo", SITE_NAME],
  sq: ["dritare", "dyer", "sisteme xhami", "alumin", "PVC", "fasada", "Pejë", "Kosovë", SITE_NAME],
};

/** Standard 1.91:1 Open Graph card dimensions. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Absolute URL of the generated branded OG card for a title (+ optional subtitle). */
export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ t: title });
  if (subtitle) params.set("s", subtitle);
  return `${SITE_URL}/api/og?${params.toString()}`;
}

export type OgImage = { url: string; width?: number; height?: number; alt?: string };

/** Absolute canonical URL for a locale + its localized path segments. */
export function absoluteUrl(locale: Locale, enSegments: string[], sqSegments: string[]): string {
  const segs = locale === "sq" ? sqSegments : enSegments;
  return `${SITE_URL}${localePath(locale, segs)}`;
}

/**
 * Builds a complete page Metadata block — title, description, canonical +
 * hreflang alternates, Open Graph, and Twitter card — from CMS fields.
 *
 * `images` defaults to a generated branded card; pass real photos for
 * product/category pages (hybrid strategy). Set `absoluteTitle` on the home
 * page so the parent `%s — Gergoci` template isn't appended.
 */
export function buildPageMetadata(opts: {
  locale: Locale;
  title: string;
  description?: string | null;
  enSegments: string[];
  sqSegments: string[];
  images?: OgImage[];
  type?: "website" | "article";
  absoluteTitle?: boolean;
}): Metadata {
  const { locale, title, enSegments, sqSegments, type = "website", absoluteTitle } = opts;
  const description = opts.description?.trim() || TAGLINE[locale];
  const url = absoluteUrl(locale, enSegments, sqSegments);
  const images: OgImage[] =
    opts.images ?? [{ url: ogImageUrl(title, description), ...OG_SIZE, alt: title }];

  // Skip the parent `%s — Gergoci` template when the title is already branded
  // (home, or a CMS seoTitle that includes the brand) to avoid doubling it.
  const alreadyBranded = title.toLowerCase().includes(SITE_NAME.toLowerCase());

  return {
    title: absoluteTitle || alreadyBranded ? { absolute: title } : title,
    description,
    alternates: alternatesFor(locale, enSegments, sqSegments),
    openGraph: {
      type,
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "sq" ? "en" : "sq"],
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((i) => i.url),
    },
  };
}

/* --------------------------- structured data --------------------------- */

type Schema = Record<string, unknown>;

/** schema.org Organization — the publishing entity, referenced by @id elsewhere. */
export function organizationSchema(logoUrl: string): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: logoUrl,
    ...(SOCIAL_LINKS.length > 0 && { sameAs: SOCIAL_LINKS }),
  };
}

/** schema.org WebSite — enables sitelinks / name in SERP; ties to the Organization. */
export function websiteSchema(locale: Locale): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** schema.org LocalBusiness — NAP + geo for local SEO / Google Business. */
export function localBusinessSchema(opts: {
  logoUrl: string;
  phone?: string;
  email?: string;
  address?: string;
  lat?: number;
  lng?: number;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: opts.logoUrl,
    image: opts.logoUrl,
    telephone: opts.phone || undefined,
    email: opts.email || undefined,
    areaServed: "Kosovo",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pejë",
      addressCountry: "XK",
      streetAddress: opts.address || undefined,
    },
    geo: { "@type": "GeoCoordinates", latitude: opts.lat, longitude: opts.lng },
    ...(SOCIAL_LINKS.length > 0 && { sameAs: SOCIAL_LINKS }),
  };
}

/** schema.org BreadcrumbList from an ordered list of {name, url} crumbs. */
export function breadcrumbSchema(items: { name: string; url: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** schema.org Product for a product detail page. */
export function productSchema(opts: {
  name: string;
  description?: string;
  category?: string;
  url: string;
  images?: string[];
  brand?: string | null;
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${opts.url}#product`,
    name: opts.name,
    ...(opts.description && { description: opts.description }),
    ...(opts.category && { category: opts.category }),
    url: opts.url,
    ...(opts.images?.length && { image: opts.images }),
    ...(opts.brand && { brand: { "@type": "Brand", name: opts.brand } }),
  };
}

/** schema.org CollectionPage wrapping an ItemList of products (category page). */
export function collectionSchema(opts: {
  url: string;
  name: string;
  description?: string | null;
  items: { name: string; url: string; image?: string }[];
}): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${opts.url}#collection`,
    url: opts.url,
    name: opts.name,
    ...(opts.description && { description: opts.description }),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: opts.items.length,
      itemListElement: opts.items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: it.url,
        name: it.name,
        ...(it.image && { image: it.image }),
      })),
    },
  };
}

/** schema.org FAQPage from a list of question/answer pairs. */
export function faqPageSchema(faqs: { question: string; answer: string }[]): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
