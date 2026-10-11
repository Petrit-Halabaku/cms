/**
 * Read-only check for media rows whose Storage object is missing. No writes.
 *
 * A `media` row and its file in the `media` bucket can drift apart when an
 * object is deleted out-of-band (e.g. the Supabase dashboard) — the row
 * survives, and `next/image` then fails with
 * "upstream image response failed … 400" (Storage answers NoSuchKey).
 *
 * Usage: node scripts/verify-media.mjs
 * Exits 1 when any row is broken, so it can gate a deploy.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const env = {};
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}
const env = loadEnvLocal();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const CONCURRENCY = 12;

/** Public URL of a `media` object — same shape as storageUrl() in src/lib/site.ts. */
const publicUrl = (path) =>
  `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

/** Resolves to an HTTP status (or a transport error string) for one row. */
async function probe(row) {
  try {
    // Storage has no cheap HEAD for public objects; GET + immediate abort is
    // enough to learn the status without downloading the body.
    const controller = new AbortController();
    const res = await fetch(publicUrl(row.storage_path), { signal: controller.signal });
    controller.abort();
    return { ...row, status: res.status };
  } catch (err) {
    return { ...row, status: err instanceof Error ? err.message : String(err) };
  }
}

/** Map over `items` with a bounded number of in-flight requests. */
async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

const { data: rows, error } = await supabase
  .from("media")
  .select("id, storage_path, created_at")
  .order("created_at");
if (error) {
  console.error(`ERR reading media: ${error.message}`);
  process.exit(1);
}

const results = await mapLimit(rows, CONCURRENCY, probe);
const broken = results.filter((r) => r.status !== 200);

console.log(`Checked ${results.length} media row(s) against the media bucket.`);
if (broken.length === 0) {
  console.log("✓ Every media row resolves to a Storage object.");
  process.exit(0);
}

console.log(`\n✗ ${broken.length} row(s) point at a missing object:\n`);

// Report what still references each orphan — the same three reference sites
// deleteMedia() guards on, so the output says whether the public site is hit.
const { data: sections } = await supabase
  .from("page_section_translations")
  .select("section_id, content");

for (const row of broken) {
  const [{ count: imageRefs }, { count: partnerRefs }] = await Promise.all([
    supabase.from("project_images").select("*", { count: "exact", head: true }).eq("media_id", row.id),
    supabase.from("partners").select("*", { count: "exact", head: true }).eq("logo_media_id", row.id),
  ]);
  const galleryRefs = (sections ?? []).filter((s) => {
    const ids = s.content?.media_ids;
    return Array.isArray(ids) && ids.includes(row.id);
  }).length;

  const refs = [
    imageRefs ? `${imageRefs} product image(s)` : null,
    partnerRefs ? `${partnerRefs} partner logo(s)` : null,
    galleryRefs ? `${galleryRefs} page gallery section(s)` : null,
  ].filter(Boolean);

  console.log(`  ${row.storage_path}  [${row.status}]`);
  console.log(`    id: ${row.id}  uploaded: ${row.created_at.slice(0, 19)}`);
  console.log(`    ${refs.length ? `referenced by ${refs.join(", ")} — renders on the public site` : "unreferenced — only shows in the admin Media Library"}`);
}

console.log("\nFix: re-upload the file to that exact path, or detach the references and delete the row.");
process.exit(1);
