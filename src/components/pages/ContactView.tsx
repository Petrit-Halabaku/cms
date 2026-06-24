import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { PageHero } from "@/components/PageHero";
import type { Locale } from "@/lib/database.types";
import { getPage } from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { contactInfoSchema, parseContent } from "@/lib/sections";
import { storageUrl } from "@/lib/site";

export async function ContactView({ locale }: { locale: Locale }) {
  const page = await getPage(locale, "contact");
  if (!page) notFound();
  const dict = getDictionary(locale);
  const infoSection = page.sections.find((s) => s.type === "contact-info");
  const info = parseContent(contactInfoSchema, infoSection?.content ?? {});

  return (
    <>
      <PageHero
        kicker={dict.footer.tagline}
        title={page.title}
        image={storageUrl("media", "hero/contact.webp")}
        imageAlt={page.title}
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8">
        <Reveal>
          <h2 className="flex items-center gap-3 font-display text-xl text-slate-900">
            <span aria-hidden className="block h-2.5 w-2.5 bg-brand-700" />
            {info.heading}
          </h2>
          <ul className="mt-8 border-t border-line">
            <li className="flex items-start gap-3.5 border-b border-line py-4 text-slate-600">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
              {info.address}
            </li>
            <li className="border-b border-line">
              <a
                href={`tel:${info.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-3.5 py-4 text-slate-600 transition-colors hover:text-brand-700"
              >
                <Phone className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
                {info.phone}
              </a>
            </li>
            {info.phone2 && (
              <li className="border-b border-line">
                <a
                  href={`tel:${info.phone2.replace(/\s/g, "")}`}
                  className="flex items-center gap-3.5 py-4 text-slate-600 transition-colors hover:text-brand-700"
                >
                  <Phone className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
                  {info.phone2}
                </a>
              </li>
            )}
            <li className="border-b border-line">
              <a
                href={`mailto:${info.email}`}
                className="flex items-center gap-3.5 py-4 text-slate-600 transition-colors hover:text-brand-700"
              >
                <Mail className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
                {info.email}
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative h-full">
            <div
              aria-hidden
              className="absolute -top-4 -right-4 h-full w-full border border-brand-200 bg-brand-50"
            />
            <div className="relative h-full overflow-hidden border border-line bg-brand-50">
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
        </Reveal>
      </div>
    </>
  );
}
