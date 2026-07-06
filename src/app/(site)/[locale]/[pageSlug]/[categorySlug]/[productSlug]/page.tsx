import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductView } from "@/components/pages/ProductView";
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
import { buildPageMetadata, type OgImage } from "@/lib/seo";
import { storageUrl } from "@/lib/site";

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
  if (!category || !product || product.categoryId !== category.id) return {};
  const [productsPair, categoryPair, productPair] = await Promise.all([
    getPageSlugPair("products"),
    getCategorySlugPair(category.id),
    getProductSlugPair(product.id),
  ]);
  const cover = product.featuredImage;
  const images: OgImage[] | undefined = cover
    ? [
        {
          url: storageUrl("media", cover.storage_path),
          width: cover.width ?? undefined,
          height: cover.height ?? undefined,
          alt: product.title,
        },
      ]
    : undefined;
  return buildPageMetadata({
    locale,
    title: product.seoTitle ?? product.title,
    description: product.seoDescription ?? product.body?.slice(0, 160),
    enSegments: [productsPair.en, categoryPair.en, productPair.en],
    sqSegments: [productsPair.sq, categoryPair.sq, productPair.sq],
    images,
    type: "article",
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale, pageSlug, categorySlug, productSlug } = await params;
  const key = await getPageKeyBySlug(locale, pageSlug);
  if (key !== "products") notFound();
  return (
    <ProductView locale={locale} categorySlug={categorySlug} productSlug={productSlug} />
  );
}
