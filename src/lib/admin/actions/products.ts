"use server";

import { z } from "zod";

import { requireEditor } from "@/lib/admin/auth";
import { revalidateProduct, revalidateSite } from "@/lib/admin/revalidate";

const translationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers and dashes"),
  body: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

const factSchema = z.object({ label: z.string().min(1), value: z.string().min(1) });

const productPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  sortOrder: z.number().int(),
  published: z.boolean(),
  brochureUrl: z.string().nullable(),
  translations: z.object({ en: translationSchema, sq: translationSchema }),
  facts: z.object({ en: z.array(factSchema), sq: z.array(factSchema) }),
});

export type ProductPayload = z.infer<typeof productPayloadSchema>;
export type ActionResult = { ok: true; id: string } | { ok: false; error: string };

/** Slug context needed to revalidate every page a product appears on. */
async function productRevalidation(
  supabase: Awaited<ReturnType<typeof requireEditor>>["supabase"],
  productId: string,
  categoryId: string,
) {
  const [pages, cats, prods] = await Promise.all([
    supabase.from("page_translations").select("locale, slug, pages!inner(key)").eq("pages.key", "products"),
    supabase.from("project_category_translations").select("locale, slug").eq("category_id", categoryId),
    supabase.from("project_translations").select("locale, slug").eq("project_id", productId),
  ]);
  const pick = (rows: { locale: string; slug: string }[] | null, locale: string) =>
    rows?.find((r) => r.locale === locale)?.slug ?? "";
  await revalidateProduct({
    en: { products: pick(pages.data, "en"), category: pick(cats.data, "en"), product: pick(prods.data, "en") },
    sq: { products: pick(pages.data, "sq"), category: pick(cats.data, "sq"), product: pick(prods.data, "sq") },
  });
}

export async function saveProduct(payload: ProductPayload): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const parsed = productPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }
  const data = parsed.data;

  // Revalidate the OLD paths too when slugs/category change.
  if (data.id) await productRevalidation(supabase, data.id, data.categoryId);

  let productId = data.id;
  if (productId) {
    const { error } = await supabase
      .from("projects")
      .update({
        category_id: data.categoryId,
        sort_order: data.sortOrder,
        published: data.published,
        brochure_url: data.brochureUrl,
      })
      .eq("id", productId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data: inserted, error } = await supabase
      .from("projects")
      .insert({
        category_id: data.categoryId,
        sort_order: data.sortOrder,
        published: data.published,
        brochure_url: data.brochureUrl,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    productId = inserted.id;
  }

  for (const locale of ["en", "sq"] as const) {
    const t = data.translations[locale];
    const { error } = await supabase.from("project_translations").upsert(
      {
        project_id: productId,
        locale,
        title: t.title,
        slug: t.slug,
        body: t.body || null,
        seo_title: t.seoTitle || null,
        seo_description: t.seoDescription || null,
      },
      { onConflict: "project_id,locale" },
    );
    if (error) {
      return {
        ok: false,
        error: error.code === "23505" ? `Slug '${t.slug}' is already in use (${locale}).` : error.message,
      };
    }
  }

  // Replace facts wholesale — simplest correct model for an ordered list.
  const { error: deleteFactsError } = await supabase
    .from("project_facts")
    .delete()
    .eq("project_id", productId);
  if (deleteFactsError) return { ok: false, error: deleteFactsError.message };
  const factRows = (["en", "sq"] as const).flatMap((locale) =>
    data.facts[locale].map((fact, index) => ({
      project_id: productId!,
      locale,
      label: fact.label,
      value: fact.value,
      sort_order: index + 1,
    })),
  );
  if (factRows.length > 0) {
    const { error } = await supabase.from("project_facts").insert(factRows);
    if (error) return { ok: false, error: error.message };
  }

  await productRevalidation(supabase, productId!, data.categoryId);
  return { ok: true, id: productId! };
}

export async function setProductPublished(id: string, published: boolean): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { data: row, error } = await supabase
    .from("projects")
    .update({ published })
    .eq("id", id)
    .select("category_id")
    .single();
  if (error) return { ok: false, error: error.message };
  await productRevalidation(supabase, id, row.category_id);
  return { ok: true, id };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { data: row } = await supabase.from("projects").select("category_id").eq("id", id).single();
  if (row) await productRevalidation(supabase, id, row.category_id);
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  await revalidateSite(); // slug map changes
  return { ok: true, id };
}

// --- product images --------------------------------------------------------

const imageItemSchema = z.union([
  z.object({ type: z.literal("existing"), id: z.string().uuid() }),
  z.object({
    type: z.literal("new"),
    storagePath: z.string().min(1),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
    mimeType: z.string().min(1),
  }),
]);

const saveImagesSchema = z.object({
  productId: z.string().uuid(),
  /** Final desired image list, in display order. */
  items: z.array(imageItemSchema),
  /** Index of the featured image within `items`, or -1 for none. */
  featuredIndex: z.number().int().min(-1),
});

export type SaveProductImagesPayload = z.infer<typeof saveImagesSchema>;

/**
 * Reconcile a product's images to a desired final state in one call: removes
 * images no longer present, registers media rows for newly uploaded files, and
 * applies order + the featured flag. Files are uploaded to Storage client-side
 * first; this only persists the database side. Used by the deferred (save-time)
 * commit so nothing is written until the editor clicks Save.
 */
export async function saveProductImages(
  payload: SaveProductImagesPayload,
): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const parsed = saveImagesSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Invalid image data" };
  const { productId, items, featuredIndex } = parsed.data;

  // Delete any existing rows the editor dropped from the list.
  const { data: existing, error: exError } = await supabase
    .from("project_images")
    .select("id")
    .eq("project_id", productId);
  if (exError) return { ok: false, error: exError.message };

  const keptIds = new Set(items.filter((i) => i.type === "existing").map((i) => i.id));
  const toRemove = (existing ?? []).filter((row) => !keptIds.has(row.id)).map((row) => row.id);
  if (toRemove.length > 0) {
    const { error } = await supabase.from("project_images").delete().in("id", toRemove);
    if (error) return { ok: false, error: error.message };
  }

  // Apply order + featured for each item; insert media + link rows for new ones.
  for (const [index, item] of items.entries()) {
    const isFeatured = index === featuredIndex;
    if (item.type === "existing") {
      const { error } = await supabase
        .from("project_images")
        .update({ sort_order: index + 1, is_featured: isFeatured })
        .eq("id", item.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { data: media, error: mediaError } = await supabase
        .from("media")
        .insert({
          storage_path: item.storagePath,
          width: item.width,
          height: item.height,
          mime_type: item.mimeType,
        })
        .select("id")
        .single();
      if (mediaError) return { ok: false, error: mediaError.message };
      const { error } = await supabase.from("project_images").insert({
        project_id: productId,
        media_id: media.id,
        sort_order: index + 1,
        is_featured: isFeatured,
      });
      if (error) return { ok: false, error: error.message };
    }
  }

  const { data: row } = await supabase
    .from("projects")
    .select("category_id")
    .eq("id", productId)
    .single();
  if (row) await productRevalidation(supabase, productId, row.category_id);
  return { ok: true, id: productId };
}

export async function addProductImage(productId: string, mediaId: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { count } = await supabase
    .from("project_images")
    .select("*", { count: "exact", head: true })
    .eq("project_id", productId);
  const { error } = await supabase.from("project_images").insert({
    project_id: productId,
    media_id: mediaId,
    sort_order: (count ?? 0) + 1,
    is_featured: (count ?? 0) === 0, // first image becomes featured
  });
  if (error) return { ok: false, error: error.message };
  const { data: row } = await supabase.from("projects").select("category_id").eq("id", productId).single();
  if (row) await productRevalidation(supabase, productId, row.category_id);
  return { ok: true, id: productId };
}

export async function removeProductImage(imageId: string, productId: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { error } = await supabase.from("project_images").delete().eq("id", imageId);
  if (error) return { ok: false, error: error.message };
  const { data: row } = await supabase.from("projects").select("category_id").eq("id", productId).single();
  if (row) await productRevalidation(supabase, productId, row.category_id);
  return { ok: true, id: productId };
}

export async function reorderProductImages(
  productId: string,
  orderedImageIds: string[],
): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  for (const [index, imageId] of orderedImageIds.entries()) {
    const { error } = await supabase
      .from("project_images")
      .update({ sort_order: index + 1 })
      .eq("id", imageId);
    if (error) return { ok: false, error: error.message };
  }
  const { data: row } = await supabase.from("projects").select("category_id").eq("id", productId).single();
  if (row) await productRevalidation(supabase, productId, row.category_id);
  return { ok: true, id: productId };
}

export async function setFeaturedImage(productId: string, imageId: string): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const { error: clearError } = await supabase
    .from("project_images")
    .update({ is_featured: false })
    .eq("project_id", productId);
  if (clearError) return { ok: false, error: clearError.message };
  const { error } = await supabase
    .from("project_images")
    .update({ is_featured: true })
    .eq("id", imageId);
  if (error) return { ok: false, error: error.message };
  const { data: row } = await supabase.from("projects").select("category_id").eq("id", productId).single();
  if (row) await productRevalidation(supabase, productId, row.category_id);
  return { ok: true, id: productId };
}
