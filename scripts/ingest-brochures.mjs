/**
 * Ingest product datasheets into the Supabase `brochures` bucket and set
 * projects.brochure_url (a bucket path, matching the admin flow).
 *
 * This is a DEV-TIME, one-off script — it is NEVER part of `next build` / CI /
 * runtime. Sources per product, in priority order:
 *   1. brochure-import/<slug>/*.pdf            — user-curated local files
 *   2. local Stoma AV datasheet (CMS-MATERIALS) — for the AV product
 *   3. datasheet_pdfs URLs in materials-final2.json — fetched here, one time only
 *
 * A dead/unreachable URL just leaves that product without a brochure (it stays
 * published with text + specs). Idempotent: re-uploads to the same path.
 *
 * Usage:
 *   node scripts/ingest-brochures.mjs           # DRY RUN (no fetch, no writes)
 *   node scripts/ingest-brochures.mjs --apply
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "./lib/slugify.mjs";
import { PRODUCTS } from "./lib/catalog.mjs";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const MATERIALS_DIR = process.env.MATERIALS_DIR ?? "/Users/petrithalabaku/personal/PROJECTS/CMS-MATERIALS";
const SOURCE = process.env.MATERIALS_JSON ?? join(MATERIALS_DIR, "materials-final2.json");
const AV_LOCAL_PDF = join(MATERIALS_DIR, "av-900-av-700-en-web (2).pdf");
const BROCHURE_IMPORT = join(ROOT, "brochure-import");

function loadEnvLocal() {
  const env = {};
  const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function readCatalog(json) {
  const out = [];
  for (const subs of Object.values(json.catalog ?? {}))
    for (const list of Object.values(subs ?? {}))
      for (const product of list ?? []) out.push(product);
  return out;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("Missing Supabase env in .env.local"); process.exit(1); }

console.log(`Brochure ingest · target: ${new URL(url).host} · mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const products = readCatalog(JSON.parse(readFileSync(SOURCE, "utf8")));

// Resolve a source for each product: { slug, kind, ref, filename }.
const tasks = [];
for (const product of products) {
  const meta = PRODUCTS[product.name] ?? {};
  const slug = meta.slug ?? slugify(product.name);
  const localDir = join(BROCHURE_IMPORT, slug);
  const localPdfs = existsSync(localDir) ? readdirSync(localDir).filter((f) => f.toLowerCase().endsWith(".pdf")).sort() : [];
  if (localPdfs.length) {
    tasks.push({ slug, kind: "local", ref: join(localDir, localPdfs[0]), filename: localPdfs[0] });
  } else if (slug === "stoma-av-900-and-av-700" && existsSync(AV_LOCAL_PDF)) {
    tasks.push({ slug, kind: "local", ref: AV_LOCAL_PDF, filename: "av-900-av-700.pdf" });
  } else if ((product.datasheet_pdfs ?? []).length) {
    tasks.push({ slug, kind: "url", ref: product.datasheet_pdfs[0], filename: "datasheet.pdf" });
  }
}

console.log(`\n${tasks.length} product(s) with a datasheet source:`);
for (const t of tasks) console.log(`  ${t.slug.padEnd(36)} ${t.kind.toUpperCase()}  ${t.ref}`);

if (!APPLY) { console.log("\nDRY RUN — no fetch, no upload. Re-run with --apply."); process.exit(0); }

let ok = 0, failed = 0;
for (const t of tasks) {
  let buf;
  try {
    if (t.kind === "local") {
      buf = readFileSync(t.ref);
    } else {
      const res = await fetch(t.ref, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      buf = Buffer.from(await res.arrayBuffer());
    }
  } catch (e) {
    console.warn(`⚠ ${t.slug}: could not get datasheet (${e.message}) — left without brochure`);
    failed++;
    continue;
  }

  const storagePath = `${t.slug}/${t.filename}`;
  const { error: upErr } = await supabase.storage.from("brochures")
    .upload(storagePath, buf, { contentType: "application/pdf", upsert: true });
  if (upErr) { console.error(`✗ ${t.slug} upload: ${upErr.message}`); failed++; continue; }

  const { data: trs } = await supabase.from("project_translations").select("project_id").eq("slug", t.slug).limit(1);
  if (!trs?.length) { console.warn(`⚠ ${t.slug}: no product row — uploaded but not linked`); continue; }
  const { error: updErr } = await supabase.from("projects").update({ brochure_url: storagePath }).eq("id", trs[0].project_id);
  if (updErr) { console.error(`✗ ${t.slug} link: ${updErr.message}`); failed++; continue; }
  console.log(`✓ ${t.slug} → brochures/${storagePath}`);
  ok++;
}

console.log(`\nApplied: ${ok} brochure(s) set, ${failed} failed/skipped.`);
