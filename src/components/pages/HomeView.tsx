import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Locale } from "@/lib/database.types";
import { getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";

export async function HomeView({ locale }: { locale: Locale }) {
  const page = await getPage(locale, "home");
  const ctx = { locale, basePath: basePathFor(locale), dict: getDictionary(locale) };

  return (
    <>
      {page?.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} ctx={ctx} />
      ))}
    </>
  );
}
