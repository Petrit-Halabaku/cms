import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

import { FaqAccordion } from "@/components/FaqAccordion";
import { MediaImage } from "@/components/MediaImage";
import { ProductGrid } from "@/components/ProductCard";
import type { Locale } from "@/lib/database.types";
import {
  getFaqs,
  getFeaturedProducts,
  getMediaByIds,
  getPartners,
  type PageSection,
} from "@/lib/db/content";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { ROUTE_SLUGS } from "@/lib/site";
import {
  cardsSchema,
  countersSchema,
  ctaSchema,
  gallerySchema,
  headingOnlySchema,
  heroSchema,
  listSchema,
  locationSchema,
  parseContent,
  richTextSchema,
} from "@/lib/sections";

type Ctx = {
  locale: Locale;
  basePath: string;
  dict: Dictionary;
};

/** Renders one page_sections row by its `type`. Unknown types render nothing. */
export async function SectionRenderer({
  section,
  ctx,
}: {
  section: PageSection;
  ctx: Ctx;
}) {
  switch (section.type) {
    case "hero":
      return <Hero section={section} ctx={ctx} />;
    case "cards":
      return <Cards section={section} columns={3} />;
    case "grid":
      return <Cards section={section} columns={4} />;
    case "product-grid":
      return <FeaturedProducts section={section} ctx={ctx} />;
    case "faq":
      return <FaqSection section={section} ctx={ctx} />;
    case "logo-strip":
      return <Partners section={section} ctx={ctx} />;
    case "counters":
      return <Counters section={section} />;
    case "location":
      return <LocationBlock section={section} ctx={ctx} />;
    case "cta":
      return <QuoteCta section={section} ctx={ctx} />;
    case "rich-text":
      return <RichText section={section} />;
    case "list":
      return <ListSection section={section} />;
    case "gallery":
      return <GallerySection section={section} ctx={ctx} />;
    default:
      return null;
  }
}

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
  );
}

function Hero({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(heroSchema, section.content);
  return (
    <section className="bg-brand-50">
      <Container className="py-20 sm:py-28">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          {content.heading}
        </h1>
        {content.subheading && (
          <p className="mt-6 max-w-2xl text-lg text-slate-600">{content.subheading}</p>
        )}
        <div className="mt-10 flex flex-wrap items-center gap-4">
          {content.phone && (
            <a
              href={`tel:${content.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-brand-800"
            >
              <Phone className="h-5 w-5" aria-hidden />
              {content.cta_label || ctx.dict.common.callNow}
            </a>
          )}
          <Link
            href={`${ctx.basePath}/${ROUTE_SLUGS[ctx.locale].products}`}
            className="inline-flex items-center rounded-md border border-brand-700 px-6 py-3 text-base font-semibold text-brand-700 transition-colors hover:bg-brand-100"
          >
            {ctx.dict.nav.products}
          </Link>
        </div>
      </Container>
    </section>
  );
}

function Cards({ section, columns }: { section: PageSection; columns: 3 | 4 }) {
  const content = parseContent(cardsSchema, section.content);
  if (content.items.length === 0) return null;
  const cols = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <section>
      <Container className="py-16">
        {content.heading && (
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.heading}</h2>
        )}
        <div className={`mt-10 grid grid-cols-1 gap-6 ${cols}`}>
          {content.items.map((item) => (
            <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

async function FeaturedProducts({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(headingOnlySchema, section.content);
  const products = await getFeaturedProducts(ctx.locale, 6);
  if (products.length === 0) return null;
  return (
    <section className="bg-slate-50">
      <Container className="py-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.heading}</h2>
          <Link
            href={`${ctx.basePath}/${ROUTE_SLUGS[ctx.locale].products}`}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {ctx.dict.common.viewAll} →
          </Link>
        </div>
        <div className="mt-10">
          <ProductGrid
            products={products}
            locale={ctx.locale}
            hrefFor={(p) =>
              `${ctx.basePath}/${ROUTE_SLUGS[ctx.locale].products}/${
                (p as (typeof products)[number]).categorySlug
              }/${p.slug}`
            }
          />
        </div>
      </Container>
    </section>
  );
}

async function FaqSection({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(headingOnlySchema, section.content);
  const faqs = await getFaqs(ctx.locale);
  if (faqs.length === 0) return null;
  return (
    <section>
      <Container className="py-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.heading}</h2>
        <div className="mt-10 max-w-3xl">
          <FaqAccordion faqs={faqs} />
        </div>
      </Container>
    </section>
  );
}

async function Partners({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(headingOnlySchema, section.content);
  const partners = await getPartners();
  if (partners.length === 0) return null;
  return (
    <section className="bg-slate-50">
      <Container className="py-16">
        {content.heading && (
          <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
            {content.heading}
          </h2>
        )}
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {partners.map((partner) => (
            <li key={partner.id} className="flex h-12 items-center" title={partner.name}>
              {partner.logo ? (
                <MediaImage
                  media={partner.logo}
                  locale={ctx.locale}
                  className="max-h-12 w-auto object-contain grayscale transition hover:grayscale-0"
                  sizes="160px"
                />
              ) : (
                <span className="text-sm font-medium text-slate-400">{partner.name}</span>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function Counters({ section }: { section: PageSection }) {
  const content = parseContent(countersSchema, section.content);
  if (content.items.length === 0) return null;
  return (
    <section className="bg-brand-800">
      <Container className="py-16">
        {content.heading && (
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            {content.heading}
          </h2>
        )}
        <dl className="mt-10 grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {content.items.map((item) => (
            <div key={item.label}>
              <dd className="text-4xl font-bold text-white">{item.value}</dd>
              <dt className="mt-2 text-sm text-brand-100">{item.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}

function LocationBlock({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(locationSchema, section.content);
  return (
    <section>
      <Container className="py-16">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.heading}</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <div className="space-y-4 text-slate-600">
            <p className="flex items-center gap-2">
              <MapPin className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
              {content.address}
            </p>
            {content.phone && (
              <p className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
                <a
                  href={`tel:${content.phone.replace(/\s/g, "")}`}
                  className="hover:text-brand-700"
                >
                  {content.phone}
                </a>
              </p>
            )}
            <a
              href={`https://www.google.com/maps?q=${content.lat},${content.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              {ctx.dict.common.openInMaps} →
            </a>
          </div>
          <div>
            {content.hours.length > 0 && (
              <table className="w-full text-sm">
                <tbody>
                  {content.hours.map((row) => (
                    <tr key={row.days} className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-900">{row.days}</td>
                      <td className="py-2 text-right text-slate-600">{row.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

function QuoteCta({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(ctaSchema, section.content);
  return (
    <section className="bg-brand-700">
      <Container className="flex flex-col items-start gap-6 py-16 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{content.heading}</h2>
          {content.body && <p className="mt-2 max-w-xl text-brand-100">{content.body}</p>}
        </div>
        <Link
          href={`${ctx.basePath}/${ROUTE_SLUGS[ctx.locale].getQuote}`}
          className="shrink-0 rounded-md bg-white px-6 py-3 text-base font-semibold text-brand-700 transition-colors hover:bg-brand-50"
        >
          {content.cta_label || ctx.dict.nav.getQuote}
        </Link>
      </Container>
    </section>
  );
}

function RichText({ section }: { section: PageSection }) {
  const content = parseContent(richTextSchema, section.content);
  return (
    <section>
      <Container className="py-16">
        {content.heading && (
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.heading}</h2>
        )}
        <div className="mt-6 max-w-3xl space-y-4 text-slate-600">
          {content.body.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ListSection({ section }: { section: PageSection }) {
  const content = parseContent(listSchema, section.content);
  if (content.items.length === 0) return null;
  return (
    <section>
      <Container className="py-12">
        {content.heading && (
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">{content.heading}</h2>
        )}
        <ul className="mt-6 max-w-2xl list-disc space-y-2 pl-5 text-slate-600">
          {content.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

async function GallerySection({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(gallerySchema, section.content);
  const media = await getMediaByIds(content.media_ids);
  if (media.length === 0) return null;
  return (
    <section>
      <Container className="py-16">
        {content.heading && (
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">{content.heading}</h2>
        )}
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
              <MediaImage
                media={item}
                locale={ctx.locale}
                className="h-full w-full object-cover"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
