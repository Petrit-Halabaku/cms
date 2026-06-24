import type { Metadata } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";

import "../../globals.css";

import { JsonLd } from "@/components/JsonLd";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { Locale } from "@/lib/database.types";
import { getCategories, getPage, getSlugMap } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { contactInfoSchema, parseContent } from "@/lib/sections";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(SITE_URL),
    title: SITE_NAME,
    description:
      locale === "sq"
        ? `${SITE_NAME} — dritare, dyer & sisteme xhami në Pejë, Kosovë.`
        : `${SITE_NAME} — windows, doors & glass systems in Pejë, Kosovo.`,
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
  const [contactPage, slugPairs, categories] = await Promise.all([
    getPage(locale, "contact"),
    getSlugMap(),
    getCategories(locale),
  ]);
  const infoSection = contactPage?.sections.find((s) => s.type === "contact-info");
  const info = parseContent(contactInfoSchema, infoSection?.content ?? {});

  return (
    <html lang={locale} className={`${archivo.variable} ${instrumentSerif.variable} h-full`}>
      {/* suppressHydrationWarning: browser extensions (Grammarly, etc.) inject
          attributes onto <body> on the client, which React would otherwise flag
          as a hydration mismatch. Scoped to this element only. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/brand/gergoci-logo-vertical-color.png`,
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `${SITE_URL}/#localbusiness`,
            name: SITE_NAME,
            url: SITE_URL,
            logo: `${SITE_URL}/brand/gergoci-logo-vertical-color.png`,
            image: `${SITE_URL}/brand/gergoci-logo-vertical-color.png`,
            telephone: info.phone || undefined,
            email: info.email || undefined,
            areaServed: "Kosovo",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Pejë",
              addressCountry: "XK",
              streetAddress: info.address || undefined,
            },
            geo: { "@type": "GeoCoordinates", latitude: info.lat, longitude: info.lng },
          }}
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
        />
        <main id="main" className="flex-1">{children}</main>
        <Footer
          dict={dict}
          basePath={basePath}
          routes={routes}
          contact={{ address: info.address, phone: info.phone, email: info.email }}
        />
      </body>
    </html>
  );
}
