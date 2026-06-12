import { notFound } from "next/navigation";

import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Locale } from "@/lib/database.types";
import { getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";

/** Generic sectioned page with a hero band title — used by about & services. */
export async function SimplePageView({
  locale,
  pageKey,
}: {
  locale: Locale;
  pageKey: string;
}) {
  const page = await getPage(locale, pageKey);
  if (!page) notFound();
  const ctx = { locale, basePath: basePathFor(locale), dict: getDictionary(locale) };

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
    </>
  );
}
