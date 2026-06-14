import Link from "next/link";
import { ArrowUpRight, ImageOff } from "lucide-react";

import { MediaImage } from "@/components/MediaImage";
import type { Locale } from "@/lib/database.types";
import type { ProductListItem } from "@/lib/db/content";

type Props = {
  product: ProductListItem;
  href: string;
  locale: Locale;
};

export function ProductCard({ product, href, locale }: Props) {
  return (
    <Link
      href={href}
      className="group block border border-line bg-white transition-colors duration-300 hover:border-brand-600"
    >
      <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden bg-brand-50">
        {product.featuredImage ? (
          <MediaImage
            media={product.featuredImage}
            locale={locale}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <ImageOff className="h-10 w-10 text-brand-200" aria-hidden />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line p-5">
        <h3 className="font-display text-base text-slate-900 transition-colors group-hover:text-brand-700">
          {product.title}
        </h3>
        <span className="grid h-8 w-8 shrink-0 place-items-center border border-line text-slate-400 transition-all duration-300 group-hover:border-brand-700 group-hover:bg-brand-700 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function ProductGrid({
  products,
  hrefFor,
  locale,
}: {
  products: ProductListItem[];
  hrefFor: (product: ProductListItem) => string;
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} href={hrefFor(product)} locale={locale} />
      ))}
    </div>
  );
}
