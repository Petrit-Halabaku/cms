import { Fragment } from "react";
import { Phone } from "lucide-react";

import { EditorialContainer, PaneHeading } from "@/components/pages/editorial";
import { FilmPanel } from "@/components/pages/FilmPanel";
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
  const soundLabels =
    locale === "sq"
      ? { unmute: "Ndiz zërin", mute: "Fik zërin" }
      : { unmute: "Unmute video", mute: "Mute video" };
  // Both clips are New York footage, so they sit with the EU/USA markets story.
  const films = [
    { src: "/videos/new-york-video.mp4", aspectClassName: "aspect-[464/832]" },
    { src: "/videos/new-york-2-video.mp4", aspectClassName: "aspect-[576/1024]" },
  ].map((film) => ({ ...film, ariaLabel: `New York — ${ctx.dict.markets.usa}` }));

  return (
    <>
      {page?.sections.map((section, index) => (
        <Fragment key={section.id}>
          <SectionRenderer section={section} ctx={ctx} />
          {index === 0 && (
            <section className="border-b border-line bg-brand-50 py-10 sm:py-16" aria-label={ctx.dict.markets.heading}>
              <EditorialContainer>
                <FilmPanel
                  films={films}
                  sound
                  soundLabels={soundLabels}
                  frameClassName="h-44 sm:h-56 lg:h-72"
                >
                  <PaneHeading text={ctx.dict.markets.heading} />
                  <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
                    {ctx.dict.markets.body}
                  </p>
                  <ul className="mt-6 grid gap-4 border-t border-brand-200 pt-6 sm:grid-cols-2">
                    {[ctx.dict.markets.eu, ctx.dict.markets.usa].map((market) => (
                      <li
                        key={market}
                        className="flex items-start gap-3 font-display text-lg text-brand-900 sm:text-xl"
                      >
                        <span aria-hidden className="mt-2 block h-2 w-2 shrink-0 bg-brand-700" />
                        {market}
                      </li>
                    ))}
                  </ul>
                  {ctx.phone && (
                    <a
                      href={`tel:${ctx.phone.replace(/\s/g, "")}`}
                      className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-700 py-2 pr-4.5 pl-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
                    >
                      <Phone className="h-4 w-4" aria-hidden />
                      {ctx.dict.common.callNow}
                    </a>
                  )}
                </FilmPanel>
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
