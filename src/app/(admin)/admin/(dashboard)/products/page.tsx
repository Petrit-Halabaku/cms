import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Products — Gergoci Admin" };

type Props = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default async function ProductsAdminPage({ searchParams }: Props) {
  const { q = "", category = "" } = await searchParams;
  const { supabase } = await requireEditor();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("project_categories")
      .select("id, sort_order, project_category_translations!inner(name, locale)")
      .eq("project_category_translations.locale", "en")
      .order("sort_order"),
    supabase
      .from("projects")
      .select(
        "id, category_id, sort_order, published, project_translations!inner(title, slug, locale)",
      )
      .eq("project_translations.locale", "en")
      .order("category_id")
      .order("sort_order"),
  ]);

  const categoryName = new Map(
    (categories ?? []).map((c) => [c.id, c.project_category_translations[0].name]),
  );

  const filtered = (products ?? []).filter((product) => {
    const title = product.project_translations[0].title.toLowerCase();
    if (q && !title.includes(q.toLowerCase())) return false;
    if (category && product.category_id !== category) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Plus className="h-4 w-4" aria-hidden /> New product
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" method="GET">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search products…"
            className="rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          />
        </div>
        <select
          name="category"
          defaultValue={category}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-600 focus:outline-none"
        >
          <option value="">All categories</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.project_category_translations[0].name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  <Link href={`/admin/products/${product.id}`} className="hover:text-brand-700">
                    {product.project_translations[0].title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {categoryName.get(product.category_id)}
                </td>
                <td className="px-4 py-3 text-slate-500">{product.project_translations[0].slug}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      product.published
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {product.published ? "Published" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  No products match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
