type Aspect = "landscape" | "portrait" | "square";

const RATIO: Record<Aspect, string> = {
  landscape: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

/**
 * The editorial "window" image treatment: a framed container with a centered
 * mullion cross and a top measurement "sightline" tick rule (plus an optional
 * catalogue index). The image element is supplied as children — usually a
 * `fill` next/image or MediaImage — so both storage-path and media-row images
 * can share one signature. Keeps `group` so a child can use `group-hover:`.
 */
export function WindowFrame({
  children,
  index,
  aspect = "landscape",
  aspectClassName,
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  aspect?: Aspect;
  /** Override the aspect ratio with explicit (optionally responsive) classes,
   *  e.g. "aspect-[4/3] sm:aspect-[3/4]". Takes precedence over `aspect`. */
  aspectClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative ${aspectClassName ?? RATIO[aspect]} overflow-hidden border border-line bg-brand-50 ${className}`}
    >
      {children}

      {/* Mullion cross — temporarily disabled.
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-white/40 mix-blend-overlay" />
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/40 mix-blend-overlay" />
      </div>
      */}

      <div className="pointer-events-none absolute top-0 left-0 flex w-full items-center justify-between bg-gradient-to-b from-brand-950/55 to-transparent px-4 pt-3 pb-8">
        <div aria-hidden className="flex items-end gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="block w-px bg-white/70"
              style={{ height: i % 3 === 0 ? "0.85rem" : "0.5rem" }}
            />
          ))}
        </div>
        {index !== undefined && (
          <span aria-hidden className="font-serif text-2xl text-white/80 italic">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
}
