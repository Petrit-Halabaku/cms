"use server";

import { z } from "zod";

import { requireEditor } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/actions/products";

const mediaRecordSchema = z.object({
  storagePath: z.string().min(1),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  mimeType: z.string().min(1),
  altEn: z.string().optional(),
  altSq: z.string().optional(),
});

/** Register a media row after the browser uploaded the file to Storage. */
export async function createMediaRecord(
  payload: z.infer<typeof mediaRecordSchema>,
): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const parsed = mediaRecordSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Invalid media data" };

  const { data, error } = await supabase
    .from("media")
    .insert({
      storage_path: parsed.data.storagePath,
      width: parsed.data.width,
      height: parsed.data.height,
      mime_type: parsed.data.mimeType,
      alt_en: parsed.data.altEn || null,
      alt_sq: parsed.data.altSq || null,
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id };
}

export async function updateMediaAlt(
  id: string,
  altEn: string,
  altSq: string,
): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { error } = await supabase
    .from("media")
    .update({ alt_en: altEn || null, alt_sq: altSq || null })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  await revalidateSite();
  return { ok: true, id };
}

/** Delete a media row + its file — blocked while anything references it. */
export async function deleteMedia(id: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();

  const [{ count: imageRefs }, { count: partnerRefs }, gallerySections] =
    await Promise.all([
      supabase.from("project_images").select("*", { count: "exact", head: true }).eq("media_id", id),
      supabase.from("partners").select("*", { count: "exact", head: true }).eq("logo_media_id", id),
      supabase.from("page_section_translations").select("section_id, content"),
    ]);

  const galleryRefs = (gallerySections.data ?? []).filter((row) => {
    const content = row.content as { media_ids?: unknown };
    return Array.isArray(content?.media_ids) && content.media_ids.includes(id);
  }).length;

  const total = (imageRefs ?? 0) + (partnerRefs ?? 0) + galleryRefs;
  if (total > 0) {
    const parts = [
      imageRefs ? `${imageRefs} product image(s)` : null,
      partnerRefs ? `${partnerRefs} partner logo(s)` : null,
      galleryRefs ? `${galleryRefs} page gallery section(s)` : null,
    ].filter(Boolean);
    return { ok: false, error: `Cannot delete: still used by ${parts.join(", ")}.` };
  }

  const { data: row, error: fetchError } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", id)
    .single();
  if (fetchError) return { ok: false, error: fetchError.message };

  const { error } = await supabase.from("media").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  const { error: storageError } = await supabase.storage.from("media").remove([row.storage_path]);
  if (storageError) {
    // Row is gone; orphaned file is harmless but report it.
    return { ok: false, error: `Record deleted but file removal failed: ${storageError.message}` };
  }
  return { ok: true, id };
}
