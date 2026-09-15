import { Fragment } from "react";

import { EditorialContainer, PaneHeading } from "@/components/pages/editorial";
import { ProjectsShowcase } from "@/components/pages/ProjectsShowcase";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Locale } from "@/lib/database.types";
import { getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { contactInfoSchema, parseContent } from "@/lib/sections";

export async function HomeView({ locale }: { locale: Locale }) {
  const [page, contactPage] = await Promise.all([
    getPage(locale, "home"),
    getPage(locale, "contact"),
  ]);
  const info = parseContent(
    contactInfoSchema,
    contactPage?.sections.find((s) => s.type === "contact-info")?.content ?? {},
  );
  const ctx = {
    locale,
    basePath: basePathFor(locale),
    dict: getDictionary(locale),
    phone: info.phone || undefined,
  };

  return (
    <>
      {page?.sections.map((section, index) => (
        <Fragment key={section.id}>
          <SectionRenderer section={section} ctx={ctx} />
          {index === 0 && (
            <section className="border-b border-line bg-brand-50 py-10 sm:py-16" aria-label={ctx.dict.markets.heading}>
              <EditorialContainer className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-center lg:gap-16">
                <div>
                  <PaneHeading text={ctx.dict.markets.heading} />
                  <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
                    {ctx.dict.markets.body}
                  </p>
                </div>
                <ul className="grid gap-4 border-t border-brand-200 pt-6 sm:grid-cols-2 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
                  {[ctx.dict.markets.eu, ctx.dict.markets.usa].map((market) => (
                    <li key={market} className="flex items-start gap-3 font-display text-lg text-brand-900 sm:text-xl">
                      <span aria-hidden className="mt-2 block h-2 w-2 shrink-0 bg-brand-700" />
                      {market}
                    </li>
                  ))}
                </ul>
              </EditorialContainer>
            </section>
          )}
          {/* Projects gallery sits directly under the "What we offer" grid. */}
          {section.key === "offer-grid" && <ProjectsShowcase locale={locale} />}
        </Fragment>
      ))}
    </>
  );
}
