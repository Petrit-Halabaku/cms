import Link from "next/link";
import { ImageOff } from "lucide-react";

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
      className="group overflow-hidden rounded-lg border border-slate-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-slate-100">
        {product.featuredImage ? (
          <MediaImage
            media={product.featuredImage}
            locale={locale}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <ImageOff className="h-10 w-10 text-slate-300" aria-hidden />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 group-hover:text-brand-700">
          {product.title}
        </h3>
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
