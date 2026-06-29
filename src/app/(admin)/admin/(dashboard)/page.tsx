import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Package,
  Palette,
  Plus,
  type LucideIcon,
} from "lucide-react";

import { requireEditor } from "@/lib/admin/auth";

export const metadata = { title: "Dashboard — Gergoci Admin" };

type StatCard = {
  label: string;
  value: number;
  sub: string;
  href: string;
  icon: LucideIcon;
};

type QuickAction = { label: string; description: string; href: string; icon: LucideIcon };

const QUICK_ACTIONS: QuickAction[] = [
  { label: "New product", description: "Add a project to the catalogue", href: "/admin/products/new", icon: Plus },
  { label: "Edit pages", description: "Update page content & sections", href: "/admin/pages", icon: FileText },
  { label: "Media library", description: "Upload and manage images", href: "/admin/media", icon: ImageIcon },
  { label: "Branding", description: "Swap the site logo", href: "/admin/branding", icon: Palette },
];

export default async function AdminDashboard() {
  const { user, supabase } = await requireEditor();

  const [products, published, categories, media] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("project_categories").select("*", { count: "exact", head: true }),
    supabase.from("media").select("*", { count: "exact", head: true }),
  ]);

  const name = user.email?.split("@")[0] ?? "there";

  const cards: StatCard[] = [
    {
      label: "Products",
      value: products.count ?? 0,
      sub: `${published.count ?? 0} published`,
      href: "/admin/products",
      icon: Package,
    },
    {
      label: "Categories",
      value: categories.count ?? 0,
      sub: "product categories",
      href: "/admin/categories",
      icon: FolderTree,
    },
    {
      label: "Media files",
      value: media.count ?? 0,
      sub: "in the library",
      href: "/admin/media",
      icon: ImageIcon,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <header>
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-brand-700">
          Overview
        </p>
        <h1 className="mt-1 font-display text-3xl tracking-tight text-slate-900">
          Welcome back, <span className="capitalize">{name}</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          Content edits go live on the site as soon as you save. Use the sidebar to manage
          products, page content, media, partners and FAQs.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_12px_30px_-12px_rgba(1,38,83,0.25)]"
          >
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <card.icon className="h-5 w-5" aria-hidden />
              </span>
              <ArrowUpRight
                className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-700"
                aria-hidden
              />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
            <p className="mt-0.5 text-sm font-medium text-slate-700">{card.label}</p>
            <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                <action.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-slate-900">{action.label}</span>
                <span className="block text-xs text-slate-500">{action.description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
