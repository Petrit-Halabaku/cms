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
      {page?.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} ctx={ctx} />
      ))}
    </>
  );
}
