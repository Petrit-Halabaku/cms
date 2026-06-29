/**
 * Infinite horizontal marquee — pure CSS animation (see --animate-marquee),
 * paused on hover and disabled entirely under prefers-reduced-motion, where
 * the duplicate strip is hidden and the first wraps instead.
 */
export function Marquee({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const strip =
    "flex min-w-full shrink-0 items-center justify-around gap-x-16 pr-16 animate-marquee group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none";

  return (
    <div className={`group/marquee flex overflow-hidden ${className}`}>
      <div className={`${strip} motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-8`}>
        {children}
      </div>
      <div aria-hidden className={`${strip} motion-reduce:hidden`}>
        {children}
      </div>
    </div>
  );
}
