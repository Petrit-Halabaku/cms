import { notFound } from "next/navigation";

import { PageHero } from "@/components/PageHero";
import { ProductFilter } from "@/components/ProductFilter";
import type { Locale } from "@/lib/database.types";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { ROUTE_SLUGS, storageUrl } from "@/lib/site";

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
  const heroImage = heroKey ? storageUrl("media", `hero/categories/${heroKey}.webp`) : undefined;

  return (
    <>
      <PageHero
        kicker={dict.nav.products}
        title={category.name}
        intro={category.description ?? undefined}
        image={heroImage}
        imageAlt={category.name}
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
