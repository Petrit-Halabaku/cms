"use server";

import { z } from "zod";

import { requireEditor } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/actions/products";

const translationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and dashes"),
  description: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

const categoryPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  sortOrder: z.number().int(),
  translations: z.object({ en: translationSchema, sq: translationSchema }),
});

export type CategoryPayload = z.infer<typeof categoryPayloadSchema>;

export async function saveCategory(payload: CategoryPayload): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const parsed = categoryPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;

  let categoryId = data.id;
  if (categoryId) {
    const { error } = await supabase
      .from("project_categories")
      .update({ sort_order: data.sortOrder })
      .eq("id", categoryId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: inserted, error } = await supabase
      .from("project_categories")
      .insert({ sort_order: data.sortOrder })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    categoryId = inserted.id;
  }

  for (const locale of ["en", "sq"] as const) {
    const t = data.translations[locale];
    const { error } = await supabase.from("project_category_translations").upsert(
      {
        category_id: categoryId,
        locale,
        name: t.name,
        slug: t.slug,
        description: t.description || null,
        seo_title: t.seoTitle || null,
        seo_description: t.seoDescription || null,
      },
      { onConflict: "category_id,locale" },
    );
    if (error) {
      return {
        ok: false,
        error: error.code === "23505" ? `Slug '${t.slug}' is already in use (${locale}).` : error.message,
      };
    }
  }

  // Category names/slugs appear in nav-level slug maps, archives and home.
  await revalidateSite();
  return { ok: true, id: categoryId! };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();

  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      error: `Cannot delete: ${count} product(s) still belong to this category. Move or delete them first.`,
    };
  }

  const { error } = await supabase.from("project_categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await revalidateSite();
  return { ok: true, id };
}
