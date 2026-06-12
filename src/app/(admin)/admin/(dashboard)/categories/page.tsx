import Link from "next/link";
import { Plus } from "lucide-react";

import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Categories — Gergoci Admin" };

export default async function CategoriesAdminPage() {
  const { supabase } = await requireEditor();
  const { data: categories } = await supabase
    .from("project_categories")
    .select("id, sort_order, project_category_translations(locale, name, slug)")
    .order("sort_order");

  const rows = (categories ?? []).map((category) => {
    const en = category.project_category_translations.find((t) => t.locale === "en");
    const sq = category.project_category_translations.find((t) => t.locale === "sq");
    return { id: category.id, sortOrder: category.sort_order, en, sq };
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> New category
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Name (EN)</th>
              <th className="px-4 py-3">Name (SQ)</th>
              <th className="px-4 py-3">Slugs</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-500">{row.sortOrder}</td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/admin/categories/${row.id}`} className="hover:text-brand-700">
                    {row.en?.name ?? "—"}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">{row.sq?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {row.en?.slug} / {row.sq?.slug}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
