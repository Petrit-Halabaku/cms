import { ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

/** Home skeleton — hero (text + window panel) + features + featured products. */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>

      {/* Hero */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-12 lg:items-center lg:py-28 lg:px-8">
          <div className="space-y-6 lg:col-span-7">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-14 w-full max-w-2xl sm:h-20" />
            <Skeleton className="h-14 w-2/3 max-w-xl sm:h-20" />
            <Skeleton className="h-4 w-3/4 max-w-md" />
            <div className="flex flex-wrap gap-4 pt-4">
              <Skeleton className="h-12 w-44 rounded-full" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="mx-auto aspect-3/4 w-full max-w-sm animate-pulse bg-brand-50 lg:max-w-none" aria-hidden />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-9 w-64" />
          <div className="mt-12 grid grid-cols-1 border-t border-l border-line sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3 border-r border-b border-line bg-paper p-8">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="border-y border-line bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-9 w-64" />
          <div className="mt-12">
            <ProductGridSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}
