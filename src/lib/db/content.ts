import { createStaticClient } from "@/lib/supabase/static";
import type { Json, Locale, Tables } from "@/lib/database.types";
import { LOGO_PATH, storageUrl } from "@/lib/site";

/**
 * Typed read layer for public content. All functions run server-side with the
 * cookie-free anon-key client, so RLS guarantees only published/public rows
 * come back AND pages using this layer stay statically renderable (no
 * cookies() access). Translated fields are flattened onto the returned
 * objects for the locale requested.
 */
const createClient = async () => createStaticClient();

/**
 * Public URL for the CMS-managed site logo, with a cache-busting `?v=` token
 * derived from the Storage object's `updated_at`. Replacing the file in place
 * (admin Branding) changes the token, so CDN/browser caches pick up the new
 * logo despite its year-long cache lifetime. Falls back to the bare URL when
 * the object is missing. Runs only at static-gen / on-demand revalidation.
 */
export async function getLogoUrl(): Promise<string> {
  const base = storageUrl("media", LOGO_PATH);
  const slash = LOGO_PATH.lastIndexOf("/");
  const folder = slash === -1 ? "" : LOGO_PATH.slice(0, slash);
  const name = LOGO_PATH.slice(slash + 1);

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("media").list(folder, { search: name });
  if (error || !data) return base;

  const file = data.find((object) => object.name === name);
  const version = file?.updated_at ?? file?.created_at;
  return version ? `${base}?v=${Date.parse(version)}` : base;
}

/**
 * Image objects in a `media` bucket folder, sorted by filename, returned as
 * editorial images ({ path, alt }). For bespoke galleries sourced straight from
 * Storage rather than the media table. Alt text is derived from the filename,
 * falling back to a generic label when it carries no words.
 */
export async function listGalleryImages(
  folder: string,
): Promise<{ path: string; alt: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("media").list(folder, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });
  if (error || !data) return [];

  return data
    .filter((object) => object.id && /\.(webp|jpe?g|png|avif)$/i.test(object.name))
    .map((object) => {
      const base = object.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      const readable = /[a-z]/i.test(base)
        ? base.replace(/\b\w/g, (c) => c.toUpperCase())
        : "Gergoci project photograph";
      return { path: `${folder}/${object.name}`, alt: readable };
    });
}

export type Category = {
  id: string;
  sortOrder: number;
  name: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type ProductListItem = {
  id: string;
  categoryId: string;
  sortOrder: number;
  title: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  /** Manufacturer brand (partner name); optional — populated for category lists. */
  brand?: string | null;
  /** Featured image (falls back to first by sort order), null when none uploaded. */
  featuredImage: Tables<"media"> | null;
};

type ImageRow = Pick<Tables<"project_images">, "is_featured" | "sort_order"> & {
  media: Tables<"media"> | null;
};

function pickFeatured(images: ImageRow[]): Tables<"media"> | null {
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  return (sorted.find((i) => i.is_featured) ?? sorted[0])?.media ?? null;
}

export type ProductDetail = ProductListItem & {
  body: string | null;
  brochureUrl: string | null;
  /** Manufacturer brand (partner name), null when unset. */
  brand: string | null;
  facts: Pick<Tables<"project_facts">, "id" | "label" | "value" | "sort_order">[];
  images: (Pick<Tables<"project_images">, "id" | "sort_order" | "is_featured"> & {
    media: Tables<"media"> | null;
  })[];
};

export type PageSection = {
  id: string;
  key: string;
  type: string;
  sortOrder: number;
  content: Json;
};

export type PageContent = {
  id: string;
  key: string;
  title: string;
  slug: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: PageSection[];
};

export type Faq = { id: string; sortOrder: number; question: string; answer: string };

export type Partner = {
  id: string;
  name: string;
  url: string | null;
  sortOrder: number;
  logo: Tables<"media"> | null;
};

export async function getCategories(locale: Locale): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_categories")
    .select(
      "id, sort_order, project_category_translations!inner(name, slug, description, seo_title, seo_description)",
    )
    .eq("project_category_translations.locale", locale)
    .order("sort_order");
  if (error) throw error;

  return data.map((row) => {
    const t = row.project_category_translations[0];
    return {
      id: row.id,
      sortOrder: row.sort_order,
      name: t.name,
      slug: t.slug,
      description: t.description,
      seoTitle: t.seo_title,
      seoDescription: t.seo_description,
    };
  });
}

export async function getCategoryBySlug(
  locale: Locale,
  slug: string,
): Promise<Category | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_category_translations")
    .select("category_id, name, slug, description, seo_title, seo_description, project_categories!inner(sort_order)")
    .eq("locale", locale)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.category_id,
    sortOrder: data.project_categories.sort_order,
    name: data.name,
    slug: data.slug,
    description: data.description,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
  };
}

export async function getProductsByCategory(
  locale: Locale,
  categoryId: string,
): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, category_id, brand_partner_id, sort_order, project_translations!inner(title, slug, seo_title, seo_description), project_images(is_featured, sort_order, media(*)), product_categories!inner(category_id)",
    )
    .eq("product_categories.category_id", categoryId)
    .eq("project_translations.locale", locale)
    .order("sort_order");
  if (error) throw error;

  const brandIds = [
    ...new Set(data.map((r) => r.brand_partner_id).filter((id): id is string => Boolean(id))),
  ];
  const brandMap = new Map<string, string>();
  if (brandIds.length > 0) {
    const { data: partners } = await supabase.from("partners").select("id, name").in("id", brandIds);
    for (const p of partners ?? []) brandMap.set(p.id, p.name);
  }

  return data.map((row) => {
    const t = row.project_translations[0];
    return {
      id: row.id,
      categoryId: row.category_id,
      sortOrder: row.sort_order,
      title: t.title,
      slug: t.slug,
      seoTitle: t.seo_title,
      seoDescription: t.seo_description,
      brand: row.brand_partner_id ? brandMap.get(row.brand_partner_id) ?? null : null,
      featuredImage: pickFeatured(row.project_images),
    };
  });
}

export async function getProductBySlug(
  locale: Locale,
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_translations")
    .select(
      "project_id, title, slug, body, seo_title, seo_description, projects!inner(id, category_id, brochure_url, sort_order, brand_partner_id)",
    )
    .eq("locale", locale)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [factsRes, imagesRes] = await Promise.all([
    supabase
      .from("project_facts")
      .select("id, label, value, sort_order")
      .eq("project_id", data.project_id)
      .eq("locale", locale)
      .order("sort_order"),
    supabase
      .from("project_images")
      .select("id, sort_order, is_featured, media(*)")
      .eq("project_id", data.project_id)
      .order("sort_order"),
  ]);
  if (factsRes.error) throw factsRes.error;
  if (imagesRes.error) throw imagesRes.error;

  let brand: string | null = null;
  if (data.projects.brand_partner_id) {
    const { data: b } = await supabase
      .from("partners")
      .select("name")
      .eq("id", data.projects.brand_partner_id)
      .maybeSingle();
    brand = b?.name ?? null;
  }

  return {
    id: data.project_id,
    brand,
    categoryId: data.projects.category_id,
    sortOrder: data.projects.sort_order,
    title: data.title,
    slug: data.slug,
    body: data.body,
    seoTitle: data.seo_title,
    seoDescription: data.seo_description,
    brochureUrl: data.projects.brochure_url,
    featuredImage: pickFeatured(imagesRes.data),
    facts: factsRes.data,
    images: imagesRes.data.map((img) => ({
      id: img.id,
      sort_order: img.sort_order,
      is_featured: img.is_featured,
      media: img.media,
    })),
  };
}

export type ProductCatalogItem = ProductListItem & {
  /** Primary category (drives the product URL). */
  categorySlug: string;
  categoryName: string;
  /** Every category the product belongs to (primary + additional), for filtering. */
  categories: { slug: string; name: string }[];
};

/** Every published product with its category + brand, for the filterable catalog. */
export async function getAllProducts(locale: Locale): Promise<ProductCatalogItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, category_id, brand_partner_id, sort_order, project_translations!inner(title, slug), project_images(is_featured, sort_order, media(*)), project_categories!projects_category_id_fkey!inner(sort_order, project_category_translations!inner(name, slug))",
    )
    .eq("project_translations.locale", locale)
    .eq("project_categories.project_category_translations.locale", locale)
    .order("sort_order");
  if (error) throw error;

  const brandIds = [
    ...new Set(data.map((r) => r.brand_partner_id).filter((id): id is string => Boolean(id))),
  ];
  const brandMap = new Map<string, string>();
  if (brandIds.length > 0) {
    const { data: partners } = await supabase.from("partners").select("id, name").in("id", brandIds);
    for (const p of partners ?? []) brandMap.set(p.id, p.name);
  }

  const items = data
    .sort((a, b) => {
      const ca = a.project_categories.sort_order;
      const cb = b.project_categories.sort_order;
      return ca !== cb ? ca - cb : a.sort_order - b.sort_order;
    })
    .map((row) => {
      const t = row.project_translations[0];
      const cat = row.project_categories.project_category_translations[0];
      return {
        id: row.id,
        categoryId: row.category_id,
        sortOrder: row.sort_order,
        title: t.title,
        slug: t.slug,
        seoTitle: null,
        seoDescription: null,
        brand: row.brand_partner_id ? brandMap.get(row.brand_partner_id) ?? null : null,
        featuredImage: pickFeatured(row.project_images),
        categorySlug: cat.slug,
        categoryName: cat.name,
      };
    });

  // Attach every category each product belongs to (primary + additional).
  const ids = items.map((p) => p.id);
  const catsByProduct = new Map<string, { slug: string; name: string }[]>();
  if (ids.length > 0) {
    const { data: memberships } = await supabase
      .from("product_categories")
      .select("product_id, category_id")
      .in("product_id", ids);
    const catIds = [...new Set((memberships ?? []).map((m) => m.category_id))];
    const labelById = new Map<string, { slug: string; name: string }>();
    if (catIds.length > 0) {
      const { data: cats } = await supabase
        .from("project_category_translations")
        .select("category_id, name, slug")
        .eq("locale", locale)
        .in("category_id", catIds);
      for (const c of cats ?? []) labelById.set(c.category_id, { slug: c.slug, name: c.name });
    }
    for (const m of memberships ?? []) {
      const label = labelById.get(m.category_id);
      if (!label) continue;
      const arr = catsByProduct.get(m.product_id) ?? [];
      arr.push(label);
      catsByProduct.set(m.product_id, arr);
    }
  }

  return items.map((p) => ({
    ...p,
    categories: catsByProduct.get(p.id)?.length
      ? catsByProduct.get(p.id)!
      : [{ slug: p.categorySlug, name: p.categoryName }],
  }));
}

/** First `limit` published products across all categories, in category order. */
export async function getFeaturedProducts(
  locale: Locale,
  limit = 6,
): Promise<(ProductListItem & { categorySlug: string })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, category_id, sort_order, project_translations!inner(title, slug, seo_title, seo_description), project_categories!projects_category_id_fkey!inner(sort_order, project_category_translations!inner(slug, locale)), project_images(is_featured, sort_order, media(*))",
    )
    .eq("project_translations.locale", locale)
    .eq("project_categories.project_category_translations.locale", locale)
    .order("sort_order")
    .limit(limit * 4); // over-fetch, then sort by category order below
  if (error) throw error;

  return data
    .map((row) => {
      const t = row.project_translations[0];
      return {
        id: row.id,
        categoryId: row.category_id,
        sortOrder: row.sort_order,
        title: t.title,
        slug: t.slug,
        seoTitle: t.seo_title,
        seoDescription: t.seo_description,
        featuredImage: pickFeatured(row.project_images),
        categorySlug: row.project_categories.project_category_translations[0].slug,
        categorySortOrder: row.project_categories.sort_order,
      };
    })
    .sort(
      (a, b) => a.categorySortOrder - b.categorySortOrder || a.sortOrder - b.sortOrder,
    )
    .slice(0, limit)
    .map(({ categorySortOrder: _omit, ...item }) => item);
}

/** Media rows for the given ids, in the order requested (missing ids dropped). */
export async function getMediaByIds(ids: string[]): Promise<Tables<"media">[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("media").select("*").in("id", ids);
  if (error) throw error;
  const byId = new Map(data.map((m) => [m.id, m]));
  return ids.flatMap((id) => byId.get(id) ?? []);
}

export async function getPage(
  locale: Locale,
  key: string,
): Promise<PageContent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("pages")
    .select(
      "id, key, page_translations!inner(title, slug, seo_title, seo_description), page_sections(id, key, type, sort_order, page_section_translations!inner(content))",
    )
    .eq("key", key)
    .eq("page_translations.locale", locale)
    .eq("page_sections.active", true)
    .eq("page_sections.page_section_translations.locale", locale)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const t = data.page_translations[0];
  return {
    id: data.id,
    key: data.key,
    title: t.title,
    slug: t.slug,
    seoTitle: t.seo_title,
    seoDescription: t.seo_description,
    sections: data.page_sections
      .map((s) => ({
        id: s.id,
        key: s.key,
        type: s.type,
        sortOrder: s.sort_order,
        content: s.page_section_translations[0]?.content ?? {},
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

/** Resolve a localized top-level page slug (e.g. 'rreth-nesh') to its page key. */
export async function getPageKeyBySlug(
  locale: Locale,
  slug: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_translations")
    .select("pages!inner(key)")
    .eq("locale", locale)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data?.pages.key ?? null;
}

/** All non-home top-level page slugs for a locale (for generateStaticParams). */
export async function getPageSlugs(locale: Locale): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_translations")
    .select("slug")
    .eq("locale", locale)
    .neq("slug", "");
  if (error) throw error;
  return data.map((row) => row.slug);
}

export type SlugPair = { en: string; sq: string };

/** EN/SQ slug pair for a page key (used for hreflang + language switcher). */
export async function getPageSlugPair(key: string): Promise<SlugPair> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_translations")
    .select("locale, slug, pages!inner(key)")
    .eq("pages.key", key);
  if (error) throw error;
  return {
    en: data.find((r) => r.locale === "en")?.slug ?? "",
    sq: data.find((r) => r.locale === "sq")?.slug ?? "",
  };
}

/** EN/SQ slug pair for a category. */
export async function getCategorySlugPair(categoryId: string): Promise<SlugPair> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_category_translations")
    .select("locale, slug")
    .eq("category_id", categoryId);
  if (error) throw error;
  return {
    en: data.find((r) => r.locale === "en")?.slug ?? "",
    sq: data.find((r) => r.locale === "sq")?.slug ?? "",
  };
}

/** EN/SQ slug pair for a product. */
export async function getProductSlugPair(productId: string): Promise<SlugPair> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_translations")
    .select("locale, slug")
    .eq("project_id", productId);
  if (error) throw error;
  return {
    en: data.find((r) => r.locale === "en")?.slug ?? "",
    sq: data.find((r) => r.locale === "sq")?.slug ?? "",
  };
}

/**
 * All EN↔SQ slug pairs (pages, categories, published products) for the
 * language switcher's segment-by-segment path mapping.
 */
export async function getSlugMap(): Promise<SlugPair[]> {
  const supabase = await createClient();
  const [pages, categories, products] = await Promise.all([
    supabase.from("page_translations").select("page_id, locale, slug"),
    supabase.from("project_category_translations").select("category_id, locale, slug"),
    supabase.from("project_translations").select("project_id, locale, slug"),
  ]);
  if (pages.error) throw pages.error;
  if (categories.error) throw categories.error;
  if (products.error) throw products.error;

  const pairs = new Map<string, Partial<SlugPair>>();
  const collect = (rows: { locale: Locale; slug: string }[], keyOf: (row: never) => string) => {
    for (const row of rows) {
      const key = keyOf(row as never);
      const pair = pairs.get(key) ?? {};
      pair[row.locale] = row.slug;
      pairs.set(key, pair);
    }
  };
  collect(pages.data, (r: { page_id: string }) => `page:${r.page_id}`);
  collect(categories.data, (r: { category_id: string }) => `cat:${r.category_id}`);
  collect(products.data, (r: { project_id: string }) => `prod:${r.project_id}`);

  return [...pairs.values()]
    .filter((pair): pair is SlugPair => pair.en !== undefined && pair.sq !== undefined)
    .filter((pair) => pair.en !== "" || pair.sq !== "");
}

export async function getFaqs(locale: Locale): Promise<Faq[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .select("id, sort_order, faq_translations!inner(question, answer)")
    .eq("faq_translations.locale", locale)
    .order("sort_order");
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    sortOrder: row.sort_order,
    question: row.faq_translations[0].question,
    answer: row.faq_translations[0].answer,
  }));
}

export async function getPartners(): Promise<Partner[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, url, sort_order, media(*)")
    .order("sort_order");
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    sortOrder: row.sort_order,
    logo: row.media,
  }));
}
