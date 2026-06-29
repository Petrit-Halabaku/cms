import { HeroSkeleton, ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

/** Category skeleton — hero + brand filter chips + product grid. */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      <HeroSkeleton tall />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-10 flex flex-wrap gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <ProductGridSkeleton count={6} />
      </section>
    </div>
  );
}
