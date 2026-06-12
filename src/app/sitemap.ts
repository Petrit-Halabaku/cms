import type { MetadataRoute } from "next";

import {
  getCategories,
  getCategorySlugPair,
  getPageSlugPair,
  getProductsByCategory,
  getProductSlugPair,
} from "@/lib/db/content";
import { localePath } from "@/lib/i18n/urls";
import { SITE_URL } from "@/lib/site";

const PAGE_KEYS = ["home", "about", "services", "products", "contact", "get-quote"];

/** Both-locale sitemap with hreflang alternates, generated from the DB. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  const push = (enSegments: string[], sqSegments: string[]) => {
    const en = `${SITE_URL}${localePath("en", enSegments)}`;
    const sq = `${SITE_URL}${localePath("sq", sqSegments)}`;
    const alternates = { languages: { en, sq, "x-default": en } };
    entries.push({ url: en, alternates }, { url: sq, alternates });
  };

  // Top-level pages (home has empty slugs).
  for (const key of PAGE_KEYS) {
    const pair = await getPageSlugPair(key);
    push(pair.en ? [pair.en] : [], pair.sq ? [pair.sq] : []);
  }

  // Category archives + product detail pages.
  const productsPair = await getPageSlugPair("products");
  const categories = await getCategories("en");
  for (const category of categories) {
    const categoryPair = await getCategorySlugPair(category.id);
    push([productsPair.en, categoryPair.en], [productsPair.sq, categoryPair.sq]);

    const products = await getProductsByCategory("en", category.id);
    for (const product of products) {
      const productPair = await getProductSlugPair(product.id);
      push(
        [productsPair.en, categoryPair.en, productPair.en],
        [productsPair.sq, categoryPair.sq, productPair.sq],
      );
    }
  }

  return entries;
}
