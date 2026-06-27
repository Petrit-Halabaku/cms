"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Phone, X } from "lucide-react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { gsap, prefersReducedMotion, useGSAP } from "@/components/motion/gsap";
import type { Locale } from "@/lib/database.types";
import type { SlugPair } from "@/lib/db/content";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { SITE_NAME } from "@/lib/site";

type NavCategory = { name: string; slug: string };

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
  };
  locale: Locale;
  slugPairs: SlugPair[];
  /** Business phone for the click-to-call CTA. */
  phone?: string;
  categories?: NavCategory[];
  /** CMS-managed logo URL (cache-busted) from the site layout. */
  logoUrl: string;
};

const navLinkClass = (active: boolean) =>
  `relative text-sm font-medium transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-brand-700 after:transition-transform after:duration-300 hover:text-brand-700 hover:after:origin-left hover:after:scale-x-100 ${
    active ? "text-brand-700 after:scale-x-100" : "text-slate-700"
  }`;

function ProductsNavItem({
  href,
  label,
  active,
  categories,
}: {
  href: string;
  label: string;
  active: boolean;
  categories: NavCategory[];
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  if (categories.length === 0) {
    return (
      <Link href={href} className={navLinkClass(active)}>
        {label}
      </Link>
    );
  }

  const closeDropdown = () => setDropdownOpen(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setDropdownOpen(true)}
      onMouseLeave={closeDropdown}
      onFocus={() => setDropdownOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) closeDropdown();
      }}
    >
      <Link
        href={href}
        className={navLinkClass(active)}
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        onClick={closeDropdown}
      >
        {label}
      </Link>
      <div
        className={`absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 pt-3 transition-opacity duration-200 ${
          dropdownOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <ul
          role="menu"
          aria-label={label}
          className="overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-[0_8px_30px_rgba(1,38,83,0.12)]"
        >
          {categories.map((category) => (
            <li key={category.slug} role="none">
              <Link
                href={`${href}/${category.slug}`}
                role="menuitem"
                className="block px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-700"
                onClick={closeDropdown}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Wordmark({ basePath, logoUrl }: { basePath: string; logoUrl: string }) {
  return (
    <Link href={`${basePath}/`} className="group flex items-center gap-2.5">
      <Image
        src={logoUrl}
        alt=""
        aria-hidden
        width={32}
        height={32}
        className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
      />
      <span className="font-display text-lg tracking-tight">{SITE_NAME.toUpperCase()}</span>
    </Link>
  );
}

export function Header({ dict, basePath = "", routes, locale, slugPairs, phone, categories = [], logoUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const overlayRef = useRef<HTMLDivElement>(null);

  const productsHref = `${basePath}/${routes.products}`;

  const items = [
    { href: `${basePath}/`, label: dict.nav.home },
    { href: `${basePath}/${routes.about}`, label: dict.nav.about },
    { href: `${basePath}/${routes.services}`, label: dict.nav.services },
    { href: productsHref, label: dict.nav.products, categories },
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
        scrolled ? "border-line bg-paper/90 shadow-[0_1px_0_0_rgba(1,38,83,0.07)] backdrop-blur-md" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Wordmark basePath={basePath} logoUrl={logoUrl} />

        <nav className="hidden items-center gap-7 md:flex" aria-label={dict.header.menuLabel}>
          {items.map((item) =>
            item.categories ? (
              <ProductsNavItem
                key={item.href}
                href={item.href}
                label={item.label}
                active={isActive(item.href)}
                categories={item.categories}
              />
            ) : (
              <Link key={item.href} href={item.href} className={navLinkClass(isActive(item.href))}>
                {item.label}
              </Link>
            ),
          )}
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 py-2 pr-4.5 pl-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {dict.common.callNow}
            </a>
          )}
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
              <Image
                src={logoUrl}
                alt=""
                aria-hidden
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
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
              <div key={item.href}>
                <Link
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
                {item.categories && item.categories.length > 0 && (
                  <ul className="mb-2 ml-10 space-y-1 border-l border-white/10 pl-4">
                    {item.categories.map((category) => (
                      <li key={category.slug}>
                        <Link
                          href={`${item.href}/${category.slug}`}
                          className="block py-1.5 text-base text-white/45 transition-colors hover:text-white"
                          onClick={() => setOpen(false)}
                        >
                          {category.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>

          <div data-menu-foot className="border-t border-white/10 px-6 py-6">
            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="flex w-full items-center justify-between rounded-full bg-white px-6 py-3.5 font-display text-base text-brand-800"
                onClick={() => setOpen(false)}
              >
                {dict.common.callNow}
                <Phone className="h-5 w-5" aria-hidden />
              </a>
            )}
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
