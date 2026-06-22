"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { ProductCard } from "@/components/ProductCard";
import type { Locale } from "@/lib/database.types";
import type { ProductCatalogItem } from "@/lib/db/content";

type FacetValue = { value: string; label: string; count: number };

/**
 * Full product catalogue with side filters (category + brand). All products are
 * loaded server-side; filtering happens in the browser. Multi-select within a
 * group (OR), combined across groups (AND). Sidebar on desktop, collapsible
 * panel on mobile.
 */
export function ProductCatalog({
  products,
  locale,
  hrefBase,
}: {
  products: ProductCatalogItem[];
  locale: Locale;
  /** `${basePath}/${productsSlug}` — product href is `${hrefBase}/${categorySlug}/${slug}`. */
  hrefBase: string;
}) {
  const L =
    locale === "sq"
      ? { filters: "Filtrat", categories: "Kategoritë", brands: "Markat", clear: "Pastro", none: "Asnjë produkt nuk përputhet me filtrat.", count: (n: number) => `${n} produkte` }
      : { filters: "Filters", categories: "Categories", brands: "Brands", clear: "Clear all", none: "No products match these filters.", count: (n: number) => `${n} ${n === 1 ? "product" : "products"}` };

  const categories = useFacet(products, (p) => [p.categorySlug, p.categoryName]);
  const brands = useFacet(products, (p) => (p.brand ? [p.brand, p.brand] : null));

  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [selBrands, setSelBrands] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (selCats.size === 0 || selCats.has(p.categorySlug)) &&
          (selBrands.size === 0 || (p.brand != null && selBrands.has(p.brand))),
      ),
    [products, selCats, selBrands],
  );

  const toggle = (set: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) =>
    set((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  const active = selCats.size + selBrands.size;
  const clearAll = () => {
    setSelCats(new Set());
    setSelBrands(new Set());
  };

  const panel = (
    <div className="space-y-0">
      <div className="flex items-center justify-between pb-4">
        <p className="font-display text-lg text-slate-900">{L.filters}</p>
        {active > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
          >
            {L.clear}
          </button>
        )}
      </div>
      {categories.length > 1 && (
        <Group title={L.categories} options={categories} selected={selCats} onToggle={(v) => toggle(setSelCats, v)} />
      )}
      {brands.length > 1 && (
        <Group title={L.brands} options={brands} selected={selBrands} onToggle={(v) => toggle(setSelBrands, v)} />
      )}
    </div>
  );

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-12">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:block">
        <div className="lg:sticky lg:top-28">{panel}</div>
      </aside>

      {/* Mobile filter toggle */}
      <div className="mb-6 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-slate-700"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          {L.filters}
          {active > 0 && (
            <span className="rounded-full bg-brand-700 px-1.5 text-xs font-semibold text-white">{active}</span>
          )}
        </button>
        <p className="text-sm text-slate-500">{L.count(filtered.length)}</p>
      </div>

      <div>
        {/* Mobile panel */}
        {open && (
          <div className="mb-8 border border-line bg-white p-5 lg:hidden">
            <div className="mb-2 flex justify-end">
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            {panel}
          </div>
        )}

        <p className="mb-6 hidden text-sm text-slate-500 lg:block">{L.count(filtered.length)}</p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                locale={locale}
                href={`${hrefBase}/${p.categorySlug}/${p.slug}`}
              />
            ))}
          </div>
        ) : (
          <p className="py-12 text-slate-600">{L.none}</p>
        )}
      </div>
    </div>
  );
}

/** Distinct facet values with counts, in first-seen order. */
function useFacet(
  products: ProductCatalogItem[],
  pick: (p: ProductCatalogItem) => [string, string] | null,
): FacetValue[] {
  return useMemo(() => {
    const map = new Map<string, FacetValue>();
    for (const p of products) {
      const hit = pick(p);
      if (!hit) continue;
      const [value, label] = hit;
      const existing = map.get(value);
      if (existing) existing.count += 1;
      else map.set(value, { value, label, count: 1 });
    }
    return [...map.values()];
  }, [products, pick]);
}

function Group({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: FacetValue[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <fieldset className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <legend className="kicker mb-4">{title}</legend>
      <ul className="space-y-2.5">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600 transition-colors hover:text-slate-900">
              <input
                type="checkbox"
                checked={selected.has(o.value)}
                onChange={() => onToggle(o.value)}
                className="h-4 w-4 shrink-0 rounded-sm border-line text-brand-700 focus:ring-brand-700"
              />
              <span className="flex-1">{o.label}</span>
              <span className="text-xs text-slate-400">{o.count}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
