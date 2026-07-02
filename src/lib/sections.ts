import { z } from "zod";

import type { Json } from "@/lib/database.types";

/**
 * Zod schemas for page_section_translations.content (jsonb), one per
 * page_sections.type. Parsing is lenient — unknown keys are ignored and a
 * failed parse yields the schema's defaults so a bad admin edit can never
 * crash the public site. The admin section editor (Phase 3) reuses these.
 */

const titleBody = z.object({
  title: z.string().default(""),
  body: z.string().default(""),
  /** Optional stable key (e.g. "windows") linking a card to a product category. */
  key: z.string().optional(),
  /** Product category id this card links to (CMS-editable; wins over `key`). */
  category_id: z.string().optional(),
});

export const heroSchema = z.object({
  heading: z.string().default(""),
  subheading: z.string().default(""),
  cta_label: z.string().default(""),
  phone: z.string().default(""),
  /** Background media path in the `media` bucket (image or video); shared across locales. */
  media_path: z.string().default(""),
  /** Alt text for a background image (ignored for video). */
  media_alt: z.string().default(""),
});

export const cardsSchema = z.object({
  heading: z.string().default(""),
  items: z.array(titleBody).default([]),
});

export const headingOnlySchema = z.object({
  heading: z.string().default(""),
});

export const countersSchema = z.object({
  heading: z.string().default(""),
  items: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
});

export const locationSchema = z.object({
  heading: z.string().default(""),
  address: z.string().default(""),
  phone: z.string().default(""),
  phone2: z.string().default(""),
  lat: z.number().default(42.6548),
  lng: z.number().default(20.3172),
  hours: z.array(z.object({ days: z.string(), hours: z.string() })).default([]),
});

export const ctaSchema = z.object({
  heading: z.string().default(""),
  body: z.string().default(""),
  cta_label: z.string().default(""),
});

export const richTextSchema = z.object({
  heading: z.string().default(""),
  body: z.string().default(""),
});

export const listSchema = z.object({
  heading: z.string().default(""),
  items: z.array(z.string()).default([]),
});

export const gallerySchema = z.object({
  heading: z.string().default(""),
  media_ids: z.array(z.string()).default([]),
});

export const contactInfoSchema = z.object({
  heading: z.string().default(""),
  address: z.string().default(""),
  phone: z.string().default(""),
  phone2: z.string().default(""),
  email: z.string().default(""),
  lat: z.number().default(Number(process.env.NEXT_PUBLIC_MAP_LAT)),
  lng: z.number().default(Number(process.env.NEXT_PUBLIC_MAP_LNG)),
});

export type HeroContent = z.infer<typeof heroSchema>;
export type CardsContent = z.infer<typeof cardsSchema>;
export type HeadingOnlyContent = z.infer<typeof headingOnlySchema>;
export type CountersContent = z.infer<typeof countersSchema>;
export type LocationContent = z.infer<typeof locationSchema>;
export type CtaContent = z.infer<typeof ctaSchema>;
export type RichTextContent = z.infer<typeof richTextSchema>;
export type ListContent = z.infer<typeof listSchema>;
export type GalleryContent = z.infer<typeof gallerySchema>;
export type ContactInfoContent = z.infer<typeof contactInfoSchema>;

/** Parse jsonb content against a schema, falling back to defaults on failure. */
export function parseContent<S extends z.ZodTypeAny>(
  schema: S,
  content: Json,
): z.infer<S> {
  const result = schema.safeParse(content ?? {});
  if (result.success) return result.data;
  return schema.parse({});
}
