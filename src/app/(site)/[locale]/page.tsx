import type { Metadata } from "next";

import { HomeView } from "@/components/pages/HomeView";
import type { Locale } from "@/lib/database.types";
import { getPage } from "@/lib/db/content";
import { buildPageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/site";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = await getPage(locale, "home");
  return buildPageMetadata({
    locale,
    // Home keeps an absolute title so it isn't branded twice by the template.
    title: page?.seoTitle ?? page?.title ?? SITE_NAME,
    absoluteTitle: true,
    description: page?.seoDescription,
    enSegments: [],
    sqSegments: [],
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  return <HomeView locale={locale} />;
}
