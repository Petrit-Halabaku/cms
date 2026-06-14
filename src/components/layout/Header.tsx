"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { gsap, prefersReducedMotion, useGSAP } from "@/components/motion/gsap";
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

function Wordmark({ basePath }: { basePath: string }) {
  return (
    <Link href={`${basePath}/`} className="group flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center bg-brand-700 font-display text-base text-white transition-colors group-hover:bg-brand-800">
        G
      </span>
      <span className="font-display text-lg tracking-tight">{SITE_NAME.toUpperCase()}</span>
    </Link>
  );
}

export function Header({ dict, basePath = "", routes, locale, slugPairs }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  const items = [
    { href: `${basePath}/`, label: dict.nav.home },
    { href: `${basePath}/${routes.about}`, label: dict.nav.about },
    { href: `${basePath}/${routes.services}`, label: dict.nav.services },
    { href: `${basePath}/${routes.products}`, label: dict.nav.products },
    { href: `${basePath}/${routes.contact}`, label: dict.nav.contact },
  ];

  const isActive = (href: string) =>
    href === `${basePath}/` ? pathname === href || pathname === basePath : pathname.startsWith(href);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll lock + Escape while the overlay menu is open.
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useGSAP(
    () => {
      if (!open || prefersReducedMotion()) return;
      gsap.from("[data-menu-item]", {
        autoAlpha: 0,
        y: 48,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.06,
        delay: 0.08,
      });
      gsap.from("[data-menu-foot]", { autoAlpha: 0, y: 24, duration: 0.6, delay: 0.4 });
    },
    { scope: overlayRef, dependencies: [open] },
  );

  return (
    <>
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled ? "border-line bg-paper/90 shadow-[0_1px_0_0_rgba(23,43,102,0.04)] backdrop-blur-md" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Wordmark basePath={basePath} />

        <nav className="hidden items-center gap-7 md:flex" aria-label={dict.header.menuLabel}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-brand-700 after:transition-transform after:duration-300 hover:text-brand-700 hover:after:origin-left hover:after:scale-x-100 ${
                isActive(item.href) ? "text-brand-700 after:scale-x-100" : "text-slate-700"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={`${basePath}/${routes.getQuote}`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-brand-700 py-2 pr-3.5 pl-4.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
          >
            {dict.nav.getQuote}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
          <LanguageSwitcher locale={locale} slugPairs={slugPairs} />
        </nav>

        <button
          type="button"
          className="p-2 text-slate-700 md:hidden"
          aria-expanded={open}
          aria-label={dict.header.menuLabel}
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </header>

      {/* Overlay lives OUTSIDE <header>: its backdrop-filter would otherwise
          become the containing block and shrink this fixed element to it. */}
      {open && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex flex-col bg-brand-950 text-white md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={dict.header.menuLabel}
        >
          {/* Decorative mullion hairlines */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <span className="absolute left-1/3 top-0 h-full w-px bg-white/5" />
            <span className="absolute left-2/3 top-0 h-full w-px bg-white/5" />
          </div>

          <div className="flex h-18 items-center justify-between px-4 sm:px-6">
            <Link href={`${basePath}/`} onClick={() => setOpen(false)} className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center bg-white font-display text-base text-brand-800">
                G
              </span>
              <span className="font-display text-lg tracking-tight">{SITE_NAME.toUpperCase()}</span>
            </Link>
            <button
              type="button"
              className="p-2 text-white"
              aria-label={dict.header.menuLabel}
              onClick={() => setOpen(false)}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-1 px-6" aria-label={dict.header.menuLabel}>
            {items.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                data-menu-item
                className={`flex items-baseline gap-4 py-2.5 font-display text-4xl tracking-tight transition-colors ${
                  isActive(item.href) ? "text-white" : "text-white/55 hover:text-white"
                }`}
                onClick={() => setOpen(false)}
              >
                <span className="font-serif text-sm font-normal italic text-brand-100/60">
                  0{i + 1}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div data-menu-foot className="border-t border-white/10 px-6 py-6">
            <Link
              href={`${basePath}/${routes.getQuote}`}
              className="flex w-full items-center justify-between rounded-full bg-white px-6 py-3.5 font-display text-base text-brand-800"
              onClick={() => setOpen(false)}
            >
              {dict.nav.getQuote}
              <ArrowUpRight className="h-5 w-5" aria-hidden />
            </Link>
            <LanguageSwitcher
              locale={locale}
              slugPairs={slugPairs}
              variant="dark"
              className="mt-5 justify-center"
            />
          </div>
        </div>
      )}
    </>
  );
}
