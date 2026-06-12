import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Locale } from "@/lib/database.types";
import { getCategories, getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { ROUTE_SLUGS } from "@/lib/site";

export async function ProductsView({ locale }: { locale: Locale }) {
  const [page, categories] = await Promise.all([
    getPage(locale, "products"),
    getCategories(locale),
  ]);
  if (!page) notFound();
  const basePath = basePathFor(locale);
  const dict = getDictionary(locale);
  const ctx = { locale, basePath, dict };

  return (
    <>
      <header className="bg-brand-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{page.title}</h1>
        </div>
      </header>
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} ctx={ctx} />
      ))}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`${basePath}/${ROUTE_SLUGS[locale].products}/${category.slug}`}
              className="group rounded-lg border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-brand-700">
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-2 text-sm text-slate-600">{category.description}</p>
              )}
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
                {dict.common.learnMore}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
