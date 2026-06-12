import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText,
  FolderTree,
  HelpCircle,
  Image as ImageIcon,
  Inbox,
  Handshake,
  LayoutDashboard,
  LogOut,
  Package,
} from "lucide-react";

import { requireEditor } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/submissions", label: "Submissions", icon: Inbox },
  { href: "/admin/partners", label: "Partners", icon: Handshake },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await requireEditor();

  const { count: unread } = await supabase
    .from("form_submissions")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false)
    .eq("is_archived", false);

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <Link href="/admin" className="text-lg font-bold tracking-tight text-brand-800">
            GERGOCI
          </Link>
          <p className="text-xs text-slate-500">Admin</p>
        </div>
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-brand-700"
            >
              <span className="flex items-center gap-2.5">
                <item.icon className="h-4 w-4" aria-hidden />
                {item.label}
              </span>
              {item.href === "/admin/submissions" && (unread ?? 0) > 0 && (
                <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white">
                  {unread}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <p className="truncate px-3 pb-2 text-xs text-slate-500" title={user.email ?? ""}>
            {user.email}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-x-auto p-8">{children}</main>
    </div>
  );
}
