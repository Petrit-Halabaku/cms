/**
 * Wire the generated "What we offer" card backgrounds into the offer-grid
 * section: upload media-import/cards-generated/*.webp to the media bucket
 * (cards/…) and set each card's image_path in BOTH locales' content.
 *
 * Cards are matched to images by key/title keywords, so the differing item
 * order between EN and SQ doesn't matter. Old image files are left in
 * storage (only the references change).
 *
 *   node scripts/apply-offer-card-images.mjs            # DRY RUN
 *   node scripts/apply-offer-card-images.mjs --apply
 *
 * Note: the public site is static — after --apply, re-save the section in
 * the admin (or redeploy) so the pages revalidate.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const DIR = join(ROOT, "media-import", "cards-generated");

const IMAGES = [
  { file: "gen-aluminium.webp", match: /alumin/i },
  { file: "gen-glass-solutions.webp", match: /glass|xham/i },
  { file: "gen-pvc-windows-doors.webp", match: /pvc|window|dritare/i },
  { file: "gen-blinds-roller-shutters.webp", match: /blind|shutter|rolet|perde/i },
];

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
console.log(`offer-card images · target: ${new URL(url).host} · mode: ${APPLY ? "APPLY" : "DRY RUN"}\n`);

for (const img of IMAGES) {
  if (!existsSync(join(DIR, img.file))) {
    console.error(`Missing ${join(DIR, img.file)} — run scripts/generate-offer-card-images.mjs first.`);
    process.exit(1);
  }
}

const imageFor = (item) => {
  const hay = `${item.key ?? ""} ${item.title ?? ""}`;
  return IMAGES.find((img) => img.match.test(hay));
};

const { data: sections, error } = await supabase
  .from("page_sections")
  .select("id, page_section_translations(locale, content)")
  .eq("key", "offer-grid");
if (error) { console.error(error.message); process.exit(1); }
if (!sections?.length) { console.error("No offer-grid section found."); process.exit(1); }

// --- 1. Upload images -------------------------------------------------------
for (const img of IMAGES) {
  const path = `cards/${img.file}`;
  console.log(`upload media/${path}`);
  if (APPLY) {
    const bytes = readFileSync(join(DIR, img.file));
    const { error: upError } = await supabase.storage
      .from("media")
      .upload(path, bytes, { contentType: "image/webp", upsert: true });
    if (upError) { console.error(`  ✗ ${upError.message}`); process.exit(1); }
  }
}

// --- 2. Point the cards at them, per locale ---------------------------------
for (const section of sections) {
  for (const tr of section.page_section_translations ?? []) {
    const content = tr.content ?? {};
    const items = Array.isArray(content.items) ? content.items : [];
    let changed = false;
    const nextItems = items.map((item) => {
      const img = imageFor(item);
      if (!img) {
        console.warn(`  [${tr.locale}] no image match for ${JSON.stringify(item.title)} — left as is`);
        return item;
      }
      const nextPath = `cards/${img.file}`;
      if (item.image_path !== nextPath) changed = true;
      console.log(
        `  [${tr.locale}] ${JSON.stringify(item.title)}: ${item.image_path ?? "(none)"} → ${nextPath}`,
      );
      return { ...item, image_path: nextPath };
    });
    if (!changed) { console.log(`  [${tr.locale}] already up to date`); continue; }
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

console.log(APPLY ? "\nDone. Re-save the section in the admin (or redeploy) to revalidate the site." : "\nDry run only — nothing written. Re-run with --apply to execute.");
