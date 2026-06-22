/**
 * Upload page hero images to the Supabase `media` bucket under `hero/…`.
 *
 * Heroes are referenced by a fixed storage path (no DB rows) — the views build
 * the URL with storageUrl("media", "hero/<…>.webp"). Drop files mirroring that
 * layout under media-import/_hero/ and run this:
 *
 *   media-import/_hero/about.webp                 → media/hero/about.webp
 *   media-import/_hero/contact.webp               → media/hero/contact.webp
 *   media-import/_hero/products.webp              → media/hero/products.webp
 *   media-import/_hero/categories/windows.webp    → media/hero/categories/windows.webp
 *   …categories/<key>.webp  (keys: windows, doors, sliding-systems, facades,
 *                            glass, hardware-mechanisms, shading-shutters)
 *
 * Re-runnable (overwrites). Dry-run by default.
 *
 * Usage:
 *   node scripts/ingest-hero.mjs            # DRY RUN
 *   node scripts/ingest-hero.mjs --apply
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { resolve, join, relative, sep } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { mimeFromExt } from "./lib/image-dimensions.mjs";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const DIR = join(ROOT, "media-import", "_hero");
const IMG_RE = /\.(webp|jpe?g|png|avif)$/i;

function loadEnvLocal() {
  const env = {};
  const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (IMG_RE.test(name)) out.push(p);
  }
  return out;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing Supabase env in .env.local"); process.exit(1); }
if (!existsSync(DIR)) {
  console.error(`No ${DIR} — create media-import/_hero/ and drop hero webps in it.`);
  process.exit(1);
}

console.log(`Hero ingest · target: ${new URL(url).host} · mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const files = walk(DIR);
if (files.length === 0) { console.error("No image files under media-import/_hero/"); process.exit(1); }

let ok = 0;
for (const file of files) {
  const storagePath = `hero/${relative(DIR, file).split(sep).join("/")}`;
  const mime = mimeFromExt(file);
  console.log(`  ${storagePath}  (${mime})`);
  if (!APPLY) continue;
  const { error } = await supabase.storage.from("media")
    .upload(storagePath, readFileSync(file), { contentType: mime, upsert: true });
  if (error) { console.error(`  ✗ ${storagePath}: ${error.message}`); process.exit(1); }
  ok++;
}

if (!APPLY) console.log(`\nDRY RUN — ${files.length} file(s) would upload. Re-run with --apply.`);
else console.log(`\n✓ uploaded ${ok} hero image(s) to media/hero/.`);
