import Image from "next/image";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { storageUrl } from "@/lib/site";
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

/** Full-bleed photo hero with breadcrumb, oversized title, subtitle and a
 *  divided spec strip. The hero image background is always retained. */
export function EditorialHero({
  breadcrumbLabel,
  breadcrumbHref,
  title,
  subtitle,
  image,
  specs,
}: {
  breadcrumbLabel: string;
  breadcrumbHref: string;
  title: string;
  subtitle: string;
  image: EditorialImage;
  specs: SpecItem[];
}) {
  return (
    <header className="relative flex min-h-[90vh] flex-col justify-end overflow-hidden border-b border-line bg-brand-950 text-white">
      <Image
        src={storageUrl("media", image.path)}
        alt={image.alt}
        fill
        priority
        loading="eager"
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-950/35"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/4 h-full w-px bg-white/8" />
        <span className="absolute top-0 left-2/4 h-full w-px bg-white/8" />
        <span className="absolute top-0 left-3/4 h-full w-px bg-white/8" />
      </div>

      <EditorialContainer className="relative pt-28 pb-0 sm:pt-32">
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

        {subtitle && (
          <Reveal delay={0.4} y={18}>
            <p className="mt-6 max-w-xl font-serif text-xl text-accent italic sm:text-2xl">
              {subtitle}
            </p>
          </Reveal>
        )}

        {specs.length === 0 && (
          // Reserve the spec strip's height so the title/subtitle sit at the
          // same position whether or not a hero has a spec strip.
          <div aria-hidden className="mt-10 h-[3.75rem] sm:mt-14 sm:h-[4.25rem]" />
        )}

        {specs.length > 0 && (
          <Reveal delay={0.55} y={16}>
            <ul
              className={`mt-10 grid grid-cols-2 border-t border-white/15 sm:mt-14 ${
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
                  className={`py-5 sm:py-6 ${
                    i !== 0 ? "sm:border-l sm:border-white/15 sm:pl-6" : ""
                  } ${i % 2 === 1 ? "border-l border-white/15 pl-4 sm:pl-6" : ""}`}
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
}: {
  image: EditorialImage;
  index?: number;
  aspect?: "landscape" | "portrait";
}) {
  return (
    <WindowFrame index={index} aspect={aspect}>
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
    <article className="group relative aspect-[3/4] overflow-hidden border border-white/10">
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
