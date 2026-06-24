/**
 * Link product images you uploaded to media/products/<slug>/ (e.g. via the
 * Supabase dashboard) to their products — creates the media rows + project_images
 * links the app needs to display them. Uses the SAME storage layout as
 * scripts/ingest-media.mjs (products/<slug>/<file>), so display is identical.
 *
 * Upload convention (dashboard): bucket `media` → folder `products` → subfolder
 * named exactly the product slug (from image-manifest.json) → files 01.webp,
 * 02.webp, … (alphabetical order; the first is the featured image).
 *
 * Re-runnable: media rows upsert by storage_path; a product's project_images are
 * rebuilt from its folder each run.
 *
 * Usage:
 *   node scripts/link-product-media.mjs                       # DRY RUN (lists what it'd link)
 *   node scripts/link-product-media.mjs --apply
 *   node scripts/link-product-media.mjs --slug alumil-smartia-s77 --apply
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { imageSize, mimeFromExt } from "./lib/image-dimensions.mjs";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const onlySlug = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1]
  ?? (process.argv.includes("--slug") ? process.argv[process.argv.indexOf("--slug") + 1] : null);
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

console.log(`Link product media · target: ${new URL(url).host} · mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

// Map products: slug -> { projectId, altEn, altSq }
const { data: en } = await supabase.from("project_translations").select("project_id, slug, title").eq("locale", "en");
const { data: sq } = await supabase.from("project_translations").select("project_id, title").eq("locale", "sq");
const sqTitle = new Map((sq ?? []).map((r) => [r.project_id, r.title]));
let products = (en ?? []).map((r) => ({ slug: r.slug, projectId: r.project_id, altEn: r.title, altSq: sqTitle.get(r.project_id) ?? r.title }));
if (onlySlug) products = products.filter((p) => p.slug === onlySlug);

let linked = 0, totalImgs = 0;
const empty = [];

for (const p of products) {
  const { data: files, error } = await supabase.storage.from("media")
    .list(`products/${p.slug}`, { limit: 100, sortBy: { column: "name", order: "asc" } });
  if (error) { console.error(`✗ list ${p.slug}: ${error.message}`); process.exit(1); }
  const imgs = (files ?? []).filter((f) => f.id !== null && IMG_RE.test(f.name));
  if (imgs.length === 0) { empty.push(p.slug); continue; }

  console.log(`\n${p.slug} → ${imgs.length} image(s): ${imgs.map((f) => f.name).join(", ")}`);
  totalImgs += imgs.length;
  if (!APPLY) continue;

  const mediaIds = [];
  for (const f of imgs) {
    const storagePath = `products/${p.slug}/${f.name}`;
    // Download to read real pixel dimensions (better CLS) + mime.
    const { data: blob, error: dErr } = await supabase.storage.from("media").download(storagePath);
    if (dErr) { console.error(`  ✗ download ${storagePath}: ${dErr.message}`); process.exit(1); }
    const buf = Buffer.from(await blob.arrayBuffer());
    const dim = imageSize(buf);
    const mime = f.metadata?.mimetype || mimeFromExt(f.name);
    const { data: media, error: mErr } = await supabase.from("media")
      .upsert({ storage_path: storagePath, alt_en: p.altEn, alt_sq: p.altSq, width: dim?.width ?? null, height: dim?.height ?? null, mime_type: mime }, { onConflict: "storage_path" })
      .select("id").single();
    if (mErr) { console.error(`  ✗ media row ${storagePath}: ${mErr.message}`); process.exit(1); }
    mediaIds.push(media.id);
  }

  await supabase.from("project_images").delete().eq("project_id", p.projectId);
  const rows = mediaIds.map((mid, i) => ({ project_id: p.projectId, media_id: mid, sort_order: i + 1, is_featured: i === 0 }));
  const { error: piErr } = await supabase.from("project_images").insert(rows);
  if (piErr) { console.error(`  ✗ project_images ${p.slug}: ${piErr.message}`); process.exit(1); }
  linked++;
}

console.log(`\n${APPLY ? "Linked" : "Would link"}: ${totalImgs} image(s) across ${APPLY ? linked : products.length - empty.length} product(s).`);
if (empty.length) console.log(`No images in products/<slug>/ for ${empty.length} product(s): ${empty.join(", ")}`);
if (!APPLY) console.log("\nDRY RUN — re-run with --apply to create the links.");
