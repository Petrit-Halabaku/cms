import { requiredEnv } from "./env";
import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/database.types";

/** Browser client (anon key) — for client components, e.g. admin UI interactions. */
export function createClient() {
  return createBrowserClient<Database>(
    requiredEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );
}
