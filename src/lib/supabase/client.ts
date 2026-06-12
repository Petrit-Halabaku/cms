import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

/** Browser client (anon key) — for client components, e.g. admin UI interactions. */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
