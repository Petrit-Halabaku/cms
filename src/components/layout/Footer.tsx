import Link from "next/link";

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
    { href: `${basePath}/${routes.getQuote}`, label: dict.nav.getQuote },
  ];

  return (
    <footer className="mt-auto border-t border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-bold tracking-tight text-brand-800">
            {SITE_NAME.toUpperCase()}
          </p>
          <p className="mt-3 max-w-xs text-sm text-slate-600">{dict.footer.tagline}</p>
        </div>

        <nav aria-label={dict.footer.quickLinks}>
          <p className="text-sm font-semibold text-slate-900">{dict.footer.quickLinks}</p>
          <ul className="mt-3 space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-slate-600 transition-colors hover:text-brand-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold text-slate-900">{dict.footer.contactTitle}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>{contact.address}</li>
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-brand-700">
                {contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-brand-700">
                {contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4">
        <p className="mx-auto max-w-7xl px-4 text-xs text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {SITE_NAME}. {dict.footer.rights}
        </p>
      </div>
    </footer>
  );
}
