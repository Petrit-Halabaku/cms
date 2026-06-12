import { notFound } from "next/navigation";

import { PageMetaForm } from "@/components/admin/PageMetaForm";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Edit page — Gergoci Admin" };

type Props = { params: Promise<{ key: string }> };

export default async function EditPagePage({ params }: Props) {
  const { key } = await params;
  const { supabase } = await requireEditor();

  const [{ data: page }, { data: media }] = await Promise.all([
    supabase
      .from("pages")
      .select(
        "id, key, page_translations(locale, title, slug, seo_title, seo_description), page_sections(id, key, type, sort_order, page_section_translations(locale, content))",
      )
      .eq("key", key)
      .maybeSingle(),
    supabase
      .from("media")
      .select("id, storage_path, alt_en")
      .order("created_at", { ascending: false }),
  ]);
  if (!page) notFound();

  const translationFor = (locale: "en" | "sq") => {
    const t = page.page_translations.find((row) => row.locale === locale);
    return {
      title: t?.title ?? "",
      slug: t?.slug ?? "",
      seoTitle: t?.seo_title ?? "",
      seoDescription: t?.seo_description ?? "",
    };
  };

  const sections = [...page.page_sections].sort((a, b) => a.sort_order - b.sort_order);
  const contentFor = (
    section: (typeof sections)[number],
    locale: "en" | "sq",
  ): Record<string, unknown> =>
    (section.page_section_translations.find((t) => t.locale === locale)?.content ?? {}) as Record<
      string,
      unknown
    >;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {translationFor("en").title}
      </h1>
      <div className="mt-6 space-y-6">
        <PageMetaForm
          pageId={page.id}
          pageKey={page.key}
          initial={{ en: translationFor("en"), sq: translationFor("sq") }}
        />
        {sections.map((section) => (
          <SectionEditor
            key={section.id}
            sectionId={section.id}
            sectionKey={section.key}
            type={section.type}
            initial={{ en: contentFor(section, "en"), sq: contentFor(section, "sq") }}
            mediaOptions={media ?? []}
          />
        ))}
      </div>
    </div>
  );
}
