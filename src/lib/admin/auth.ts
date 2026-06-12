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
