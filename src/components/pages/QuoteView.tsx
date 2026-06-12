import { notFound } from "next/navigation";

import { QuoteForm } from "@/components/forms/QuoteForm";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Locale } from "@/lib/database.types";
import { getCategories, getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";

export async function QuoteView({ locale }: { locale: Locale }) {
  const [page, categories] = await Promise.all([
    getPage(locale, "get-quote"),
    getCategories(locale),
  ]);
  if (!page) notFound();
  const dict = getDictionary(locale);
  const ctx = { locale, basePath: basePathFor(locale), dict };

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

      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 lg:px-8">
        <QuoteForm
          locale={locale}
          dict={dict}
          categories={categories.map((category) => ({
            slug: category.slug,
            name: category.name,
          }))}
        />
      </div>
    </>
  );
}
