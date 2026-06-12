"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Locale } from "@/lib/database.types";
import type { SlugPair } from "@/lib/db/content";

type Props = {
  locale: Locale;
  /** EN↔SQ slug pairs for pages, categories and products. */
  slugPairs: SlugPair[];
  className?: string;
};

/**
 * Links to the translated equivalent of the CURRENT page by mapping each
 * path segment through the slug pairs (unknown segments pass through
 * unchanged — most product slugs are identical in both locales).
 */
export function LanguageSwitcher({ locale, slugPairs, className = "" }: Props) {
  const pathname = usePathname();

  const map = (from: Locale, to: Locale, segment: string) =>
    slugPairs.find((pair) => pair[from] === segment)?.[to] ?? segment;

  // Strip any locale prefix: '/sq' from real URLs, and '/en' which leaks in
  // from the proxy's internal rewrite during prerendering ('en' is never a
  // real top-level slug).
  const segments = pathname.split("/").filter(Boolean);
  const pathSegments =
    segments[0] === "sq" || segments[0] === "en" ? segments.slice(1) : segments;

  const hrefFor = (target: Locale) => {
    const mapped = pathSegments.map((segment) => map(locale, target, segment));
    const path = mapped.join("/");
    if (target === "sq") return path ? `/sq/${path}` : "/sq";
    return path ? `/${path}` : "/";
  };

  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${className}`}>
      {(["en", "sq"] as const).map((target, index) => (
        <span key={target} className="flex items-center gap-1">
          {index > 0 && <span className="text-slate-300">/</span>}
          <Link
            href={hrefFor(target)}
            hrefLang={target}
            aria-current={target === locale ? "true" : undefined}
            className={
              target === locale
                ? "cursor-default text-brand-700 underline underline-offset-4"
                : "text-slate-500 transition-colors hover:text-brand-700"
            }
          >
            {target.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
