/**
 * Ingest About-page gallery photos into the Supabase `media` bucket and set the
 * about gallery section's media_ids (so GallerySection renders them).
 *
 * Drop files in:  media-import/_about-gallery/*.webp
 * Re-runnable: media rows upsert by storage_path; section media_ids are rebuilt
 * from the folder each run (order = filename sort).
 *
 * Usage:
 *   node scripts/ingest-about-gallery.mjs            # DRY RUN
 *   node scripts/ingest-about-gallery.mjs --apply
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { imageSize, mimeFromExt } from "./lib/image-dimensions.mjs";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const FOLDER = join(ROOT, "media-import", "_about-gallery");
const GALLERY_SECTION = "d0000000-0000-4000-8000-000000000203";
const IMG_RE = /\.webp$/i;

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
if (!existsSync(FOLDER)) {
  console.error(`No ${FOLDER} — create media-import/_about-gallery/ and drop photos in it.`);
  process.exit(1);
}

console.log(`About gallery ingest · target: ${new URL(url).host} · mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const files = readdirSync(FOLDER).filter((f) => IMG_RE.test(f)).sort();
if (files.length === 0) { console.error("No image files in media-import/_about-gallery/"); process.exit(1); }
console.log(`${files.length} photo(s):`);

const mediaIds = [];
for (const file of files) {
  const buf = readFileSync(join(FOLDER, file));
  const dim = imageSize(buf);
  const mime = mimeFromExt(file);
  const storagePath = `about/${file}`;
  console.log(`  ${file}  ${dim ? `${dim.width}×${dim.height}` : "(dims?)"} ${mime}`);
  if (!APPLY) continue;

  const { error: upErr } = await supabase.storage.from("media")
    .upload(storagePath, buf, { contentType: mime, upsert: true });
  if (upErr) { console.error(`  ✗ upload: ${upErr.message}`); process.exit(1); }
  const { data: media, error: mErr } = await supabase.from("media")
    .upsert({ storage_path: storagePath, alt_en: "GERGOCI", alt_sq: "GERGOCI", width: dim?.width ?? null, height: dim?.height ?? null, mime_type: mime }, { onConflict: "storage_path" })
    .select("id").single();
  if (mErr) { console.error(`  ✗ media row: ${mErr.message}`); process.exit(1); }
  mediaIds.push(media.id);
}

if (!APPLY) {
  console.log("\nDRY RUN — would set the about gallery to these photos. Re-run with --apply.");
  process.exit(0);
}

for (const locale of ["en", "sq"]) {
  const { data: row } = await supabase.from("page_section_translations")
    .select("content").eq("section_id", GALLERY_SECTION).eq("locale", locale).single();
  const content = { ...(row?.content ?? {}), media_ids: mediaIds };
  const { error } = await supabase.from("page_section_translations")
    .update({ content }).eq("section_id", GALLERY_SECTION).eq("locale", locale);
  if (error) { console.error(`✗ section ${locale}: ${error.message}`); process.exit(1); }
  console.log(`✓ about gallery ${locale} → ${mediaIds.length} photo(s)`);
}
console.log("\n✓ done.");
