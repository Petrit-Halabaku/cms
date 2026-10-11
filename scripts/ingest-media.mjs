/**
 * Ingest curated product images into the Supabase `media` bucket + project_images.
 *
 * Drop .webp files anywhere under  media-import/<product-slug>/...  — top-level files
 * (e.g. a `<slug>-header.webp`) become the featured image; everything in nested
 * folders (e.g. `gallery/`, `gallery/diagrams/`) is pulled in too, in folder order,
 * with its relative path preserved under products/<slug>/... in storage.
 * Only WebP is uploaded; convert or export other formats before ingest.
 * Re-runnable: media rows upsert by storage_path; a product's project_images are
 * rebuilt from its folder each run, so adding files just extends the gallery.
 *
 * Usage:
 *   node scripts/ingest-media.mjs                         # DRY RUN (no writes)
 *   node scripts/ingest-media.mjs --apply
 *   node scripts/ingest-media.mjs --slug stoma-av-900-and-av-700 --apply
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join, relative } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { imageSize, mimeFromExt } from "./lib/image-dimensions.mjs";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const onlySlug = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1]
  ?? (process.argv.includes("--slug") ? process.argv[process.argv.indexOf("--slug") + 1] : null);
const IMPORT_DIR = join(ROOT, "media-import");
const IMG_RE = /\.webp$/i;

// Recursively collects image files under `dir`, returning paths relative to `dir`
// (posix-separated), ordered root-first so a top-level header file sorts before
// anything in a subfolder like gallery/ — that file becomes the featured image.
function walkImages(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walkImages(full, base));
    } else if (IMG_RE.test(entry)) {
      out.push(relative(base, full).split("\\").join("/"));
    }
  }
  return out.sort((a, b) => {
    const depthDiff = a.split("/").length - b.split("/").length;
    return depthDiff !== 0 ? depthDiff : a.localeCompare(b);
  });
}

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
if (!existsSync(IMPORT_DIR)) { console.error(`No media-import/ directory — run import-catalog first.`); process.exit(1); }

console.log(`Media ingest · target: ${new URL(url).host} · mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const slugs = (onlySlug ? [onlySlug] : readdirSync(IMPORT_DIR))
  .filter((d) => statSync(join(IMPORT_DIR, d)).isDirectory());

let uploaded = 0, linkedProducts = 0, emptyFolders = 0;
const failed = [];
const MAX_BYTES = 25 * 1024 * 1024; // soft warn — actual limit is the bucket's
for (const slug of slugs) {
  const folder = join(IMPORT_DIR, slug);
  const files = walkImages(folder);
  if (!files.length) { emptyFolders++; continue; }

  const { data: trs, error: trErr } = await supabase
    .from("project_translations").select("project_id, locale, title").eq("slug", slug);
  if (trErr) { console.error(`✗ ${slug}: ${trErr.message}`); process.exit(1); }
  if (!trs?.length) { console.warn(`⚠ ${slug}: no product with this slug — skipping`); continue; }
  const projectId = trs[0].project_id;
  const altEn = trs.find((t) => t.locale === "en")?.title ?? slug;
  const altSq = trs.find((t) => t.locale === "sq")?.title ?? altEn;

  console.log(`\n${slug} → ${files.length} file(s)`);
  const mediaIds = [];
  for (const file of files) {
    const buf = readFileSync(join(folder, file));
    const dim = imageSize(buf);
    const mime = mimeFromExt(file);
    const storagePath = `products/${slug}/${file}`;
    const kb = Math.round(buf.length / 1024);
    const big = buf.length > MAX_BYTES ? "  ⚠ large" : "";
    console.log(`  ${file}  ${dim ? `${dim.width}×${dim.height}` : "(dims?)"} ${mime} ${kb}KB${big}`);
    if (!APPLY) continue;

    // Skip-and-continue: a single failed file (e.g. exceeds the bucket size
    // limit) must not abort the whole run — log it and move on.
    const { error: upErr } = await supabase.storage.from("media")
      .upload(storagePath, buf, { contentType: mime, upsert: true });
    if (upErr) { console.warn(`  ⚠ skipped (upload): ${file} — ${upErr.message}`); failed.push(`${slug}/${file} — ${upErr.message}`); continue; }
    const { data: media, error: mErr } = await supabase.from("media")
      .upsert({ storage_path: storagePath, alt_en: altEn, alt_sq: altSq, width: dim?.width ?? null, height: dim?.height ?? null, mime_type: mime }, { onConflict: "storage_path" })
      .select("id").single();
    if (mErr) { console.warn(`  ⚠ skipped (media row): ${file} — ${mErr.message}`); failed.push(`${slug}/${file} — ${mErr.message}`); continue; }
    mediaIds.push(media.id);
    uploaded++;
  }

  if (APPLY && mediaIds.length) {
    await supabase.from("project_images").delete().eq("project_id", projectId);
    const rows = mediaIds.map((mid, i) => ({ project_id: projectId, media_id: mid, sort_order: i + 1, is_featured: i === 0 }));
    const { error: piErr } = await supabase.from("project_images").insert(rows);
    if (piErr) { console.error(`  ✗ project_images: ${piErr.message}`); process.exit(1); }
    linkedProducts++;
  }
}

console.log(`\n${APPLY ? "Applied" : "Dry run"}: ${uploaded} image(s) ${APPLY ? "uploaded" : "found"}, ${linkedProducts} product(s) linked, ${emptyFolders} empty folder(s).`);
if (failed.length) {
  console.log(`\n⚠ ${failed.length} file(s) skipped (run completed despite these):`);
  for (const f of failed) console.log(`  ${f}`);
  console.log("\nIf these are size errors, raise the `media` bucket's file size limit in the");
  console.log("Supabase dashboard (Storage → media → Settings), or downscale the source image.");
}
if (!APPLY) console.log("Re-run with --apply to upload.");
