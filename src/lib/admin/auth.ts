import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/**
 * Server-side editor gate for admin pages and server actions: requires an
 * authenticated user WITH a profiles row (admin or editor). The proxy already
 * blocks anonymous requests; this is defense in depth + role check.
 */
export async function requireEditor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) redirect("/admin/login?error=no-profile");

  return { supabase, user, role: profile.role };
}

/**
 * Stricter gate for user-management pages and actions: requires the `admin`
 * role. Editors have full content access but may not add or remove dashboard
 * users, so they are bounced back to the dashboard home.
 */
export async function requireAdmin() {
  const ctx = await requireEditor();
  if (ctx.role !== "admin") redirect("/admin");
  return ctx;
}
