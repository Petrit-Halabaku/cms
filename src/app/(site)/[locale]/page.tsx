import type { Metadata } from "next";
import { Suspense } from "react";

import { HomeView } from "@/components/pages/HomeView";
import { HomeSkeleton } from "@/components/skeletons/HomeSkeleton";
import type { Locale } from "@/lib/database.types";
import { getPage } from "@/lib/db/content";
import { alternatesFor } from "@/lib/i18n/urls";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage(locale, "home");
  return {
    title: page?.seoTitle ?? page?.title,
    description: page?.seoDescription ?? undefined,
    alternates: alternatesFor(locale, [], []),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // Streaming lives in an explicit boundary rather than a route-level
  // loading.tsx: a route-level fallback flushes the shell (and its 200) before
  // any page below can call notFound(), which turns every 404 into a soft 404.
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeView locale={locale} />
    </Suspense>
  );
}
