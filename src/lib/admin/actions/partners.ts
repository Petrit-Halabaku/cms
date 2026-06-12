"use server";

import { z } from "zod";

import { requireEditor } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/actions/products";

const partnerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Must be a valid URL").nullable().or(z.literal("").transform(() => null)),
  logoMediaId: z.string().uuid().nullable(),
  sortOrder: z.number().int(),
});

export type PartnerPayload = z.infer<typeof partnerSchema>;

export async function savePartner(payload: PartnerPayload): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const parsed = partnerSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;
  const row = {
    name: data.name,
    url: data.url,
    logo_media_id: data.logoMediaId,
    sort_order: data.sortOrder,
  };

  if (data.id) {
    const { error } = await supabase.from("partners").update(row).eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    await revalidateSite();
    return { ok: true, id: data.id };
  }
  const { data: inserted, error } = await supabase
    .from("partners")
    .insert(row)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  await revalidateSite();
  return { ok: true, id: inserted.id };
}

export async function deletePartner(id: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await revalidateSite();
  return { ok: true, id };
}

export async function reorderPartners(orderedIds: string[]): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from("partners")
      .update({ sort_order: index + 1 })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
  }
  await revalidateSite();
  return { ok: true, id: "partners" };
}
