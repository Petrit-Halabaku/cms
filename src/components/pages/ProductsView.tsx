import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/PageHero";
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
      <PageHero kicker={dict.footer.tagline} title={page.title} />
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} ctx={ctx} />
      ))}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Reveal
          stagger={0.08}
          className="grid grid-cols-1 border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3"
        >
          {categories.map((category, i) => (
            <Link
              key={category.id}
              href={`${basePath}/${ROUTE_SLUGS[locale].products}/${category.slug}`}
              className="group relative flex min-h-56 flex-col border-r border-b border-line bg-paper p-8 transition-colors duration-300 hover:bg-brand-50/60"
            >
              <span
                aria-hidden
                className="absolute top-0 left-0 h-0.5 w-0 bg-brand-700 transition-all duration-500 group-hover:w-full"
              />
              <p className="font-serif text-sm italic text-brand-700">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-4 font-display text-xl text-slate-900 transition-colors group-hover:text-brand-700">
                {category.name}
              </h2>
              {category.description && (
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  {category.description}
                </p>
              )}
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand-700">
                {dict.common.learnMore}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </Reveal>
      </section>
    </>
  );
}
