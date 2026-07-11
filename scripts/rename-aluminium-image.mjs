/**
 * One-off: rename the aluminium offer-card image in the media bucket
 * (cards/gen-aluminium-systems.webp → cards/gen-aluminium.webp), repoint the
 * offer-grid cards in both locales, upload the new hero for the Aluminium
 * category (hero/categories/aluminium.webp), and remove the old card object
 * once nothing references it.
 *
 *   node scripts/rename-aluminium-image.mjs            # DRY RUN
 *   node scripts/rename-aluminium-image.mjs --apply
 */
import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const OLD_CARD = "cards/gen-aluminium-systems.webp";
const NEW_CARD = "cards/gen-aluminium.webp";
const CARD_FILE = join(ROOT, "media-import", "cards-generated", "gen-aluminium.webp");
const HERO_PATH = "hero/categories/aluminium.webp";
const HERO_FILE = join(ROOT, "media-import", "_hero", "categories", "aluminium.webp");

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
if (!url || !key) { console.error("Missing Supabase env in .env.local"); process.exit(1); }

const supabase = createClient(url, key);
console.log(`aluminium rename · target: ${new URL(url).host} · mode: ${APPLY ? "APPLY" : "DRY RUN"}\n`);

// 1. Upload the card under its new name + the category hero.
for (const [path, file] of [[NEW_CARD, CARD_FILE], [HERO_PATH, HERO_FILE]]) {
  console.log(`upload media/${path}`);
  if (APPLY) {
    const { error } = await supabase.storage
      .from("media")
      .upload(path, readFileSync(file), { contentType: "image/webp", upsert: true });
    if (error) { console.error(`  ✗ ${error.message}`); process.exit(1); }
  }
}

// 2. Repoint offer-grid cards referencing the old path, in every locale.
const { data: sections, error } = await supabase
  .from("page_sections")
  .select("id, page_section_translations(locale, content)")
  .eq("key", "offer-grid");
if (error) { console.error(error.message); process.exit(1); }

for (const section of sections ?? []) {
  for (const tr of section.page_section_translations ?? []) {
    const content = tr.content ?? {};
    const items = Array.isArray(content.items) ? content.items : [];
    let changed = false;
    const nextItems = items.map((item) => {
      if (item.image_path !== OLD_CARD) return item;
      changed = true;
      console.log(`  [${tr.locale}] ${JSON.stringify(item.title)}: ${OLD_CARD} → ${NEW_CARD}`);
      return { ...item, image_path: NEW_CARD };
    });
    if (!changed) { console.log(`  [${tr.locale}] no references to the old path`); continue; }
    if (APPLY) {
      const { error: upError } = await supabase
        .from("page_section_translations")
        .update({ content: { ...content, items: nextItems } })
        .eq("section_id", section.id)
        .eq("locale", tr.locale);
      if (upError) { console.error(`  ✗ [${tr.locale}] ${upError.message}`); process.exit(1); }
    }
  }
}

// 3. Remove the old object now that nothing points at it.
console.log(`remove media/${OLD_CARD}`);
if (APPLY) {
  const { error: rmError } = await supabase.storage.from("media").remove([OLD_CARD]);
  if (rmError) { console.error(`  ✗ ${rmError.message}`); process.exit(1); }
}

console.log(APPLY ? "\nDone. Re-save the section in the admin (or redeploy) to revalidate the site." : "\nDry run only — nothing written. Re-run with --apply to execute.");
