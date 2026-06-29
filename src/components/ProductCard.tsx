import Link from "next/link";
import { ArrowUpRight, ImageOff } from "lucide-react";

import { MediaImage } from "@/components/MediaImage";
import { WindowFrame } from "@/components/pages/WindowFrame";
import type { Locale } from "@/lib/database.types";
import type { ProductListItem } from "@/lib/db/content";

type Props = {
  product: ProductListItem;
  href: string;
  locale: Locale;
  /** Catalogue index (0-based) shown as a two-digit marker on the frame. */
  index?: number;
  priority?: boolean;
};

export function ProductCard({ product, href, locale, index, priority }: Props) {
  return (
    <Link href={href} className="group/card block">
      <WindowFrame index={index} aspect="landscape">
        {product.featuredImage ? (
          <MediaImage
            media={product.featuredImage}
            locale={locale}
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:scale-[1.06]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <span className="grid h-full w-full place-items-center">
            <ImageOff className="h-10 w-10 text-brand-200" aria-hidden />
          </span>
        )}
      </WindowFrame>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          {product.brand && (
            <p className="text-[0.6875rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
              {product.brand}
            </p>
          )}
          <h3 className="mt-1 font-display text-base text-slate-900">
            <span className="bg-gradient-to-r from-brand-700 to-brand-700 bg-[length:0%_2px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/card:bg-[length:100%_2px]">
              {product.title}
            </span>
          </h3>
        </div>
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-line text-slate-400 transition-all duration-300 group-hover/card:border-brand-700 group-hover/card:bg-brand-700 group-hover/card:text-white">
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
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          href={hrefFor(product)}
          locale={locale}
          index={index}
          priority={index === 0}
        />
      ))}
    </div>
  );
}
