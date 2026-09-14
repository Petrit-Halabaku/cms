import type { Metadata } from "next";
import { Archivo, Instrument_Serif } from "next/font/google";

import "./globals.css";

import { SITE_NAME } from "@/lib/site";

/**
 * App-wide 404. Next routes here for unmatched URLs and for `notFound()` calls
 * that are resolved before streaming starts (see the pages under `(site)`,
 * which settle existence ahead of their Suspense boundary so the response can
 * carry a real 404 status).
 *
 * This file exists because the segment-level `(site)/[locale]/not-found.tsx`
 * cannot be composed here: the app has two root layouts — `(admin)` and
 * `(site)` — and the `(site)` root layout sits under the dynamic `[locale]`
 * segment, so there is no single layout to wrap a 404 in. It therefore renders
 * its own full document and re-declares the fonts and global styles the site
 * layout would otherwise provide.
 *
 * Bilingual, like the segment 404: no locale is known for an unmatched URL.
 */
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

export const metadata: Metadata = {
  title: `Page not found · ${SITE_NAME}`,
  description: "The page you are looking for does not exist or has moved.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${archivo.variable} ${instrumentSerif.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-paper" suppressHydrationWarning>
        <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-4 py-32 text-center">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute top-0 left-1/4 h-full w-px bg-line/70" />
            <span className="absolute top-0 left-2/4 h-full w-px bg-line/70" />
            <span className="absolute top-0 left-3/4 h-full w-px bg-line/70" />
          </div>
          <p className="relative font-serif text-2xl italic text-brand-700">404</p>
          <h1 className="relative mt-3 font-display text-3xl text-slate-900 sm:text-5xl">
            Page not found · Faqja nuk u gjet
          </h1>
          <p className="relative mt-5 max-w-md text-slate-600">
            The page you are looking for does not exist or has moved.
            <br />
            Faqja që kërkoni nuk ekziston ose është zhvendosur.
          </p>
          <div className="relative mt-9 flex gap-3">
            <a
              href="/"
              className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              Back to homepage
            </a>
            <a
              href="/sq"
              className="rounded-full border border-brand-700 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Kthehu në ballinë
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
