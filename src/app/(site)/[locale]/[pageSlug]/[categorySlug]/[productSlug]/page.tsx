import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductView } from "@/components/pages/ProductView";
import { ProductSkeleton } from "@/components/skeletons/ProductSkeleton";
import type { Locale } from "@/lib/database.types";
import {
  getCategories,
  getCategoryBySlug,
  getCategorySlugPair,
  getPageKeyBySlug,
  getPageSlugPair,
  getProductBySlug,
  getProductSlugPair,
  getProductsByCategory,
} from "@/lib/db/content";
import { alternatesFor } from "@/lib/i18n/urls";

type Props = {
  params: Promise<{
    locale: Locale;
    pageSlug: string;
    categorySlug: string;
    productSlug: string;
  }>;
};

export async function generateStaticParams({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  // Only `locale` cascades down from parent segments, so return complete
  // combos: products page slug × category slug × product slug.
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const [productsPair, categories] = await Promise.all([
    getPageSlugPair("products"),
    getCategories(locale),
  ]);
  const perCategory = await Promise.all(
    categories.map(async (category) => {
      const products = await getProductsByCategory(locale, category.id);
      return products.map((product) => ({
        pageSlug: productsPair[locale],
        categorySlug: category.slug,
        productSlug: product.slug,
      }));
    }),
  );
  return perCategory.flat();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pageSlug, categorySlug, productSlug } = await params;
  const key = await getPageKeyBySlug(locale, pageSlug);
  if (key !== "products") return {};
  const [category, product] = await Promise.all([
    getCategoryBySlug(locale, categorySlug),
    getProductBySlug(locale, productSlug),
  ]);
  // Same membership rule as ProductView: a product reachable under a secondary
  // category must still get its own title, description and alternates.
  if (!category || !product || !product.categoryIds.includes(category.id)) return {};
  // A product listed under several categories is reachable at one URL per
  // category. Canonicalize them all to the primary-category URL so the
  // duplicates consolidate instead of each self-canonicalizing.
  const [productsPair, categoryPair, productPair] = await Promise.all([
    getPageSlugPair("products"),
    getCategorySlugPair(product.categoryId),
    getProductSlugPair(product.id),
  ]);
  return {
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? undefined,
    alternates: alternatesFor(
      locale,
      [productsPair.en, categoryPair.en, productPair.en],
      [productsPair.sq, categoryPair.sq, productPair.sq],
    ),
  };
}

export default async function ProductPage({ params }: Props) {
  const { locale, pageSlug, categorySlug, productSlug } = await params;
  const key = await getPageKeyBySlug(locale, pageSlug);
  if (key !== "products") notFound();

  // Same membership rule ProductView enforces, resolved before the Suspense
  // boundary so a bad category/product pair 404s with a real 404 status. Both
  // lookups are request-cached, so ProductView repeats them for free.
  const [category, product] = await Promise.all([
    getCategoryBySlug(locale, categorySlug),
    getProductBySlug(locale, productSlug),
  ]);
  if (!category || !product || !product.categoryIds.includes(category.id)) notFound();

  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductView locale={locale} categorySlug={categorySlug} productSlug={productSlug} />
    </Suspense>
  );
}
