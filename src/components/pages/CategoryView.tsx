import { notFound } from "next/navigation";

import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/PageHero";
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
      <PageHero
        kicker={dict.nav.products}
        title={category.name}
        intro={category.description ?? undefined}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {products.length > 0 ? (
          <Reveal stagger={0.08}>
            <ProductGrid
              products={products}
              locale={locale}
              hrefFor={(p) =>
                `${basePath}/${ROUTE_SLUGS[locale].products}/${category.slug}/${p.slug}`
              }
            />
          </Reveal>
        ) : (
          <p className="text-slate-600">{dict.product.noProducts}</p>
        )}
      </section>
    </>
  );
}
