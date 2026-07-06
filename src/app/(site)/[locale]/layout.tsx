import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";

import "../../globals.css";

import { JsonLd } from "@/components/JsonLd";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Locale } from "@/lib/database.types";
import { getCategories, getLogoUrl, getPage, getSlugMap } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor, localePath } from "@/lib/i18n/urls";
import { contactInfoSchema, parseContent } from "@/lib/sections";
import {
  GOOGLE_SITE_VERIFICATION,
  KEYWORDS,
  localBusinessSchema,
  OG_LOCALE,
  ogImageUrl,
  organizationSchema,
  OG_SIZE,
  TAGLINE,
  TWITTER_HANDLE,
  websiteSchema,
} from "@/lib/seo";
import { ROUTE_SLUGS, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Public site root layout — one per locale ('/' = en, '/sq' = sq, enforced by
 * proxy.ts). Owns <html lang>. Pages are static, revalidated on demand by
 * admin saves; the hourly ISR window is a safety net.
 */
export const revalidate = 3600;

// Archivo's variable width axis gives the slightly-expanded architectural
// display style (see .font-display); Instrument Serif is the italic accent.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const LOCALES: Locale[] = ["en", "sq"];

function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#012653",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = raw === "sq" ? "sq" : "en";
  const description = TAGLINE[locale];
  const ogImage = ogImageUrl(SITE_NAME, description);

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    // Child pages set a bare `title` which this template brands with the suffix;
    // `default` covers segments (and the home page) that opt out.
    title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
    description,
    keywords: KEYWORDS[locale],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: { telephone: true, address: true, email: true },
    alternates: {
      canonical: localePath(locale),
      languages: { en: "/", sq: "/sq", "x-default": "/" },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: SITE_NAME,
      description,
      url: `${SITE_URL}${localePath(locale)}`,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "sq" ? "en" : "sq"],
      images: [{ url: ogImage, ...OG_SIZE, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_NAME,
      description,
      images: [ogImage],
      ...(TWITTER_HANDLE && { site: TWITTER_HANDLE, creator: TWITTER_HANDLE }),
    },
    ...(GOOGLE_SITE_VERIFICATION && { verification: { google: GOOGLE_SITE_VERIFICATION } }),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);
  const routes = ROUTE_SLUGS[locale];
  const basePath = basePathFor(locale);

  // Footer contact details + language-switcher slug map.
  const [contactPage, slugPairs, categories, logoUrl] = await Promise.all([
    getPage(locale, "contact"),
    getSlugMap(),
    getCategories(locale),
    getLogoUrl(),
  ]);
  const infoSection = contactPage?.sections.find((s) => s.type === "contact-info");
  const info = parseContent(contactInfoSchema, infoSection?.content ?? {});

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${instrumentSerif.variable} h-full`}
    >
      {/* suppressHydrationWarning: browser extensions (Grammarly, etc.) inject
          attributes onto <body> on the client, which React would otherwise flag
          as a hydration mismatch. Scoped to this element only. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <JsonLd data={organizationSchema(logoUrl)} />
        <JsonLd data={websiteSchema(locale)} />
        <JsonLd
          data={localBusinessSchema({
            logoUrl,
            phone: info.phone,
            email: info.email,
            address: info.address,
            lat: info.lat,
            lng: info.lng,
          })}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          {dict.common.skipToContent}
        </a>
        <Header
          dict={dict}
          basePath={basePath}
          routes={routes}
          locale={locale}
          slugPairs={slugPairs}
          phone={info.phone || undefined}
          categories={categories.map(({ name, slug }) => ({ name, slug }))}
          logoUrl={logoUrl}
        />
        <main id="main" className="flex-1">{children}</main>
        <Footer
          dict={dict}
          basePath={basePath}
          routes={routes}
          contact={{ address: info.address, phone: info.phone, phone2: info.phone2, email: info.email }}
          logoUrl={logoUrl}
        />
        <ScrollToTop label={locale === "sq" ? "Kthehu lart" : "Back to top"} />
      </body>
    </html>
  );
}
