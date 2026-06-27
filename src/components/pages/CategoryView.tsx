import { notFound } from "next/navigation";

import { EditorialHero } from "@/components/pages/editorial";
import { ProductFilter } from "@/components/ProductFilter";
import type { Locale } from "@/lib/database.types";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { ROUTE_SLUGS } from "@/lib/site";

/** Stable, locale-independent hero key per category (keyed by the fixed UUID),
 *  so EN + SQ share one file at /hero/categories/<key>/hero.webp. */
const CATEGORY_HERO_KEY: Record<string, string> = {
  "a0000000-0000-4000-8000-000000000001": "windows",
  "a0000000-0000-4000-8000-000000000002": "doors",
  "a0000000-0000-4000-8000-000000000003": "sliding-systems",
  "a0000000-0000-4000-8000-000000000004": "facades",
  "a0000000-0000-4000-8000-000000000005": "glass",
  "a0000000-0000-4000-8000-000000000006": "hardware-mechanisms",
  "a0000000-0000-4000-8000-000000000007": "shading-shutters",
};

export async function CategoryView({
  locale,
  categorySlug,
}: {
  locale: Locale;
  categorySlug: string;
}) {
  const category = await getCategoryBySlug(locale, categorySlug);
  if (!category) notFound();

  const products = await getProductsByCategory(locale, category.id);
  const dict = getDictionary(locale);
  const basePath = basePathFor(locale);
  const heroKey = CATEGORY_HERO_KEY[category.id];
  const heroPath = heroKey ? `hero/categories/${heroKey}.webp` : "products/products.webp";
  const brandCount = new Set(
    products.map((p) => p.brand).filter((b): b is string => Boolean(b)),
  ).size;
  const specs = [
    {
      value: String(products.length),
      label: locale === "sq" ? "Produkte" : "Products",
    },
    ...(brandCount > 0
      ? [{ value: String(brandCount), label: locale === "sq" ? "Marka" : "Brands" }]
      : []),
  ];

  return (
    <>
      <EditorialHero
        breadcrumbLabel={dict.nav.products}
        breadcrumbHref={`${basePath}/${ROUTE_SLUGS[locale].products}`}
        title={category.name}
        subtitle={category.description ?? dict.footer.tagline}
        image={{ path: heroPath, alt: category.name }}
        specs={specs}
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {products.length > 0 ? (
          <ProductFilter
            products={products}
            locale={locale}
            hrefBase={`${basePath}/${ROUTE_SLUGS[locale].products}/${category.slug}`}
          />
        ) : (
          <p className="text-slate-600">{dict.product.noProducts}</p>
        )}
      </section>
    </>
  );
}
