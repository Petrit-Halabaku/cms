import { ProductForm } from "@/components/admin/ProductForm";
import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "New product — Gergoci Admin" };

export default async function NewProductPage() {
  const { supabase } = await requireEditor();
  const { data: categories } = await supabase
    .from("project_categories")
    .select("id, sort_order, project_category_translations!inner(name, locale)")
    .eq("project_category_translations.locale", "en")
    .order("sort_order");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">New product</h1>
      <p className="mt-1 text-sm text-slate-500">
        Save the product first — image and brochure upload become available afterwards.
      </p>
      <div className="mt-6">
        <ProductForm
          categories={(categories ?? []).map((c) => ({
            id: c.id,
            name: c.project_category_translations[0].name,
          }))}
        />
      </div>
    </div>
  );
}
