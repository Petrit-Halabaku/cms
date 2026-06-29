import { ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

/** Product detail skeleton — back link + image/info split + specs + related. */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>

      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Skeleton className="h-4 w-44" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Featured image (matches ProductView's aspect-4/3 frame) */}
          <div className="aspect-4/3 animate-pulse border border-line bg-brand-50" aria-hidden />

          {/* Title, body, specs */}
          <div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-10 w-3/4" />
            <div className="mt-7 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>
            <div className="mt-10 space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-4 border-b border-line py-3">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        <div className="mt-20 border-t border-line pt-14">
          <Skeleton className="h-8 w-56" />
          <div className="mt-8">
            <ProductGridSkeleton count={3} />
          </div>
        </div>
      </div>
    </div>
  );
}
