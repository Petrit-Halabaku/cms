"use server";

import { requireEditor } from "@/lib/admin/auth";
import type { ActionResult } from "@/lib/admin/actions/products";
import { revalidateSite } from "@/lib/admin/revalidate";

export async function setProductBrochure(
  productId: string,
  path: string | null,
): Promise<ActionResult> {
  const { supabase } = await requireEditor();

  // Read the old reference before saving; clean up only after the new reference is persisted.
  const { data: current, error: readError } = await supabase
    .from("projects")
    .select("brochure_url")
    .eq("id", productId)
    .single();
  if (readError) return { ok: false, error: readError.message };

  const { error } = await supabase
    .from("projects")
    .update({ brochure_url: path })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };

  await revalidateSite();
  if (current?.brochure_url && current.brochure_url !== path && !current.brochure_url.startsWith("http")) {
    const { error: cleanupError } = await supabase.storage.from("brochures").remove([current.brochure_url]);
    if (cleanupError) console.error("Brochure saved; old file cleanup failed", cleanupError.name);
  }
  return { ok: true, id: productId };
}
