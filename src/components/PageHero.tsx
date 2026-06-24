import Image from "next/image";

import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

type Props = {
  /** Small uppercase label above the title, e.g. the nav section name. */
  kicker?: string;
  title: string;
  intro?: string;
  /** Optional full-bleed background photo behind the header. */
  image?: string;
  /** Alt text for the background photo (decorative if omitted). */
  imageAlt?: string;
};

/** Shared inner-page header: kicker, oversized split title, mullion lines. */
export function PageHero({ kicker, title, intro, image, imageAlt = "" }: Props) {
  const hasImage = Boolean(image);

  return (
    <header
      className={`relative flex flex-col justify-end overflow-hidden border-b border-line ${hasImage ? "min-h-[60vh] bg-brand-950" : "bg-paper"
        }`}
    >
      {hasImage ? (
        <>
          <Image
            src={image!}
            alt={imageAlt}
            fill
            priority
            loading="eager"
            sizes="100vw"
            // Center the photo so the GERGOCI logo on the building stays in frame.
            className="object-cover object-top"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/45 to-brand-950/30"
          />
        </>
      ) : (
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute top-0 left-1/4 h-full w-px bg-line/70" />
          <span className="absolute top-0 left-2/4 h-full w-px bg-line/70" />
          <span className="absolute top-0 left-3/4 h-full w-px bg-line/70" />
            <div className="absolute -top-40 -left-40 h-112 w-md rounded-full bg-[radial-gradient(closest-side,rgba(141,215,247,0.45),transparent)]" />
          </div>
      )}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {kicker && (
          <Reveal y={12}>
            <p className={`kicker ${hasImage ? "text-brand-100" : ""}`}>{kicker}</p>
          </Reveal>
        )}
        <SplitHeading
          as="h1"
          text={title}
          onScroll={false}
          delay={0.1}
          className={`mt-5 max-w-4xl font-display text-4xl leading-[0.95] sm:text-6xl ${hasImage ? "text-white text-center" : "text-slate-900"
            }`}
        />
        {intro && (
          <Reveal delay={0.4} y={18}>
            <p
              className={`mt-6 max-w-2xl text-lg leading-relaxed ${hasImage ? "text-brand-50/90" : "text-slate-600"
                }`}
            >
              {intro}
            </p>
          </Reveal>
        )}
      </div>
    </header>
  );
}
