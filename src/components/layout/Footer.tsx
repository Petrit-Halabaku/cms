import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import type { Dictionary } from "@/lib/i18n/dictionary";
import { SITE_NAME } from "@/lib/site";

type Props = {
  dict: Dictionary;
  basePath?: string;
  routes: {
    about: string;
    services: string;
    products: string;
    contact: string;
    getQuote: string;
  };
  contact: { address: string; phone: string; email: string };
};

export function Footer({ dict, basePath = "", routes, contact }: Props) {
  const links = [
    { href: `${basePath}/${routes.about}`, label: dict.nav.about },
    { href: `${basePath}/${routes.services}`, label: dict.nav.services },
    { href: `${basePath}/${routes.products}`, label: dict.nav.products },
    { href: `${basePath}/${routes.contact}`, label: dict.nav.contact },
  ];

  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/10 bg-brand-950 text-white">
      {/* Mullion hairlines + a faint blue glow up top */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute left-1/4 top-0 h-full w-px bg-white/4" />
        <span className="absolute left-2/4 top-0 h-full w-px bg-white/4" />
        <span className="absolute left-3/4 top-0 h-full w-px bg-white/4" />
        <div className="absolute -top-32 right-0 h-64 w-2/3 bg-[radial-gradient(closest-side,rgba(29,78,216,0.25),transparent)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pt-20 pb-16 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center bg-white font-display text-lg text-brand-800">
              G
            </span>
            <span className="font-display text-xl tracking-tight">{SITE_NAME.toUpperCase()}</span>
          </div>
          <p className="mt-5 max-w-xs font-serif text-xl italic text-brand-100/80">
            {dict.footer.tagline}
          </p>
          <Link
            href={`${basePath}/${routes.getQuote}`}
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-white hover:bg-white hover:text-brand-900"
          >
            {dict.nav.getQuote}
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </Link>
        </div>

        <nav aria-label={dict.footer.quickLinks} className="lg:col-span-3">
          <p className="text-[0.6875rem] font-semibold tracking-[0.24em] uppercase text-brand-100/60">{dict.footer.quickLinks}</p>
          <ul className="mt-5 space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-white/70 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <p className="text-[0.6875rem] font-semibold tracking-[0.24em] uppercase text-brand-100/60">{dict.footer.contactTitle}</p>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-100/60" aria-hidden />
              {contact.address}
            </li>
            <li>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4 shrink-0 text-brand-100/60" aria-hidden />
                {contact.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-brand-100/60" aria-hidden />
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-hidden>
        <p className="select-none font-display text-[clamp(4rem,15.5vw,13rem)] leading-[0.82] tracking-tight text-white/8">
          {SITE_NAME.toUpperCase()}
        </p>
      </div>

      <div className="relative border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 text-xs text-white/45 sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE_NAME}. {dict.footer.rights}
          </p>
          <p className="font-display tracking-[0.18em]">PEJË · KOSOVË</p>
        </div>
      </div>
    </footer>
  );
}
