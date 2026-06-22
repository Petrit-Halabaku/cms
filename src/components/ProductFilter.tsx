"use client";

import { useMemo, useState } from "react";

import { ProductGrid } from "@/components/ProductCard";
import type { Locale } from "@/lib/database.types";
import type { ProductListItem } from "@/lib/db/content";

/**
 * Client-side brand filter for a category's product list. Filters the
 * already-loaded products in the browser — no server round-trip. Hidden when
 * fewer than two brands are present. `hrefBase` is passed as a string because
 * functions can't cross the server→client boundary.
 */
export function ProductFilter({
  products,
  locale,
  hrefBase,
}: {
  products: ProductListItem[];
  locale: Locale;
  hrefBase: string;
}) {
  const brands = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.brand) set.add(p.brand);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const [active, setActive] = useState<string>("__all");
  const hrefFor = (p: ProductListItem) => `${hrefBase}/${p.slug}`;

  if (brands.length < 2) {
    return <ProductGrid products={products} locale={locale} hrefFor={hrefFor} />;
  }

  const filtered = active === "__all" ? products : products.filter((p) => p.brand === active);
  const allLabel = locale === "sq" ? "Të gjitha" : "All";

  const chip = (key: string, label: string) => (
    <button
      key={key}
      type="button"
      onClick={() => setActive(key)}
      aria-pressed={active === key}
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active === key
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-line text-slate-600 hover:border-brand-700 hover:text-brand-700"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div>
      <div
        className="mb-10 flex flex-wrap items-center gap-2.5"
        role="group"
        aria-label={locale === "sq" ? "Filtro sipas markës" : "Filter by brand"}
      >
        {chip("__all", allLabel)}
        {brands.map((b) => chip(b, b))}
      </div>
      <ProductGrid products={filtered} locale={locale} hrefFor={hrefFor} />
    </div>
  );
}
