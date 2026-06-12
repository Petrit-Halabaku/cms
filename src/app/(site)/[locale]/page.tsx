import type { Metadata } from "next";

import { HomeView } from "@/components/pages/HomeView";
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
  return <HomeView locale={locale} />;
}
