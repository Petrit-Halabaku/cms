import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/ProductCard";
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
      <header className="bg-brand-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{category.name}</h1>
          {category.description && (
            <p className="mt-4 max-w-2xl text-lg text-slate-600">{category.description}</p>
          )}
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {products.length > 0 ? (
          <ProductGrid
            products={products}
            locale={locale}
            hrefFor={(p) =>
              `${basePath}/${ROUTE_SLUGS[locale].products}/${category.slug}/${p.slug}`
            }
          />
        ) : (
          <p className="text-slate-600">{dict.product.noProducts}</p>
        )}
      </section>
    </>
  );
}
