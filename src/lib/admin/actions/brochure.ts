"use server";

import { requireEditor } from "@/lib/admin/auth";
import type { ActionResult } from "@/lib/admin/actions/products";
import { revalidateSite } from "@/lib/admin/revalidate";

export async function setProductBrochure(
  productId: string,
  path: string | null,
): Promise<ActionResult> {
  const { supabase } = await requireEditor();

  // Remove the old file when replacing or clearing.
  const { data: current } = await supabase
    .from("projects")
    .select("brochure_url")
    .eq("id", productId)
    .single();
  if (current?.brochure_url && !current.brochure_url.startsWith("http")) {
    await supabase.storage.from("brochures").remove([current.brochure_url]);
  }

  const { error } = await supabase
    .from("projects")
    .update({ brochure_url: path })
    .eq("id", productId);
  if (error) return { ok: false, error: error.message };

  await revalidateSite();
  return { ok: true, id: productId };
}
