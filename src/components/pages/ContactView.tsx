import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/forms/ContactForm";
import type { Locale } from "@/lib/database.types";
import { getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { contactInfoSchema, parseContent } from "@/lib/sections";

export async function ContactView({ locale }: { locale: Locale }) {
  const page = await getPage(locale, "contact");
  if (!page) notFound();
  const dict = getDictionary(locale);
  const infoSection = page.sections.find((s) => s.type === "contact-info");
  const info = parseContent(contactInfoSchema, infoSection?.content ?? {});

  return (
    <>
      <header className="bg-brand-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">{page.title}</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{info.heading}</h2>
          <ul className="mt-6 space-y-4 text-slate-600">
            <li className="flex items-center gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
              {info.address}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
              <a href={`tel:${info.phone.replace(/\s/g, "")}`} className="hover:text-brand-700">
                {info.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
              <a href={`mailto:${info.email}`} className="hover:text-brand-700">
                {info.email}
              </a>
            </li>
          </ul>

          <ContactForm locale={locale} dict={dict} />
        </div>

        <div className="overflow-hidden rounded-lg bg-slate-100">
          <iframe
            title={info.heading}
            src={`https://www.google.com/maps?q=${info.lat},${info.lng}&z=15&output=embed`}
            className="h-full min-h-[420px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </>
  );
}
