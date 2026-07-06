import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryView } from "@/components/pages/CategoryView";
import type { Locale } from "@/lib/database.types";
import {
  getCategories,
  getCategoryBySlug,
  getCategorySlugPair,
  getPageKeyBySlug,
  getPageSlugPair,
  getProductsByCategory,
} from "@/lib/db/content";
import { buildPageMetadata, type OgImage } from "@/lib/seo";
import { storageUrl } from "@/lib/site";

type Props = {
  params: Promise<{ locale: Locale; pageSlug: string; categorySlug: string }>;
};

export async function generateStaticParams({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  // Only `locale` cascades down from parent segments, so return complete
  // combos including pageSlug. Categories only exist under the products page.
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const [productsPair, categories] = await Promise.all([
    getPageSlugPair("products"),
    getCategories(locale),
  ]);
  return categories.map((category) => ({
    pageSlug: productsPair[locale],
    categorySlug: category.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pageSlug, categorySlug } = await params;
  const key = await getPageKeyBySlug(locale, pageSlug);
  if (key !== "products") return {};
  const category = await getCategoryBySlug(locale, categorySlug);
  if (!category) return {};
  const [productsPair, categoryPair, products] = await Promise.all([
    getPageSlugPair("products"),
    getCategorySlugPair(category.id),
    getProductsByCategory(locale, category.id),
  ]);
  // Use the first product photo as the share image; fall back to the brand card.
  const cover = products.find((p) => p.featuredImage)?.featuredImage;
  const images: OgImage[] | undefined = cover
    ? [
        {
          url: storageUrl("media", cover.storage_path),
          width: cover.width ?? undefined,
          height: cover.height ?? undefined,
          alt: category.name,
        },
      ]
    : undefined;
  return buildPageMetadata({
    locale,
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description,
    enSegments: [productsPair.en, categoryPair.en],
    sqSegments: [productsPair.sq, categoryPair.sq],
    images,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { locale, pageSlug, categorySlug } = await params;
  const key = await getPageKeyBySlug(locale, pageSlug);
  if (key !== "products") notFound();
  return <CategoryView locale={locale} categorySlug={categorySlug} />;
}
