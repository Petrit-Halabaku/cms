import { notFound } from "next/navigation";

import { BrochureManager } from "@/components/admin/BrochureManager";
import { ProductForm, type ProductFormInitial } from "@/components/admin/ProductForm";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Edit product — Gergoci Admin" };

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireEditor();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id, category_id, sort_order, published, brochure_url, project_translations(locale, title, slug, body, seo_title, seo_description), project_facts(id, locale, label, value, sort_order), project_images(id, sort_order, is_featured, media(id, storage_path, width, height)), product_categories(category_id)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("project_categories")
      .select("id, sort_order, project_category_translations!inner(name, locale)")
      .eq("project_category_translations.locale", "en")
      .order("sort_order"),
  ]);
  if (!product) notFound();

  const translationFor = (locale: "en" | "sq") => {
    const t = product.project_translations.find((row) => row.locale === locale);
    return {
      title: t?.title ?? "",
      slug: t?.slug ?? "",
      body: t?.body ?? "",
      seoTitle: t?.seo_title ?? "",
      seoDescription: t?.seo_description ?? "",
    };
  };
  const factsFor = (locale: "en" | "sq") =>
    product.project_facts
      .filter((fact) => fact.locale === locale)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((fact) => ({ label: fact.label, value: fact.value }));

  const extraCategoryIds = (product.product_categories ?? [])
    .map((pc) => pc.category_id)
    .filter((cid) => cid !== product.category_id);

  const initial: ProductFormInitial = {
    id: product.id,
    categoryId: product.category_id,
    extraCategoryIds,
    sortOrder: product.sort_order,
    published: product.published,
    brochureUrl: product.brochure_url,
    translations: { en: translationFor("en"), sq: translationFor("sq") },
    facts: { en: factsFor("en"), sq: factsFor("sq") },
  };

  const images = [...product.project_images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {initial.translations.en.title || "Edit product"}
      </h1>
      <div className="mt-6">
        <ProductForm
          categories={(categories ?? []).map((c) => ({
            id: c.id,
            name: c.project_category_translations[0].name,
          }))}
          initial={initial}
        >
          <ProductImagesManager
            productId={product.id}
            slug={translationFor("en").slug}
            images={images}
          />
          <BrochureManager productId={product.id} brochureUrl={product.brochure_url} />
        </ProductForm>
      </div>
    </div>
  );
}
