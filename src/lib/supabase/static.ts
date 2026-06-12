import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Cookie-free anon client for PUBLIC content reads in server components.
 *
 * Unlike the auth-aware client in server.ts this never touches cookies(), so
 * pages that use it stay statically renderable / ISR-able. RLS still applies:
 * the anon role only sees published, public rows.
 */
export function createStaticClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
