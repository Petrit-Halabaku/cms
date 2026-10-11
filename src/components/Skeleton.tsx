/**
 * Skeleton primitives for route `loading.tsx` fallbacks. They mirror the real
 * components' dimensions (hero height, card aspect ratios, grid columns) so the
 * page reserves the right space and the footer doesn't jump when data arrives.
 */

/** A single pulsing placeholder block. Decorative. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-brand-100/70 ${className}`} />;
}

/** Inner-page header placeholder — matches PageHero's rhythm (tall when the page has a photo). */
export function HeroSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <header className={`flex flex-col justify-end border-b border-line bg-paper ${tall ? "min-h-[50vh]" : ""}`}>
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-6 h-12 w-3/4 max-w-xl sm:h-16" />
        <Skeleton className="mt-5 h-4 w-2/3 max-w-md" />
      </div>
    </header>
  );
}

/** Product card placeholder — matches ProductCard (aspect-4/3 image + footer row). */
export function ProductCardSkeleton() {
  return (
    <div className="border border-line bg-white">
      <div className="aspect-4/3 animate-pulse bg-brand-50" aria-hidden />
      <div className="flex items-center justify-between gap-3 border-t border-line p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-8 w-8 shrink-0" />
      </div>
    </div>
  );
}

/** A responsive grid of product-card placeholders (same columns as ProductGrid). */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
