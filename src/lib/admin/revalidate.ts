"use server";

import { revalidatePath } from "next/cache";

/**
 * On-demand revalidation helpers, called from admin server actions.
 *
 * Slug maps, footer contact info and nav appear in the locale layouts, and
 * categories/products fan out across home, landing and archive pages — so
 * most edits touch many routes. Products get targeted invalidation; anything
 * structural revalidates the whole (small, fully static) site.
 */

/** Revalidate every public page (70-odd static pages — cheap, regenerated on demand). */
export async function revalidateSite() {
  revalidatePath("/", "layout");
}

/** Revalidate the pages a single product appears on, in both locales. */
export async function revalidateProduct(slugs: {
  en: { products: string; category: string; product: string };
  sq: { products: string; category: string; product: string };
}) {
  // Home (featured products) + products landing + category archive + detail.
  revalidatePath("/en");
  revalidatePath("/sq");
  revalidatePath(`/en/${slugs.en.products}`);
  revalidatePath(`/sq/${slugs.sq.products}`);
  revalidatePath(`/en/${slugs.en.products}/${slugs.en.category}`);
  revalidatePath(`/sq/${slugs.sq.products}/${slugs.sq.category}`);
  revalidatePath(`/en/${slugs.en.products}/${slugs.en.category}/${slugs.en.product}`);
  revalidatePath(`/sq/${slugs.sq.products}/${slugs.sq.category}/${slugs.sq.product}`);
}
