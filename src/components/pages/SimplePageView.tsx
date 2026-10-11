import { notFound } from "next/navigation";

import { PageHero } from "@/components/PageHero";
import { SectionRenderer } from "@/components/sections/SectionRenderer";
import type { Locale } from "@/lib/database.types";
import { getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { storageUrl } from "@/lib/site";

/** Generic sectioned page with the shared hero header — used by about & services. */
export async function SimplePageView({
  locale,
  pageKey,
}: {
  locale: Locale;
  pageKey: string;
}) {
  const page = await getPage(locale, pageKey);
  if (!page) notFound();
  const dict = getDictionary(locale);
  const ctx = { locale, basePath: basePathFor(locale), dict };
  // About & services get a full-bleed hero photo from Supabase storage (media/hero/<key>.webp).
  const heroImage =
    pageKey === "about" || pageKey === "services"
      ? storageUrl("media", `hero/${pageKey}.webp`)
      : undefined;

  return (
    <>
      <PageHero
        kicker={dict.footer.tagline}
        title={page.title}
        image={heroImage}
        imageAlt={page.title}
      />
      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} ctx={ctx} />
      ))}
    </>
  );
}
