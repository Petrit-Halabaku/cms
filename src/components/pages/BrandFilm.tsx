import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { WindowFrame } from "@/components/pages/WindowFrame";

export type BrandFilmLink = { id: string; title: string; slug: string };

/**
 * Two-column brand film: the portrait clip in a fixed-height frame on one side,
 * platform content (brand, category blurb, links into the range) on the other.
 * Height-pinned rather than width-pinned so a 9:16 source stays a supporting
 * note beside the catalogue instead of becoming the page's subject.
 */
export function BrandFilm({
  src,
  aspectClassName = "aspect-[480/848]",
  label,
  brandName,
  body,
  links,
  linksLabel,
  hrefBase,
}: {
  src: string;
  /** Intrinsic ratio of the source file — reserves the box before metadata loads. */
  aspectClassName?: string;
  label: string;
  brandName: string;
  body?: string | null;
  links: BrandFilmLink[];
  linksLabel: string;
  hrefBase: string;
}) {
  return (
    <figure className="mb-10 flex flex-col gap-6 border-b border-line pb-10 sm:mb-14 sm:flex-row sm:items-center sm:gap-10 sm:pb-12">
      <WindowFrame
        aspectClassName={aspectClassName}
        className="h-64 w-auto shrink-0 self-start sm:h-80 sm:self-center lg:h-[26rem]"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          controls={false}
          preload="metadata"
          aria-label={`${brandName} — ${label}`}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={src} type="video/mp4" />
        </video>
      </WindowFrame>

      <figcaption className="min-w-0 flex-1">
        <p className="kicker">{label}</p>
        <p className="mt-3 font-display text-2xl text-slate-900 sm:text-3xl">{brandName}</p>
        {body && (
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-slate-600">{body}</p>
        )}
        {links.length > 0 && (
          <>
            <p className="mt-6 text-[0.6875rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              {linksLabel}
            </p>
            <ul className="mt-2 border-t border-line">
              {links.map((link) => (
                <li key={link.id}>
                  <Link
                    href={`${hrefBase}/${link.slug}`}
                    className="group flex items-center justify-between gap-4 border-b border-line py-2.5 text-sm text-slate-700 transition-colors hover:text-brand-700"
                  >
                    {link.title}
                    <ArrowUpRight
                      aria-hidden
                      className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-700"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </figcaption>
    </figure>
  );
}
