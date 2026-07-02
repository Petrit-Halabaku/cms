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

  const [selCats, setSelCats] = useState<Set<string>>(new Set());
  const [selBrands, setSelBrands] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const matchesCats = (p: ProductCatalogItem) =>
    selCats.size === 0 || p.categories.some((c) => selCats.has(c.slug));
  const matchesBrands = (p: ProductCatalogItem) =>
    selBrands.size === 0 || (p.brand != null && selBrands.has(p.brand));

  // Each group's counts reflect the OTHER group's selection (its own selection is
  // ignored so multi-select within the group stays possible).
  const categories = useMemo(() => {
    const map = new Map<string, FacetValue>();
    for (const p of products) {
      const counts = matchesBrands(p);
      for (const c of p.categories) {
        const existing = map.get(c.slug);
        if (existing) existing.count += counts ? 1 : 0;
        else map.set(c.slug, { value: c.slug, label: c.name, count: counts ? 1 : 0 });
      }
    }
    return [...map.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selBrands]);

  const brands = useMemo(() => {
    const map = new Map<string, FacetValue>();
    for (const p of products) {
      if (!p.brand) continue;
      const counts = matchesCats(p);
      const existing = map.get(p.brand);
      if (existing) existing.count += counts ? 1 : 0;
      else map.set(p.brand, { value: p.brand, label: p.brand, count: counts ? 1 : 0 });
    }
    return [...map.values()];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selCats]);

  const filtered = useMemo(
    () => products.filter((p) => matchesCats(p) && matchesBrands(p)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <p className="flex items-center gap-2.5 font-display text-lg text-slate-900">
          <span aria-hidden className="block h-2.5 w-2.5 shrink-0 bg-brand-700" />
          {L.filters}
        </p>
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
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, index) => (
              <ProductCard
                key={p.id}
                product={p}
                locale={locale}
                href={`${hrefBase}/${p.categorySlug}/${p.slug}`}
                index={index}
                priority={index === 0}
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
        {options.map((o) => {
          const dimmed = o.count === 0 && !selected.has(o.value);
          return (
            <li key={o.value}>
              <label
                className={`flex cursor-pointer items-center gap-2.5 text-sm transition-colors ${
                  dimmed ? "text-slate-300 hover:text-slate-500" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(o.value)}
                  onChange={() => onToggle(o.value)}
                  className="h-4 w-4 shrink-0 rounded-sm border-line text-brand-700 focus:ring-brand-700"
                />
                <span className="flex-1">{o.label}</span>
                <span className={`text-xs ${dimmed ? "text-slate-300" : "text-slate-400"}`}>
                  {o.count}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
