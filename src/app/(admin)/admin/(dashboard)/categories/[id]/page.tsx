import { notFound } from "next/navigation";

import { CategoryForm } from "@/components/admin/CategoryForm";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Edit category — Gergoci Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireEditor();

  const { data: category } = await supabase
    .from("project_categories")
    .select(
      "id, sort_order, project_category_translations(locale, name, slug, description, seo_title, seo_description)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!category) notFound();

  const translationFor = (locale: "en" | "sq") => {
    const t = category.project_category_translations.find((row) => row.locale === locale);
    return {
      name: t?.name ?? "",
      slug: t?.slug ?? "",
      description: t?.description ?? "",
      seoTitle: t?.seo_title ?? "",
      seoDescription: t?.seo_description ?? "",
    };
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {translationFor("en").name || "Edit category"}
      </h1>
      <div className="mt-6">
        <CategoryForm
          initial={{
            id: category.id,
            sortOrder: category.sort_order,
            translations: { en: translationFor("en"), sq: translationFor("sq") },
          }}
        />
      </div>
    </div>
  );
}
