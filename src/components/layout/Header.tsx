"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { Locale } from "@/lib/database.types";
import type { SlugPair } from "@/lib/db/content";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { SITE_NAME } from "@/lib/site";

type Props = {
  dict: Dictionary;
  /** Locale-prefixed base path, "" for en, "/sq" for sq. */
  basePath?: string;
  /** Per-locale route slugs from the translation tables. */
  routes: {
    about: string;
    services: string;
    products: string;
    contact: string;
    getQuote: string;
  };
  locale: Locale;
  slugPairs: SlugPair[];
};

export function Header({ dict, basePath = "", routes, locale, slugPairs }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items = [
    { href: `${basePath}/`, label: dict.nav.home },
    { href: `${basePath}/${routes.about}`, label: dict.nav.about },
    { href: `${basePath}/${routes.services}`, label: dict.nav.services },
    { href: `${basePath}/${routes.products}`, label: dict.nav.products },
    { href: `${basePath}/${routes.contact}`, label: dict.nav.contact },
  ];

  const isActive = (href: string) =>
    href === `${basePath}/` ? pathname === href || pathname === basePath : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={`${basePath}/`} className="text-xl font-bold tracking-tight text-brand-800">
          {SITE_NAME.toUpperCase()}
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label={dict.header.menuLabel}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-brand-700 ${
                isActive(item.href) ? "text-brand-700" : "text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={`${basePath}/${routes.getQuote}`}
            className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            {dict.nav.getQuote}
          </Link>
          <LanguageSwitcher locale={locale} slugPairs={slugPairs} />
        </nav>

        <button
          type="button"
          className="p-2 text-slate-700 md:hidden"
          aria-expanded={open}
          aria-label={dict.header.menuLabel}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-slate-100 bg-white px-4 pb-4 md:hidden"
          aria-label={dict.header.menuLabel}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 text-base font-medium text-slate-700"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={`${basePath}/${routes.getQuote}`}
            className="mt-2 block rounded-md bg-brand-700 px-4 py-3 text-center text-base font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            {dict.nav.getQuote}
          </Link>
          <LanguageSwitcher locale={locale} slugPairs={slugPairs} className="mt-4 justify-center" />
        </nav>
      )}
    </header>
  );
}
