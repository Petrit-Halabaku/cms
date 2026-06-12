import type { Metadata } from "next";

import type { Locale } from "@/lib/database.types";

/** Absolute-path URL for a route in a locale. EN lives at root, SQ under /sq. */
export function localePath(locale: Locale, segments: string[] = []): string {
  const path = segments.filter(Boolean).join("/");
  if (locale === "sq") return path ? `/sq/${path}` : "/sq";
  return path ? `/${path}` : "/";
}

/** Locale-prefixed base path for links: "" for en, "/sq" for sq. */
export function basePathFor(locale: Locale): string {
  return locale === "sq" ? "/sq" : "";
}

/**
 * canonical + hreflang alternates for a page available in both locales.
 * x-default points at the English version.
 */
export function alternatesFor(
  locale: Locale,
  enSegments: string[],
  sqSegments: string[],
): NonNullable<Metadata["alternates"]> {
  const en = localePath("en", enSegments);
  const sq = localePath("sq", sqSegments);
  return {
    canonical: locale === "sq" ? sq : en,
    languages: { en, sq, "x-default": en },
  };
}
