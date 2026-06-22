import { notFound } from "next/navigation";

import { PageHero } from "@/components/PageHero";
import { ProductFilter } from "@/components/ProductFilter";
import type { Locale } from "@/lib/database.types";
import { getCategoryBySlug, getProductsByCategory } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { ROUTE_SLUGS } from "@/lib/site";

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

  return (
    <>
      <PageHero
        kicker={dict.nav.products}
        title={category.name}
        intro={category.description ?? undefined}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
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
