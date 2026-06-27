import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import type { Locale } from "@/lib/database.types";
import {
  servicesContent,
  type ServiceImage,
  type ServiceSection,
} from "@/data/services";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { storageUrl } from "@/lib/site";

/**
 * Bespoke services page. Signature: every service photo is framed as if seen
 * through a window — a thin mullion cross plus a measurement "sightline" tick
 * rule along the top edge — tying the photography to the glazing craft.
 */
export function ServicesView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const basePath = basePathFor(locale);
  const { hero, sections, featureCards } = servicesContent;

  return (
    <>
      <ServicesHero
        breadcrumbLabel={dict.nav.home}
        breadcrumbHref={basePath || "/"}
        title={hero.title}
        subtitle={hero.subtitle}
        categories={hero.categories}
      />

      {sections.map((section, i) => (
        <ServiceBlock key={section.id} section={section} index={i} flip={i % 2 === 1} />
      ))}

      <FeatureCards heading={featureCards.heading} cards={featureCards.cards} />
    </>
  );
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

/* ── Hero ──────────────────────────────────────────────────────────────── */

function ServicesHero({
  breadcrumbLabel,
  breadcrumbHref,
  title,
  subtitle,
  categories,
}: {
  breadcrumbLabel: string;
  breadcrumbHref: string;
  title: string;
  subtitle: string;
  categories: string[];
}) {
  return (
    <header className="relative overflow-hidden border-b border-line bg-brand-950 text-white">
      {/* Mullion hairlines + soft glazing glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/4 h-full w-px bg-white/10" />
        <span className="absolute top-0 left-2/4 h-full w-px bg-white/10" />
        <span className="absolute top-0 left-3/4 h-full w-px bg-white/10" />
        <div className="absolute -top-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-[radial-gradient(closest-side,rgba(141,215,247,0.28),transparent)]" />
      </div>

      <Container className="relative pt-12 pb-0 sm:pt-16">
        <Reveal y={12}>
          <nav aria-label="Breadcrumb" className="kicker text-brand-100">
            <Link href={breadcrumbHref} className="transition-colors hover:text-white">
              {breadcrumbLabel}
            </Link>
            <span aria-hidden className="mx-2 text-white/30">
              /
            </span>
            <span className="text-white/70">{title}</span>
          </nav>
        </Reveal>

        <SplitHeading
          as="h1"
          text={title}
          onScroll={false}
          delay={0.12}
          className="mt-6 max-w-4xl font-display text-5xl leading-[0.95] text-white sm:text-7xl"
        />

        <Reveal delay={0.4} y={18}>
          <p className="mt-6 max-w-xl font-serif text-xl text-accent italic sm:text-2xl">
            {subtitle}
          </p>
        </Reveal>

        {/* Glazing systems — a divided spec strip */}
        <Reveal delay={0.55} y={16}>
          <ul className="mt-10 grid grid-cols-2 border-t border-white/15 sm:mt-14 sm:grid-cols-4">
            {categories.map((category, i) => (
              <li
                key={category}
                className={`flex items-center gap-3 py-5 sm:py-6 ${
                  i !== 0 ? "sm:border-l sm:border-white/15 sm:pl-6" : ""
                } ${i % 2 === 1 ? "border-l border-white/15 pl-4 sm:pl-6" : ""}`}
              >
                <span aria-hidden className="block h-2.5 w-2.5 shrink-0 bg-accent" />
                <span className="text-sm font-semibold tracking-wide text-white/90 uppercase">
                  {category}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </header>
  );
}

/* ── Service block ─────────────────────────────────────────────────────── */

/** Photo framed like a window: mullion cross + top sightline tick rule. */
function FramedPhoto({ image, index }: { image: ServiceImage; index: number }) {
  return (
    <div className="group relative aspect-[4/3] overflow-hidden border border-line bg-brand-50">
      <Image
        src={storageUrl("media", image.path)}
        alt={image.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />

      {/* Mullion cross — the window we look through */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-white/40 mix-blend-overlay" />
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/40 mix-blend-overlay" />
      </div>

      {/* Sightline tick rule + serif index — the measuring motif */}
      <div className="absolute top-0 left-0 flex w-full items-center justify-between bg-gradient-to-b from-brand-950/55 to-transparent px-4 pt-3 pb-8">
        <div aria-hidden className="flex items-end gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="block w-px bg-white/70"
              style={{ height: i % 3 === 0 ? "0.85rem" : "0.5rem" }}
            />
          ))}
        </div>
        <span aria-hidden className="font-serif text-2xl text-white/80 italic">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function ServiceBlock({
  section,
  index,
  flip,
}: {
  section: ServiceSection;
  index: number;
  flip: boolean;
}) {
  return (
    <section className="border-b border-line py-14 sm:py-20">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={flip ? "lg:order-2" : ""}>
          <FramedPhoto image={section.image} index={index} />
        </Reveal>

        <Reveal y={20} delay={0.1} className={flip ? "lg:order-1" : ""}>
          <div className="flex items-start gap-4">
            <span aria-hidden className="mt-2.5 block h-3.5 w-3.5 shrink-0 bg-brand-700" />
            <h2 className="font-display text-3xl text-slate-900 sm:text-4xl">
              {section.heading}
            </h2>
          </div>

          {section.subheading && (
            <p className="mt-5 max-w-xl text-lg leading-relaxed font-medium text-slate-800">
              {section.subheading}
            </p>
          )}
          {section.body && (
            <p className="mt-4 max-w-xl leading-relaxed text-slate-600">{section.body}</p>
          )}

          <ul className="mt-7 space-y-px border-t border-line">
            {section.items.map((item) => (
              <li
                key={item}
                className="group flex items-start gap-4 border-b border-line py-3.5 transition-colors hover:bg-brand-50/50"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white"
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-sm leading-snug text-slate-700 sm:text-base">{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/* ── Feature cards ─────────────────────────────────────────────────────── */

function FeatureCards({
  heading,
  cards,
}: {
  heading: string;
  cards: { title: string; image: ServiceImage }[];
}) {
  return (
    <section className="bg-brand-950 py-16 text-white sm:py-24">
      <Container>
        <Reveal>
          <div className="flex items-start gap-4">
            <span aria-hidden className="mt-2.5 block h-3.5 w-3.5 shrink-0 bg-accent sm:mt-3.5" />
            <SplitHeading
              text={heading}
              className="max-w-3xl font-display text-3xl text-white sm:text-4xl"
            />
          </div>
        </Reveal>

        <Reveal stagger={0.1} className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {cards.map((card) => (
            <article
              key={card.title}
              className="group relative aspect-[3/4] overflow-hidden border border-white/10"
            >
              <Image
                src={storageUrl("media", card.image.path)}
                alt={card.image.alt}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/30 to-transparent"
              />
              {/* Corner mullion tick — the window detail repeated */}
              <span
                aria-hidden
                className="absolute top-4 left-4 h-6 w-6 border-t border-l border-white/50"
              />
              <h3 className="absolute right-5 bottom-5 left-5 font-display text-xl tracking-wide text-white uppercase">
                <span aria-hidden className="mb-3 block h-px w-10 bg-accent transition-all duration-500 group-hover:w-16" />
                {card.title}
              </h3>
            </article>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
