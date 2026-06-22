import { notFound } from "next/navigation";

import { PageHero } from "@/components/PageHero";
import { ProductCatalog } from "@/components/ProductCatalog";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Locale } from "@/lib/database.types";
import { getAllProducts, getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { ROUTE_SLUGS } from "@/lib/site";

export async function ProductsView({ locale }: { locale: Locale }) {
  const [page, products] = await Promise.all([
    getPage(locale, "products"),
    getAllProducts(locale),
  ]);
  if (!page) notFound();
  const basePath = basePathFor(locale);
  const dict = getDictionary(locale);
  const ctx = { locale, basePath, dict };

  return (
    <>
      <PageHero kicker={dict.footer.tagline} title={page.title} />
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} ctx={ctx} />
      ))}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <ProductCatalog
          products={products}
          locale={locale}
          hrefBase={`${basePath}/${ROUTE_SLUGS[locale].products}`}
        />
      </section>
    </>
  );
}
