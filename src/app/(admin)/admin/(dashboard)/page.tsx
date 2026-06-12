import Link from "next/link";

import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Dashboard — Gergoci Admin" };

export default async function AdminDashboard() {
  const { supabase } = await requireEditor();

  const [products, published, categories, media, unread] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("project_categories").select("*", { count: "exact", head: true }),
    supabase.from("media").select("*", { count: "exact", head: true }),
    supabase
      .from("form_submissions")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .eq("is_archived", false),
  ]);

  const cards = [
    { label: "Products", value: products.count ?? 0, sub: `${published.count ?? 0} published`, href: "/admin/products" },
    { label: "Categories", value: categories.count ?? 0, sub: "product categories", href: "/admin/categories" },
    { label: "Media files", value: media.count ?? 0, sub: "in the library", href: "/admin/media" },
    { label: "Unread submissions", value: unread.count ?? 0, sub: "contact & quote forms", href: "/admin/submissions" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
          </Link>
        ))}
      </div>
      <p className="mt-8 max-w-xl text-sm text-slate-500">
        Content edits are published to the live site immediately after saving.
        Use the navigation on the left to manage products, page content, media
        and incoming form submissions.
      </p>
    </div>
  );
}
