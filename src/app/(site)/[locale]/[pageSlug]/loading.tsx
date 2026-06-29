import { HeroSkeleton, ProductGridSkeleton, Skeleton } from "@/components/Skeleton";

/** Inner page skeleton (about / services / products / contact) — hero + content. */
export default function Loading() {
  return (
    <div role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      <HeroSkeleton tall />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-3">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-4 lg:col-span-2 lg:col-start-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-9/12" />
          </div>
        </div>
        <div className="mt-16">
          <ProductGridSkeleton count={6} />
        </div>
      </section>
    </div>
  );
}
