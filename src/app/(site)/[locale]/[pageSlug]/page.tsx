import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContactView } from "@/components/pages/ContactView";
import { ProductsView } from "@/components/pages/ProductsView";
import { SimplePageView } from "@/components/pages/SimplePageView";
import type { Locale } from "@/lib/database.types";
import {
  getPage,
  getPageKeyBySlug,
  getPageSlugPair,
  getPageSlugs,
} from "@/lib/db/content";
import { alternatesFor } from "@/lib/i18n/urls";

type Props = { params: Promise<{ locale: Locale; pageSlug: string }> };

export async function generateStaticParams({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const slugs = await getPageSlugs(locale as Locale);
  return slugs.map((pageSlug) => ({ pageSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pageSlug } = await params;
  const key = await getPageKeyBySlug(locale, pageSlug);
  if (!key) return {};
  const [page, pair] = await Promise.all([getPage(locale, key), getPageSlugPair(key)]);
  return {
    title: page?.seoTitle ?? page?.title,
    description: page?.seoDescription ?? undefined,
    alternates: alternatesFor(locale, [pair.en], [pair.sq]),
  };
}

export default async function TopLevelPage({ params }: Props) {
  const { locale, pageSlug } = await params;
  const key = await getPageKeyBySlug(locale, pageSlug);

  switch (key) {
    case "about":
    case "services":
      return <SimplePageView locale={locale} pageKey={key} />;
    case "products":
      return <ProductsView locale={locale} />;
    case "contact":
      return <ContactView locale={locale} />;
    default:
      notFound();
  }
}
