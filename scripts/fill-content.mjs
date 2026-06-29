/**
 * Phase 4 content fill — replaces the marketing-copy "TODO: content migration"
 * placeholders in page SEO descriptions, page sections and FAQ answers with the
 * bilingual copy in lib/site-content.mjs. Idempotent. DRY RUN by default.
 *
 * Does NOT touch contact details (phone/address/hours) or the years/projects
 * counter figures — those are owner-confirmed and stay flagged.
 *
 * Usage:
 *   node scripts/fill-content.mjs            # DRY RUN
 *   node scripts/fill-content.mjs --apply
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PAGES_SEO, SECTIONS, FAQS } from "./lib/site-content.mjs";

const ROOT = process.cwd();
const APPLY = process.argv.includes("--apply");

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

console.log(`Content fill · target: ${new URL(url).host} · mode: ${APPLY ? "APPLY" : "DRY RUN"}`);
const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
const run = async (label, q) => {
  const { error } = await q;
  if (error) { console.error(`✗ ${label}: ${error.message}`); process.exit(1); }
  console.log(`✓ ${label}`);
};

let pages = 0, sections = 0, faqs = 0;

// 1. Page SEO descriptions
for (const [pageId, copy] of Object.entries(PAGES_SEO)) {
  for (const locale of ["en", "sq"]) {
    pages++;
    if (APPLY) {
      await run(`page seo ${pageId.slice(-3)} ${locale}`, supabase
        .from("page_translations").update({ seo_description: copy[locale] })
        .eq("page_id", pageId).eq("locale", locale));
    }
  }
}

// 2. Page section content (full overwrite, or patch-merge to keep contact fields)
for (const [sectionId, def] of Object.entries(SECTIONS)) {
  const { data: rows, error } = await supabase
    .from("page_section_translations").select("locale, content").eq("section_id", sectionId);
  if (error) { console.error(`✗ fetch ${sectionId}: ${error.message}`); process.exit(1); }
  for (const locale of ["en", "sq"]) {
    const existing = rows?.find((r) => r.locale === locale)?.content ?? {};
    const next = def.mode === "patch" ? { ...existing, ...def[locale] } : def[locale];
    sections++;
    if (!APPLY) continue;
    await run(`section ${sectionId.slice(-3)} ${locale} (${def.mode})`, supabase
      .from("page_section_translations").update({ content: next })
      .eq("section_id", sectionId).eq("locale", locale));
  }
}

// 3. FAQ answers
for (const [faqId, copy] of Object.entries(FAQS)) {
  for (const locale of ["en", "sq"]) {
    faqs++;
    if (APPLY) {
      await run(`faq ${faqId.slice(-3)} ${locale}`, supabase
        .from("faq_translations").update({ answer: copy[locale] })
        .eq("faq_id", faqId).eq("locale", locale));
    }
  }
}

console.log(`\n${APPLY ? "Applied" : "Would update"}: ${pages} page-SEO rows, ${sections} section rows, ${faqs} FAQ rows.`);
console.log("Left untouched (owner-confirmed): contact details (phone/address/hours), years/projects counters.");
console.log("SQ copy is translator-authored — native review recommended before launch.");
if (!APPLY) console.log("\nDRY RUN — re-run with --apply to write.");
