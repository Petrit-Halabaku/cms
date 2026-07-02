"use server";

import { requireEditor } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/actions/products";

const IMAGE_RE = /\.(webp|jpe?g|png|avif)$/i;

async function nextSortOrder(
  supabase: Awaited<ReturnType<typeof requireEditor>>["supabase"],
  gallery: string,
): Promise<number> {
  const { data } = await supabase
    .from("gallery_images")
    .select("sort_order")
    .eq("gallery", gallery)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.sort_order ?? -1) + 1;
}

/** Append an uploaded image to a gallery (after the browser stored the file). */
export async function addGalleryImage(
  gallery: string,
  storagePath: string,
  alt: string,
): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const sortOrder = await nextSortOrder(supabase, gallery);
  const { data, error } = await supabase
    .from("gallery_images")
    .insert({ gallery, storage_path: storagePath, alt: alt || null, sort_order: sortOrder })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  await revalidateSite();
  return { ok: true, id: data.id };
}

/** Remove an image from a gallery (and delete its file from storage). */
export async function deleteGalleryImage(id: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { data: row } = await supabase
    .from("gallery_images")
    .select("storage_path")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase.from("gallery_images").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  if (row?.storage_path) await supabase.storage.from("media").remove([row.storage_path]);
  await revalidateSite();
  return { ok: true, id };
}

/** Update an image's alt text. */
export async function updateGalleryAlt(id: string, alt: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { error } = await supabase
    .from("gallery_images")
    .update({ alt: alt || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await revalidateSite();
  return { ok: true, id };
}

/** Persist a new order — each id's index becomes its sort_order. */
export async function reorderGallery(orderedIds: string[]): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from("gallery_images")
      .update({ sort_order: i })
      .eq("id", orderedIds[i]);
    if (error) return { ok: false, error: error.message };
  }
  await revalidateSite();
  return { ok: true, id: orderedIds[0] ?? "" };
}

type ImportResult =
  | { ok: true; created: { id: string; path: string; alt: string }[] }
  | { ok: false; error: string };

/** One-off: pull any existing storage-folder photos into the managed gallery. */
export async function importGalleryFromFolder(
  gallery: string,
  folder: string,
): Promise<ImportResult> {
  const { supabase } = await requireEditor();
  const [{ data: files }, { data: existing }] = await Promise.all([
    supabase.storage.from("media").list(folder, {
      limit: 100,
      sortBy: { column: "name", order: "asc" },
    }),
    supabase.from("gallery_images").select("storage_path").eq("gallery", gallery),
  ]);
  const have = new Set((existing ?? []).map((r) => r.storage_path));
  let order = await nextSortOrder(supabase, gallery);
  const rows = (files ?? [])
    .filter((o) => o.id && IMAGE_RE.test(o.name))
    .map((o) => `${folder}/${o.name}`)
    .filter((path) => !have.has(path))
    .map((path) => ({ gallery, storage_path: path, alt: null, sort_order: order++ }));
  let created: { id: string; path: string; alt: string }[] = [];
  if (rows.length > 0) {
    const { data: inserted, error } = await supabase
      .from("gallery_images")
      .insert(rows)
      .select("id, storage_path, alt");
    if (error) return { ok: false, error: error.message };
    created = (inserted ?? []).map((r) => ({ id: r.id, path: r.storage_path, alt: r.alt ?? "" }));
  }
  await revalidateSite();
  return { ok: true, created };
}
