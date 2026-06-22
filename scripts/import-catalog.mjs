/**
 * Gergoci catalog import (Phase 1).
 *
 * Reads the source catalog JSON (dev-time only — never at runtime) and writes
 * 23 products into Supabase: projects + project_translations (EN + SQ) +
 * project_facts, linked to the clean-7 categories and to brand partners.
 * Replaces the 21 placeholder seed products and the 13 placeholder partners.
 * Scraper fields (extraction_note, source_url) are never read.
 *
 * Emits image-manifest.json (what images to source) and sq-review.json
 * (which Albanian rows need native review). Stages the local Stoma AV images
 * into media-import/<slug>/ for the ingest script.
 *
 * Usage:
 *   node scripts/import-catalog.mjs            # DRY RUN — no DB writes
 *   node scripts/import-catalog.mjs --apply    # write to the DB in .env.local
 *   node scripts/import-catalog.mjs --source /path/to/materials-final2.json
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { resolve, join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { slugify } from "./lib/slugify.mjs";
import { labelFor, formatValue, sqLabelIsFallback } from "./lib/spec-labels.mjs";
import {
  CATEGORIES, CATEGORY_BY_KEY, mapCategoryKey, deriveMaterial,
  BRAND_PARTNERS, normalizeBrand, PRODUCTS,
} from "./lib/catalog.mjs";

// --- config / args -----------------------------------------------------------
const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");
const sourceArg = process.argv.find((a) => a.startsWith("--source="))?.split("=")[1]
  ?? (process.argv.includes("--source") ? process.argv[process.argv.indexOf("--source") + 1] : null);
const MATERIALS_DIR = process.env.MATERIALS_DIR
  ?? "/Users/petrithalabaku/personal/PROJECTS/CMS-MATERIALS";
const SOURCE = sourceArg ?? join(MATERIALS_DIR, "materials-final2.json");

const PLACEHOLDER_PROJECT_IDS = Array.from({ length: 21 }, (_, i) =>
  `b0000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`);
const PLACEHOLDER_PARTNER_IDS = Array.from({ length: 13 }, (_, i) =>
  `f0000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`);

const PROJECT_NS = "9f1b2c3d-0000-4000-8000-000000000001"; // fixed namespace for v5 ids

// --- helpers -----------------------------------------------------------------
function loadEnvLocal() {
  const env = {};
  const raw = readFileSync(resolve(ROOT, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

function uuidv5(name, namespace) {
  const ns = Buffer.from(namespace.replace(/-/g, ""), "hex");
  const hash = createHash("sha1").update(Buffer.concat([ns, Buffer.from(name, "utf8")])).digest();
  const b = hash.subarray(0, 16);
  b[6] = (b[6] & 0x0f) | 0x50;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function readCatalogProducts(json) {
  const out = [];
  for (const [category, subs] of Object.entries(json.catalog ?? {})) {
    for (const [subcategory, list] of Object.entries(subs ?? {})) {
      for (const product of list ?? []) out.push({ category, subcategory, product });
    }
  }
  return out;
}

function buildFacts(specs, brandName, material, compat, locale) {
  const facts = [];
  let order = 1;
  if (brandName) facts.push({ label: locale === "sq" ? "Marka" : "Brand", value: brandName, sort_order: order++ });
  if (material) facts.push({ label: locale === "sq" ? "Materiali" : "Material", value: locale === "sq" ? material.sq : material.en, sort_order: order++ });
  for (const [key, val] of Object.entries(specs ?? {})) {
    const value = formatValue(val);
    if (!value) continue;
    facts.push({ label: labelFor(key, locale), value, sort_order: order++ });
  }
  if (compat) facts.push({ label: locale === "sq" ? "Kompatibël me" : "Compatible with", value: compat, sort_order: order++ });
  return facts;
}

// --- main --------------------------------------------------------------------
const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

console.log("─".repeat(70));
console.log(`Catalog import  ·  target: ${new URL(url).host}  ·  mode: ${APPLY ? "APPLY (writes)" : "DRY RUN (no writes)"}`);
console.log(`Source: ${SOURCE}`);
console.log("─".repeat(70));

const json = JSON.parse(readFileSync(SOURCE, "utf8"));
const rows = readCatalogProducts(json);
if (rows.length !== 23) console.warn(`⚠ expected 23 products, found ${rows.length}`);

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
async function run(label, promise) {
  const { error } = await promise;
  if (error) { console.error(`✗ ${label}: ${error.message}`); process.exit(1); }
  console.log(`✓ ${label}`);
}

// Build the planned product set in memory first (for dry-run preview).
const sqReview = [];
const manifest = [];
const perCategoryCount = {};
const planned = [];

for (const { category, subcategory, product } of rows) {
  const meta = PRODUCTS[product.name] ?? {};
  const slug = meta.slug ?? slugify(product.name);
  const enrich = meta.enrich ?? null;
  const enTitle = meta.enTitle ?? product.name;
  const sqTitle = meta.sqTitle ?? enTitle;
  const enBody = enrich?.description ?? product.description ?? null;
  const sqBody = meta.sqBody ?? enBody;
  const categoryKey = mapCategoryKey(category, subcategory);
  const cat = CATEGORY_BY_KEY[categoryKey];
  const material = deriveMaterial(category);
  const brandName = normalizeBrand(enrich?.brand ?? product.brand);
  const partner = BRAND_PARTNERS.find((p) => p.name === brandName) ?? null;
  const specs = enrich?.specifications ?? product.specifications ?? {};
  const compat = enrich?.compatibility ?? product.compatibility ?? null;
  const imageUrls = enrich?.image_urls ?? product.image_urls ?? [];
  perCategoryCount[categoryKey] = (perCategoryCount[categoryKey] ?? 0) + 1;
  const sortOrder = perCategoryCount[categoryKey];
  const id = uuidv5(slug, PROJECT_NS);

  planned.push({
    id, slug, enTitle, sqTitle, enBody, sqBody, categoryKey, categoryId: cat.id,
    brandPartnerId: partner?.id ?? null, brandName, sortOrder,
    factsEn: buildFacts(specs, brandName, material, compat, "en"),
    factsSq: buildFacts(specs, brandName, material, compat, "sq"),
  });

  const fallbackKeys = Object.keys(specs).filter(sqLabelIsFallback);
  sqReview.push({
    slug, title: enTitle, fields: ["title", "body", "facts (values)"],
    spec_labels_in_english: fallbackKeys,
    note: "SQ title/body translator-authored; confirm with a native speaker. Spec values are shared EN/SQ; listed spec labels fell back to English.",
  });
  manifest.push({
    slug, title: enTitle, category: cat.en.name, folder: `media-import/${slug}`,
    image_count: imageUrls.length,
    image_urls: imageUrls,
    local_images: enrich?.localImages ?? [],
  });
}

// --- preview -----------------------------------------------------------------
console.log("\nPlanned products by category:");
for (const c of CATEGORIES) {
  const items = planned.filter((p) => p.categoryKey === c.key);
  if (!items.length) continue;
  console.log(`  ${c.en.name} (${items.length}): ${items.map((p) => p.slug).join(", ")}`);
}
console.log(`\nTotal: ${planned.length} products · ${planned.filter((p) => p.brandPartnerId).length} with brand link`);
const noImg = manifest.filter((m) => m.image_count === 0).map((m) => m.slug);
if (noImg.length) console.log(`Products with no source images (need sourcing): ${noImg.join(", ")}`);

// --- write informational artifacts (safe in both modes) ----------------------
writeFileSync(join(ROOT, "image-manifest.json"), JSON.stringify({ generated_for: "media-import", products: manifest }, null, 2));
writeFileSync(join(ROOT, "sq-review.json"), JSON.stringify({ note: "Albanian rows pending native-speaker review.", products: sqReview }, null, 2));
console.log("\n✓ wrote image-manifest.json and sq-review.json");

// Create media-import/<slug>/ folders and stage local Stoma AV images.
for (const p of planned) mkdirSync(join(ROOT, "media-import", p.slug), { recursive: true });
const av = PRODUCTS["AV-900 and AV-700 venetian blinds"];
if (av?.enrich?.localImages?.length) {
  const srcDir = join(MATERIALS_DIR, av.enrich.localImagesSubdir);
  let n = 1;
  for (const f of av.enrich.localImages) {
    const src = join(srcDir, f);
    const ext = f.split(".").pop();
    const dest = join(ROOT, "media-import", av.slug, `${String(n).padStart(2, "0")}.${ext}`);
    if (existsSync(src)) { copyFileSync(src, dest); n++; }
    else console.warn(`  ⚠ AV image not found: ${src}`);
  }
  console.log(`✓ staged ${n - 1} Stoma AV image(s) into media-import/${av.slug}/`);
}

if (!APPLY) {
  console.log("\nDRY RUN complete — no database changes were made. Re-run with --apply to write.");
  process.exit(0);
}

// --- DB writes (--apply) -----------------------------------------------------
console.log("\nApplying to database…");

// 1. Categories (rename/repurpose the clean 7).
await run("project_categories (7)", supabase.from("project_categories")
  .upsert(CATEGORIES.map((c) => ({ id: c.id, sort_order: c.sort })), { onConflict: "id" }));
await run("project_category_translations (14)", supabase.from("project_category_translations")
  .upsert(CATEGORIES.flatMap((c) => [
    { category_id: c.id, locale: "en", name: c.en.name, slug: c.en.slug, seo_title: `${c.en.name} | Gergoci` },
    { category_id: c.id, locale: "sq", name: c.sq.name, slug: c.sq.slug, seo_title: `${c.sq.name} | Gergoci` },
  ]), { onConflict: "category_id,locale" }));

// 2. Replace placeholder projects + partners.
await run("delete 21 placeholder projects", supabase.from("projects").delete().in("id", PLACEHOLDER_PROJECT_IDS));
await run("delete 13 placeholder partners", supabase.from("partners").delete().in("id", PLACEHOLDER_PARTNER_IDS));
await run("brand partners (8)", supabase.from("partners")
  .upsert(BRAND_PARTNERS.map((p) => ({ id: p.id, name: p.name, sort_order: p.sort })), { onConflict: "id" }));

// 3. Products.
for (const p of planned) {
  await run(`project ${p.slug}`, supabase.from("projects").upsert({
    id: p.id, category_id: p.categoryId, brand_partner_id: p.brandPartnerId,
    sort_order: p.sortOrder, published: true,
  }, { onConflict: "id" }));

  await run(`  translations ${p.slug}`, supabase.from("project_translations").upsert([
    { project_id: p.id, locale: "en", title: p.enTitle, slug: p.slug, body: p.enBody, seo_title: `${p.enTitle} | Gergoci`, seo_description: p.enBody ? p.enBody.slice(0, 300) : null },
    { project_id: p.id, locale: "sq", title: p.sqTitle, slug: p.slug, body: p.sqBody, seo_title: `${p.sqTitle} | Gergoci`, seo_description: p.sqBody ? p.sqBody.slice(0, 300) : null },
  ], { onConflict: "project_id,locale" }));

  // Facts: clean slate per product, then insert EN + SQ.
  await run(`  clear facts ${p.slug}`, supabase.from("project_facts").delete().eq("project_id", p.id));
  const factRows = [
    ...p.factsEn.map((f) => ({ project_id: p.id, locale: "en", ...f })),
    ...p.factsSq.map((f) => ({ project_id: p.id, locale: "sq", ...f })),
  ];
  await run(`  facts ${p.slug} (${factRows.length})`, supabase.from("project_facts").insert(factRows));
}

console.log(`\n✓ APPLY complete — ${planned.length} products imported to ${new URL(url).host}.`);
console.log("Next: fill media-import/<slug>/ folders (see image-manifest.json), then run scripts/ingest-media.mjs.");
