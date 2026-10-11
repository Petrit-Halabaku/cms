import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AboutView } from "@/components/pages/AboutView";
import { ContactView } from "@/components/pages/ContactView";
import { ProductsView } from "@/components/pages/ProductsView";
import { ServicesView } from "@/components/pages/ServicesView";
import { TopLevelPageSkeleton } from "@/components/skeletons/TopLevelPageSkeleton";
import { isLocale } from "@/lib/i18n/locale";
import {
  getPage,
  getPageKeyBySlug,
  getPageSlugPair,
  getPageSlugs,
} from "@/lib/db/content";
import { alternatesFor } from "@/lib/i18n/urls";

type Props = { params: Promise<{ locale: string; pageSlug: string }> };

export async function generateStaticParams({
  params,
}: {
  params: { locale: string } | Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const slugs = await getPageSlugs(locale);
  return slugs.map((pageSlug) => ({ pageSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, pageSlug } = await params;
  if (!isLocale(locale)) notFound();
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
  if (!isLocale(locale)) notFound();
  const key = await getPageKeyBySlug(locale, pageSlug);

  if (key && !(await getPage(locale, key))) notFound();

  // Resolved before the Suspense boundary below, so an unknown slug 404s with a
  // real 404 status instead of streaming the 404 UI into an already-sent 200.
  const view = (() => {
    switch (key) {
      case "about":
        return <AboutView locale={locale} />;
      case "services":
        return <ServicesView locale={locale} />;
      case "products":
        return <ProductsView locale={locale} />;
      case "contact":
        return <ContactView locale={locale} />;
      default:
        notFound();
    }
  })();

  return <Suspense fallback={<TopLevelPageSkeleton />}>{view}</Suspense>;
}
