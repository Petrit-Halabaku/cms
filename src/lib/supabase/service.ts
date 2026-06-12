import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/database.types";

/**
 * Service-role client — bypasses RLS. Server-side admin actions ONLY
 * (e.g. managing profiles). Never expose to the browser.
 */
export function createServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error("createServiceClient must never run in the browser");
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
