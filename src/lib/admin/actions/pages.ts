"use server";

import { z } from "zod";

import { requireEditor } from "@/lib/admin/auth";
import { revalidateSite } from "@/lib/admin/revalidate";
import type { ActionResult } from "@/lib/admin/actions/products";
import type { Json } from "@/lib/database.types";
import {
  cardsSchema,
  contactInfoSchema,
  countersSchema,
  ctaSchema,
  gallerySchema,
  headingOnlySchema,
  heroSchema,
  listSchema,
  locationSchema,
  richTextSchema,
} from "@/lib/sections";

/** zod schema for a section's jsonb content, by page_sections.type. */
const SCHEMA_BY_TYPE: Record<string, z.ZodTypeAny> = {
  hero: heroSchema,
  cards: cardsSchema,
  grid: cardsSchema,
  "product-grid": headingOnlySchema,
  faq: headingOnlySchema,
  "logo-strip": headingOnlySchema,
  counters: countersSchema,
  location: locationSchema,
  cta: ctaSchema,
  "rich-text": richTextSchema,
  list: listSchema,
  gallery: gallerySchema,
  "contact-info": contactInfoSchema,
};

const pageMetaSchema = z.object({
  pageId: z.string().uuid(),
  translations: z.object({
    en: z.object({
      title: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9-]*$/),
      seoTitle: z.string(),
      seoDescription: z.string(),
    }),
    sq: z.object({
      title: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9-]*$/),
      seoTitle: z.string(),
      seoDescription: z.string(),
    }),
  }),
});

export type PageMetaPayload = z.infer<typeof pageMetaSchema>;

export async function savePageMeta(payload: PageMetaPayload): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const parsed = pageMetaSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  for (const locale of ["en", "sq"] as const) {
    const t = parsed.data.translations[locale];
    const { error } = await supabase
      .from("page_translations")
      .update({
        title: t.title,
        slug: t.slug,
        seo_title: t.seoTitle || null,
        seo_description: t.seoDescription || null,
      })
      .eq("page_id", parsed.data.pageId)
      .eq("locale", locale);
    if (error) return { ok: false, error: error.message };
  }

  await revalidateSite();
  return { ok: true, id: parsed.data.pageId };
}

export async function saveSectionContent(
  sectionId: string,
  type: string,
  content: { en: unknown; sq: unknown },
): Promise<ActionResult> {
  const { supabase } = await requireEditor();
  const schema = SCHEMA_BY_TYPE[type];
  if (!schema) return { ok: false, error: `Unknown section type '${type}'` };

  for (const locale of ["en", "sq"] as const) {
    const parsed = schema.safeParse(content[locale]);
    if (!parsed.success) {
      return {
        ok: false,
        error: `${locale.toUpperCase()}: ${parsed.error.issues[0]?.message ?? "invalid content"}`,
      };
    }
    const { error } = await supabase
      .from("page_section_translations")
      .upsert(
        { section_id: sectionId, locale, content: parsed.data as Json },
        { onConflict: "section_id,locale" },
      );
    if (error) return { ok: false, error: error.message };
  }

  await revalidateSite();
  return { ok: true, id: sectionId };
}
