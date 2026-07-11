/**
 * Read-only: print the "offer-grid" section's cards (title per locale,
 * category key, current image_path) so card background images can be
 * generated to match. No writes.
 *
 *   node scripts/inspect-offer-grid.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();

function loadEnvLocal() {
  const env = {};
  const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key);
console.log(`offer-grid inspect · target: ${new URL(url).host} · READ ONLY\n`);

const { data: sections, error } = await supabase
  .from("page_sections")
  .select("id, key, type, sort_order, page_section_translations(locale, content)")
  .eq("key", "offer-grid");
if (error) {
  console.error(error.message);
  process.exit(1);
}
for (const section of sections ?? []) {
  console.log(`section ${section.id} · key=${section.key} · type=${section.type}`);
  for (const tr of section.page_section_translations ?? []) {
    const items = tr.content?.items ?? [];
    console.log(`  [${tr.locale}] heading: ${JSON.stringify(tr.content?.heading)}`);
    items.forEach((item, i) => {
      console.log(
        `    ${i + 1}. title=${JSON.stringify(item.title)} key=${item.key ?? "-"} image_path=${item.image_path ?? "-"}`,
      );
    });
  }
}
