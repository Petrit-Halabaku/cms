"use server";

import { z } from "zod";

import { requireEditor } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/actions/products";

const faqSchema = z.object({
  id: z.string().uuid().optional(),
  sortOrder: z.number().int(),
  translations: z.object({
    en: z.object({ question: z.string().min(1), answer: z.string().min(1) }),
    sq: z.object({ question: z.string().min(1), answer: z.string().min(1) }),
  }),
});

export type FaqPayload = z.infer<typeof faqSchema>;

export async function saveFaq(payload: FaqPayload): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const parsed = faqSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Question and answer are required in both languages." };
  }
  const data = parsed.data;

  let faqId = data.id;
  if (faqId) {
    const { error } = await supabase
      .from("faqs")
      .update({ sort_order: data.sortOrder })
      .eq("id", faqId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: inserted, error } = await supabase
      .from("faqs")
      .insert({ sort_order: data.sortOrder })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    faqId = inserted.id;
  }

  for (const locale of ["en", "sq"] as const) {
    const t = data.translations[locale];
    const { error } = await supabase.from("faq_translations").upsert(
      { faq_id: faqId, locale, question: t.question, answer: t.answer },
      { onConflict: "faq_id,locale" },
    );
    if (error) return { ok: false, error: error.message };
  }

  await revalidateSite();
  return { ok: true, id: faqId! };
}

export async function deleteFaq(id: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await revalidateSite();
  return { ok: true, id };
}

export async function reorderFaqs(orderedIds: string[]): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase.from("faqs").update({ sort_order: index + 1 }).eq("id", id);
    if (error) return { ok: false, error: error.message };
  }
  await revalidateSite();
  return { ok: true, id: "faqs" };
}
