/**
 * Read-only verification of the catalog import. No writes.
 * Usage: node scripts/verify-import.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const env = {};
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
const env = loadEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const count = async (t, q) => {
  let query = supabase.from(t).select("*", { count: "exact", head: true });
  if (q) query = q(query);
  const { count: c, error } = await query;
  return error ? `ERR ${error.message}` : c;
};

console.log("Counts");
console.log("  projects:            ", await count("projects"));
console.log("  projects published:  ", await count("projects", (q) => q.eq("published", true)));
console.log("  projects w/ brand:   ", await count("projects", (q) => q.not("brand_partner_id", "is", null)));
console.log("  project_translations:", await count("project_translations"), "(expect 46)");
console.log("  project_facts:       ", await count("project_facts"));
console.log("  project_categories:  ", await count("project_categories"));
console.log("  partners:            ", await count("partners"), "(expect 8)");

console.log("\nPlaceholder leftovers (must be 0)");
console.log("  translations w/ TODO:", await count("project_translations", (q) => q.ilike("body", "%TODO: content migration%")));
console.log("  facts w/ TODO:       ", await count("project_facts", (q) => q.ilike("value", "%TODO: content migration%")));
console.log("  partners w/ TODO:    ", await count("partners", (q) => q.ilike("name", "%TODO%")));

console.log("\nCategories (en):");
const { data: cats } = await supabase.from("project_category_translations").select("name, slug").eq("locale", "en").order("name");
for (const c of cats ?? []) console.log(`  ${c.name}  (/${c.slug})`);

console.log("\nPartners:");
const { data: partners } = await supabase.from("partners").select("name").order("sort_order");
console.log("  " + (partners ?? []).map((p) => p.name).join(", "));

console.log("\nSample product — stoma-av-900-and-av-700:");
const { data: av } = await supabase
  .from("project_translations")
  .select("locale, title, slug, body, projects!inner(published, brand_partner_id, partners:brand_partner_id(name))")
  .eq("slug", "stoma-av-900-and-av-700");
for (const t of av ?? []) {
  console.log(`  [${t.locale}] ${t.title}  published=${t.projects.published}  brand=${t.projects.partners?.name}`);
  console.log(`        ${(t.body ?? "").slice(0, 110)}…`);
}
const avId = av?.[0]?.projects ? (await supabase.from("project_translations").select("project_id").eq("slug", "stoma-av-900-and-av-700").limit(1)).data?.[0]?.project_id : null;
if (avId) {
  const { data: facts } = await supabase.from("project_facts").select("label, value").eq("project_id", avId).eq("locale", "sq").order("sort_order").limit(6);
  console.log("  first SQ facts:");
  for (const f of facts ?? []) console.log(`    ${f.label}: ${f.value}`);
}
