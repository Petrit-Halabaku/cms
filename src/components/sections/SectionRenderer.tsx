import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  MapPin,
  PanelTop,
  Phone,
  RefreshCw,
  Settings,
  Wrench,
} from "lucide-react";

import { FaqAccordion } from "@/components/FaqAccordion";
import { MediaImage } from "@/components/MediaImage";
import { CountUp } from "@/components/motion/CountUp";
import { HeroVisual } from "@/components/motion/HeroVisual";
import { Marquee } from "@/components/motion/Marquee";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
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
  /** Business phone for click-to-call CTAs. */
  phone?: string;
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

/** Faint vertical hairlines echoing window mullions, used on light bands. */
function MullionLines() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <span className="absolute top-0 left-1/4 h-full w-px bg-line/70" />
      <span className="absolute top-0 left-2/4 h-full w-px bg-line/70" />
      <span className="absolute top-0 left-3/4 h-full w-px bg-line/70" />
    </div>
  );
}

/** Section heading marked with a small blue pane. */
function SectionHeading({
  heading,
  className = "",
  dark = false,
}: {
  heading: string;
  className?: string;
  /** Light heading text for dark (navy) section backgrounds. */
  dark?: boolean;
}) {
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <span aria-hidden className="mt-2.5 block h-3.5 w-3.5 shrink-0 bg-brand-700 sm:mt-3.5" />
      <SplitHeading
        text={heading}
        className={`font-display text-3xl sm:text-4xl ${dark ? "text-white" : "text-slate-900"}`}
      />
    </div>
  );
}

function Hero({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(heroSchema, section.content);
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <MullionLines />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 -left-48 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(141,215,247,0.5),transparent)]"
      />

      <Container className="relative grid gap-12 py-12 sm:py-16 lg:grid-cols-12 lg:items-center lg:py-20">
        <div className="lg:col-span-7">
          <Reveal y={14}>
            <p className="kicker">{ctx.dict.footer.tagline}</p>
          </Reveal>
          <SplitHeading
            as="h1"
            text={content.heading}
            accentLast
            onScroll={false}
            delay={0.15}
            className="mt-6 max-w-3xl font-display text-5xl leading-[0.95] text-slate-900 sm:text-6xl lg:text-7xl"
          />
          {content.subheading && (
            <Reveal delay={0.5} y={20}>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-slate-600">
                {content.subheading}
              </p>
            </Reveal>
          )}
          <Reveal delay={0.65} y={20} className="mt-8 flex flex-wrap items-center gap-4">
            {content.phone && (
              <a
                href={`tel:${content.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2.5 rounded-full bg-brand-700 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-brand-800"
              >
                <Phone className="h-4.5 w-4.5" aria-hidden />
                {content.cta_label || ctx.dict.common.callNow}
              </a>
            )}
            <Link
              href={`${ctx.basePath}/${ROUTE_SLUGS[ctx.locale].products}`}
              className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-7 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:border-brand-700 hover:text-brand-700"
            >
              {ctx.dict.nav.products}
              <ArrowUpRight
                className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <HeroVisual className="mx-auto w-full max-w-sm pb-6 lg:max-w-none" />
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
    <section className="py-12 sm:py-16">
      <Container>
        {content.heading && <SectionHeading heading={content.heading} />}
        <Reveal
          stagger={0.1}
          className={`mt-8 grid grid-cols-1 border-t border-l border-line ${cols}`}
        >
          {content.items.map((item, i) => (
            <div key={item.title} className="group relative flex flex-col border-r border-b border-line bg-paper p-6 transition-colors duration-300 hover:bg-brand-50/60 sm:p-8">
              <span
                aria-hidden
                className="absolute top-0 left-0 h-0.5 w-0 bg-brand-700 transition-all duration-500 group-hover:w-full"
              />
              <span
                aria-hidden
                className="font-serif text-3xl leading-none text-brand-200 italic transition-colors duration-300 group-hover:text-brand-700"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-lg text-slate-900 sm:text-xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}

async function FeaturedProducts({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(headingOnlySchema, section.content);
  const products = await getFeaturedProducts(ctx.locale, 6);
  if (products.length === 0) return null;
  return (
    <section className="border-y border-line bg-white py-12 sm:py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading heading={content.heading} />
          <Link
            href={`${ctx.basePath}/${ROUTE_SLUGS[ctx.locale].products}`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            {ctx.dict.common.viewAll}
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
        <div className="mt-8">
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
    <section className="relative overflow-hidden bg-brand-950 py-12 sm:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/4 h-full w-px bg-white/5" />
        <span className="absolute top-0 left-2/4 h-full w-px bg-white/5" />
        <span className="absolute top-0 left-3/4 h-full w-px bg-white/5" />
      </div>
      <Container className="relative grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <SectionHeading heading={content.heading} dark />
          </div>
        </div>
        <Reveal className="lg:col-span-8">
          <FaqAccordion faqs={faqs} />
        </Reveal>
      </Container>
    </section>
  );
}

async function Partners({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(headingOnlySchema, section.content);
  const partners = await getPartners();
  if (partners.length === 0) return null;
  return (
    <section className="border-y border-line bg-white py-14">
      {content.heading && (
        <p className="kicker mb-10 text-center">{content.heading}</p>
      )}
      <Marquee>
        {partners.map((partner) => (
          <div key={partner.id} className="flex h-12 shrink-0 items-center" title={partner.name}>
            {partner.logo ? (
              <MediaImage
                media={partner.logo}
                locale={ctx.locale}
                className="max-h-12 w-auto object-contain opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
                sizes="160px"
              />
            ) : (
              <span className="font-display text-lg whitespace-nowrap text-slate-400">
                {partner.name}
              </span>
            )}
          </div>
        ))}
      </Marquee>
    </section>
  );
}

function Counters({ section }: { section: PageSection }) {
  const content = parseContent(countersSchema, section.content);
  if (content.items.length === 0) return null;
  return (
    <section className="relative overflow-hidden bg-brand-950 py-12 sm:py-16">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/4 h-full w-px bg-white/5" />
        <span className="absolute top-0 left-2/4 h-full w-px bg-white/5" />
        <span className="absolute top-0 left-3/4 h-full w-px bg-white/5" />
        <div className="absolute -bottom-32 left-0 h-64 w-1/2 bg-[radial-gradient(closest-side,rgba(0,64,255,0.22),transparent)]" />
      </div>
      <Container className="relative">
        {content.heading && (
          <SplitHeading
            text={content.heading}
            className="text-center font-display text-3xl text-white sm:text-4xl"
          />
        )}
        <Reveal
          stagger={0.12}
          className="mt-8 grid grid-cols-2 gap-y-12 lg:grid-cols-4"
        >
          {content.items.map((item) => (
            <div
              key={item.label}
              className="border-l border-white/10 px-6 first:border-l-0 lg:px-10"
            >
              <CountUp
                value={item.value}
                className="font-display text-5xl text-white sm:text-6xl"
              />
              <p className="mt-3 text-[0.6875rem] font-semibold tracking-[0.24em] text-accent/80 uppercase">
                {item.label}
              </p>
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}

function LocationBlock({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(locationSchema, section.content);
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <SectionHeading heading={content.heading} />
        <Reveal className="mt-8 grid border-t border-l border-line sm:grid-cols-2">
          <div className="space-y-5 border-r border-b border-line bg-paper p-8 sm:p-10">
            <p className="flex items-start gap-3 text-slate-600">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" aria-hidden />
              {content.address}
            </p>
            {content.phone && (
              <p className="flex items-center gap-3 text-slate-600">
                <Phone className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
                <a
                  href={`tel:${content.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-brand-700"
                >
                  {content.phone}
                </a>
                {content.phone2 && (
                  <>
                    <span aria-hidden className="text-slate-300">·</span>
                    <a
                      href={`tel:${content.phone2.replace(/\s/g, "")}`}
                      className="transition-colors hover:text-brand-700"
                    >
                      {content.phone2}
                    </a>
                  </>
                )}
              </p>
            )}
            <a
              href={`https://www.google.com/maps?q=${content.lat},${content.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              {ctx.dict.common.openInMaps}
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </a>
          </div>
          <div className="border-r border-b border-line bg-paper p-8 sm:p-10">
            {content.hours.length > 0 && (
              <table className="w-full text-sm">
                <tbody>
                  {content.hours.map((row) => (
                    <tr key={row.days} className="border-b border-line last:border-b-0">
                      <td className="py-3 font-semibold text-slate-900">{row.days}</td>
                      <td className="py-3 text-right text-slate-600">{row.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function QuoteCta({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(ctaSchema, section.content);
  return (
    <section className="relative overflow-hidden bg-brand-700">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/4 h-full w-px bg-white/8" />
        <span className="absolute top-0 left-2/4 h-full w-px bg-white/8" />
        <span className="absolute top-0 left-3/4 h-full w-px bg-white/8" />
        <div className="absolute -top-24 right-0 h-72 w-2/3 bg-[radial-gradient(closest-side,rgba(255,255,255,0.12),transparent)]" />
      </div>
      <Container className="relative py-16 sm:py-20">
        <SplitHeading
          text={content.heading}
          className="max-w-3xl font-display text-4xl leading-[0.95] text-white sm:text-5xl lg:text-6xl"
        />
        {content.body && (
          <Reveal delay={0.2} y={20}>
            <p className="mt-6 max-w-xl text-lg text-brand-100">{content.body}</p>
          </Reveal>
        )}
        <Reveal delay={0.3} y={20}>
          {ctx.phone ? (
            <a
              href={`tel:${ctx.phone.replace(/\s/g, "")}`}
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-display text-base text-brand-800 transition-transform duration-300 hover:scale-[1.03]"
            >
              <Phone className="h-5 w-5" aria-hidden />
              {content.cta_label || ctx.dict.common.callNow}
            </a>
          ) : (
            <Link
              href={`${ctx.basePath}/${ROUTE_SLUGS[ctx.locale].contact}`}
              className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-display text-base text-brand-800 transition-transform duration-300 hover:scale-[1.03]"
            >
              {ctx.dict.nav.contact}
              <ArrowUpRight
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </Link>
          )}
        </Reveal>
      </Container>
    </section>
  );
}

function RichText({ section }: { section: PageSection }) {
  const content = parseContent(richTextSchema, section.content);
  const paragraphs = content.body.split("\n\n").filter(Boolean);
  return (
    <section className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,rgba(141,215,247,0.28),transparent)]"
      />
      <Container className="relative grid gap-x-12 gap-y-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          {content.heading && (
            <div className="lg:sticky lg:top-28">
              <span aria-hidden className="block h-px w-12 bg-brand-700" />
              <SectionHeading heading={content.heading} className="mt-6" />
            </div>
          )}
        </div>
        <Reveal className="space-y-5 lg:col-span-8 lg:col-start-5">
          {paragraphs.map((paragraph, i) =>
            i === 0 ? (
              <p
                key={i}
                className="border-l-2 border-brand-700 pl-5 font-display text-xl leading-snug text-slate-900 sm:pl-6 sm:text-2xl"
              >
                {paragraph}
              </p>
            ) : (
              <p key={i} className="max-w-2xl leading-relaxed text-slate-600">
                {paragraph}
              </p>
            ),
          )}
        </Reveal>
      </Container>
    </section>
  );
}

const MAINTENANCE_ICONS = [Wrench, RefreshCw, Settings, Layers, PanelTop] as const;

function ListSection({ section }: { section: PageSection }) {
  const content = parseContent(listSchema, section.content);
  if (content.items.length === 0) return null;

  const isProcess = section.key === "installation";

  if (isProcess) {
    return (
      <section className="relative bg-paper py-12 sm:py-16">
        <MullionLines />
        <Container className="relative grid gap-8 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            {content.heading && (
              <div className="lg:sticky lg:top-28">
                <SectionHeading heading={content.heading} />
              </div>
            )}
          </div>
          <Reveal stagger={0.08} className="lg:col-span-8">
            <ol className="space-y-3 sm:space-y-4">
              {content.items.map((item, i) => (
                <li
                  key={i}
                  className="group flex items-center gap-4 border border-line bg-white p-4 transition-colors hover:border-brand-700 sm:gap-5 sm:p-5"
                >
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-700 font-display text-sm text-white sm:h-12 sm:w-12 sm:text-base"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-display text-base leading-snug text-slate-900 sm:text-lg">
                    {item}
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section className="border-y border-line bg-white py-12 sm:py-16">
      <Container className="grid gap-8 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          {content.heading && (
            <div className="lg:sticky lg:top-28">
              <SectionHeading heading={content.heading} />
            </div>
          )}
        </div>
        <Reveal
          stagger={0.07}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:col-span-8"
        >
          {content.items.map((item, i) => {
            const Icon = MAINTENANCE_ICONS[i % MAINTENANCE_ICONS.length];
            return (
              <div
                key={i}
                className="group flex items-center gap-4 border border-line bg-paper p-4 transition-colors hover:border-brand-700 hover:bg-brand-50/50 sm:p-5"
              >
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm leading-snug text-slate-700 sm:text-base">{item}</p>
              </div>
            );
          })}
        </Reveal>
      </Container>
    </section>
  );
}

async function GallerySection({ section, ctx }: { section: PageSection; ctx: Ctx }) {
  const content = parseContent(gallerySchema, section.content);
  const media = await getMediaByIds(content.media_ids);
  if (media.length === 0) return null;
  return (
    <section className="py-12 sm:py-16">
      <Container>
        {content.heading && <SectionHeading heading={content.heading} />}
        <Reveal stagger={0.08} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="group relative aspect-square overflow-hidden bg-brand-50">
              <MediaImage
                media={item}
                locale={ctx.locale}
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </div>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
