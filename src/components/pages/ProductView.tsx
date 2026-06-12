import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown, ImageOff } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { MediaImage } from "@/components/MediaImage";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import type { Locale } from "@/lib/database.types";
import {
  getCategoryBySlug,
  getProductBySlug,
  getProductsByCategory,
} from "@/lib/db/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { basePathFor } from "@/lib/i18n/urls";
import { ROUTE_SLUGS, storageUrl } from "@/lib/site";

export async function ProductView({
  locale,
  categorySlug,
  productSlug,
}: {
  locale: Locale;
  categorySlug: string;
  productSlug: string;
}) {
  const [category, product] = await Promise.all([
    getCategoryBySlug(locale, categorySlug),
    getProductBySlug(locale, productSlug),
  ]);
  // 404 unless the product exists AND belongs to the category in the URL.
  if (!category || !product || product.categoryId !== category.id) notFound();

  const dict = getDictionary(locale);
  const basePath = basePathFor(locale);
  const related = (await getProductsByCategory(locale, category.id))
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const featured =
    product.images.find((i) => i.is_featured)?.media ?? product.images[0]?.media ?? null;
  const galleryMedia = product.images
    .map((image) => image.media)
    .filter((media): media is NonNullable<typeof media> => media !== null);
  const categoryHref = `${basePath}/${ROUTE_SLUGS[locale].products}/${category.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          description: product.seoDescription ?? product.body?.slice(0, 200) ?? undefined,
          category: category.name,
          ...(featured && {
            image: storageUrl("media", featured.storage_path),
          }),
          brand: { "@type": "Organization", name: "Gergoci" },
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href={categoryHref}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {dict.product.backToCategory} {category.name}
        </Link>
      </div>

      <article className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {featured ? (
              <MediaImage
                media={featured}
                locale={locale}
                className="h-full w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <ImageOff className="h-14 w-14 text-slate-300" aria-hidden />
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {product.title}
            </h1>
            {product.body && (
              <div className="mt-6 space-y-4 text-slate-600">
                {product.body.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            {product.facts.length > 0 && (
              <section className="mt-8" aria-label={dict.product.specs}>
                <h2 className="text-lg font-semibold text-slate-900">{dict.product.specs}</h2>
                <table className="mt-4 w-full text-sm">
                  <tbody>
                    {product.facts.map((fact) => (
                      <tr key={fact.id} className="border-b border-slate-100">
                        <td className="py-2 pr-4 font-medium text-slate-900">{fact.label}</td>
                        <td className="py-2 text-slate-600">{fact.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}

            {product.brochureUrl && (
              <a
                href={
                  product.brochureUrl.startsWith("http")
                    ? product.brochureUrl
                    : storageUrl("brochures", product.brochureUrl)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-md border border-brand-700 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
              >
                <FileDown className="h-4 w-4" aria-hidden />
                {dict.product.downloadBrochure}
              </a>
            )}
          </div>
        </div>

        {galleryMedia.length > 1 && (
          <div className="mt-16">
            <ProductGallery images={galleryMedia} locale={locale} heading={dict.product.gallery} />
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-16" aria-label={dict.product.related}>
            <h2 className="text-2xl font-bold text-slate-900">{dict.product.related}</h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  href={`${categoryHref}/${p.slug}`}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
