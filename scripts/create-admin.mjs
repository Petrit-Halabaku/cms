/**
 * Create (or promote) an admin user for the Gergoci dashboard.
 *
 * Usage:
 *   node scripts/create-admin.mjs <email> <password> [role]
 *
 * role: 'admin' (default) or 'editor'.
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const env = {};
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const [email, password, role = "admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/create-admin.mjs <email> <password> [admin|editor]");
  process.exit(1);
}
if (!["admin", "editor"].includes(role)) {
  console.error(`Invalid role '${role}' — must be 'admin' or 'editor'.`);
  process.exit(1);
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Create the auth user (or look it up if it already exists).
let userId;
const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (createError) {
  if (!/already.*registered|already.*exists/i.test(createError.message)) {
    console.error(`Failed to create user: ${createError.message}`);
    process.exit(1);
  }
  const { data: list, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error(`Failed to list users: ${listError.message}`);
    process.exit(1);
  }
  const existing = list.users.find((u) => u.email === email);
  if (!existing) {
    console.error("User reported as existing but not found.");
    process.exit(1);
  }
  userId = existing.id;
  console.log(`User ${email} already exists — updating profile only.`);
} else {
  userId = created.user.id;
  console.log(`Created auth user ${email}.`);
}

const { error: profileError } = await supabase
  .from("profiles")
  .upsert({ id: userId, role });
if (profileError) {
  console.error(`Failed to upsert profile: ${profileError.message}`);
  process.exit(1);
}

console.log(`✔ ${email} is now '${role}'. Sign in at /admin/login.`);
