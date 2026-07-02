import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { storageUrl } from "@/lib/site";
import { HeroBackdrop } from "./HeroBackdrop";
import { WindowFrame } from "./WindowFrame";

/**
 * Shared building blocks for the bespoke editorial pages (services, about).
 * Signature: photography is framed as if seen through a window — a thin mullion
 * cross plus a measurement "sightline" tick rule — tying images to the glazing
 * craft. Kept in one place so every editorial page reads as the same system.
 */

export type EditorialImage = { path: string; alt: string };
export type SpecItem = { value?: string; label: string };

export function EditorialContainer({
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

/** Heading prefixed with the small brand "pane" square. */
export function PaneHeading({
  text,
  as = "h2",
  split = false,
  accent = false,
  light = false,
  className = "",
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  /** Animate words rising out of masks (use sparingly, e.g. once per page). */
  split?: boolean;
  /** Accent (sky) pane instead of brand blue — for dark surfaces. */
  accent?: boolean;
  /** Light heading text for dark backgrounds. */
  light?: boolean;
  className?: string;
}) {
  const Tag = as;
  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <span
        aria-hidden
        className={`mt-2.5 block h-3.5 w-3.5 shrink-0 sm:mt-3.5 ${accent ? "bg-accent" : "bg-brand-700"}`}
      />
      {split ? (
        <SplitHeading
          as={as}
          text={text}
          className={`font-display text-3xl sm:text-4xl ${light ? "text-white" : "text-slate-900"}`}
        />
      ) : (
        <Tag className={`font-display text-3xl sm:text-4xl ${light ? "text-white" : "text-slate-900"}`}>
          {text}
        </Tag>
      )}
    </div>
  );
}

/** Full-bleed hero with an image or video background, oversized title, subtitle,
 *  and either a divided spec strip or a custom actions slot (e.g. the homepage
 *  CTAs). Falls back to solid navy + sightlines when no media is set. */
export function EditorialHero({
  breadcrumbLabel,
  breadcrumbHref,
  kicker,
  title,
  titleAccentLast = false,
  subtitle,
  image,
  mediaType = "image",
  specs = [],
  actions,
}: {
  breadcrumbLabel?: string;
  breadcrumbHref?: string;
  /** Top eyebrow shown when there is no breadcrumb (e.g. homepage tagline). */
  kicker?: string;
  title: string;
  titleAccentLast?: boolean;
  subtitle: string;
  image: EditorialImage;
  mediaType?: "image" | "video";
  specs?: SpecItem[];
  /** Rendered in place of the spec strip (e.g. homepage CTA buttons). */
  actions?: React.ReactNode;
}) {
  return (
    <header className="relative flex min-h-[50vh] flex-col justify-end overflow-hidden border-b border-line bg-brand-950 text-white sm:min-h-[90vh]">
      <HeroBackdrop mediaType={mediaType} path={image.path} alt={image.alt} />

      <EditorialContainer
        className={`relative pt-24 sm:pt-32 ${actions ? "pb-14 sm:pb-20" : "pb-0"}`}
      >
        {breadcrumbLabel && breadcrumbHref ? (
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
        ) : kicker ? (
          <Reveal y={12}>
            <p className="kicker text-brand-100">{kicker}</p>
          </Reveal>
        ) : null}

        <SplitHeading
          as="h1"
          text={title}
          accentLast={titleAccentLast}
          onScroll={false}
          delay={0.12}
          className="mt-5 max-w-4xl font-display text-[2.5rem] leading-[1.02] text-white sm:mt-6 sm:text-7xl sm:leading-[0.95]"
        />

        {subtitle && (
          <Reveal delay={0.4} y={18}>
            <p className="mt-5 max-w-xl font-serif text-lg text-accent italic sm:mt-6 sm:text-2xl">
              {subtitle}
            </p>
          </Reveal>
        )}

        {actions ? (
          <Reveal delay={0.5} y={16} className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10">
            {actions}
          </Reveal>
        ) : specs.length === 0 ? (
          // Reserve the spec strip's height so the title/subtitle sit at the
          // same position whether or not a hero has a spec strip.
          <div aria-hidden className="mt-8 h-[3.75rem] sm:mt-14 sm:h-[4.25rem]" />
        ) : null}

        {specs.length > 0 && (
          <Reveal delay={0.55} y={16}>
            <ul
              className={`mt-8 grid grid-cols-2 border-t border-white/15 sm:mt-14 sm:gap-0 ${
                specs.length === 4
                  ? "sm:grid-cols-4"
                  : specs.length === 2
                    ? "sm:grid-cols-2"
                    : "sm:grid-cols-3"
              }`}
            >
              {specs.map((spec, i) => (
                <li
                  key={spec.label}
                  className={`py-4 sm:py-6 ${
                    i !== 0 ? "sm:border-l sm:border-white/15 sm:pl-6" : ""
                  } ${i % 2 === 1 ? "border-l border-white/15 pl-4" : ""} ${
                    i >= 2 ? "border-t border-white/15 sm:border-t-0" : ""
                  }`}
                >
                  {spec.value ? (
                    <>
                      <span className="block font-display text-3xl text-white sm:text-4xl">
                        {spec.value}
                      </span>
                      <span className="mt-1 block text-xs tracking-wide text-white/70 uppercase">
                        {spec.label}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span aria-hidden className="block h-2.5 w-2.5 shrink-0 bg-accent" />
                      <span className="text-sm font-semibold tracking-wide text-white/90 uppercase">
                        {spec.label}
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Reveal>
        )}
      </EditorialContainer>
    </header>
  );
}

/** Photo framed like a window: mullion cross + top sightline tick rule + index. */
export function FramedPhoto({
  image,
  index,
  aspect = "landscape",
  aspectClassName,
}: {
  image: EditorialImage;
  index?: number;
  aspect?: "landscape" | "portrait";
  /** Responsive aspect override, e.g. "aspect-[4/3] sm:aspect-[3/4]". */
  aspectClassName?: string;
}) {
  return (
    <WindowFrame index={index} aspect={aspect} aspectClassName={aspectClassName}>
      <Image
        src={storageUrl("media", image.path)}
        alt={image.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
    </WindowFrame>
  );
}

/** Tall image card on a dark surface — uppercase label, optional description. */
export function FeatureCard({
  title,
  body,
  image,
}: {
  title: string;
  body?: string;
  image: EditorialImage;
}) {
  return (
    <article className="group relative aspect-[4/3] overflow-hidden border border-white/10 sm:aspect-[3/4]">
      <Image
        src={storageUrl("media", image.path)}
        alt={image.alt}
        fill
        sizes="(max-width: 640px) 100vw, 33vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/35 to-transparent"
      />
      <span
        aria-hidden
        className="absolute top-4 left-4 h-6 w-6 border-t border-l border-white/50"
      />
      <div className="absolute right-5 bottom-5 left-5">
        <span
          aria-hidden
          className="mb-3 block h-px w-10 bg-accent transition-all duration-500 group-hover:w-16"
        />
        <h3 className="font-display text-xl tracking-wide text-white uppercase">{title}</h3>
        {body && <p className="mt-2 text-sm leading-relaxed text-white/75">{body}</p>}
      </div>
    </article>
  );
}
