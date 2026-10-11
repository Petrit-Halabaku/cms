import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { requireEditor } from "@/lib/admin/auth";
import { getLogoUrl } from "@/lib/db/content";
import { SITE_NAME } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

import { SidebarNav } from "./SidebarNav";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ user, role }, logoUrl] = await Promise.all([requireEditor(), getLogoUrl()]);

  const initial = (user.email ?? "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col bg-brand-950 text-white">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          <Image
            src={logoUrl}
            alt=""
            aria-hidden
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 object-contain"
          />
          <Link href="/admin" className="leading-tight">
            <span className="block font-display text-lg tracking-tight">
              {SITE_NAME.toUpperCase()}
            </span>
            <span className="block text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-brand-100/50">
              Admin
            </span>
          </Link>
        </div>

        <SidebarNav isAdmin={role === "admin"} />

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-2.5 px-1 pb-2">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white"
            >
              {initial}
            </span>
            <p className="truncate text-xs text-white/50" title={user.email ?? ""}>
              {user.email}
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4 text-white/40" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-auto p-6 lg:p-10">{children}</main>
    </div>
  );
}
