import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown, ImageOff } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { MediaImage } from "@/components/MediaImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
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
import { ROUTE_SLUGS, SITE_URL, storageUrl } from "@/lib/site";

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
    .filter((media): media is NonNullable<typeof media> => media !== null)
    .filter((media) => media.id !== featured?.id);
  const categoryHref = `${basePath}/${ROUTE_SLUGS[locale].products}/${category.slug}`;
  const productUrl = `${SITE_URL}${categoryHref}/${product.slug}`;
  const schemaImages = galleryMedia.length
    ? galleryMedia.map((m) => storageUrl("media", m.storage_path))
    : featured
      ? [storageUrl("media", featured.storage_path)]
      : undefined;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          "@id": `${productUrl}#product`,
          name: product.title,
          description: product.seoDescription ?? product.body?.slice(0, 200) ?? undefined,
          category: category.name,
          url: productUrl,
          ...(schemaImages && { image: schemaImages }),
          ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: dict.nav.home, item: `${SITE_URL}${basePath}/` },
            { "@type": "ListItem", position: 2, name: dict.nav.products, item: `${SITE_URL}${basePath}/${ROUTE_SLUGS[locale].products}` },
            { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}${categoryHref}` },
            { "@type": "ListItem", position: 4, name: product.title, item: productUrl },
          ],
        }}
      />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <Link
          href={categoryHref}
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
            aria-hidden
          />
          {dict.product.backToCategory} {category.name}
        </Link>
      </div>

      <article className="mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative">
            <div
              aria-hidden
              className="absolute -top-4 -left-4 h-full w-full border border-brand-200 bg-brand-50"
            />
            <div className="relative flex aspect-4/3 items-center justify-center overflow-hidden border border-line bg-brand-50">
              {featured ? (
                <MediaImage
                  media={featured}
                  locale={locale}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <ImageOff className="h-14 w-14 text-brand-200" aria-hidden />
              )}
            </div>
          </div>

          <div>
            <p className="kicker">{category.name}</p>
            <SplitHeading
              as="h1"
              text={product.title}
              onScroll={false}
              delay={0.1}
              className="mt-4 font-display text-3xl leading-[0.98] text-slate-900 sm:text-5xl"
            />
            {product.body && (
              <Reveal delay={0.3} y={18} className="mt-7 space-y-4">
                {product.body.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="leading-relaxed text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </Reveal>
            )}

            {product.brochureUrl && (
              <Reveal delay={0.5} y={14}>
                <a
                  href={
                    product.brochureUrl.startsWith("http")
                      ? product.brochureUrl
                      : storageUrl("brochures", product.brochureUrl)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-brand-700 px-6 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-700 hover:text-white"
                >
                  <FileDown className="h-4 w-4" aria-hidden />
                  {dict.product.downloadBrochure}
                </a>
              </Reveal>
            )}
          </div>
        </div>

        {product.facts.length > 0 && (
          <Reveal y={18}>
            <section
              className="mt-12 border-t border-line pt-10 sm:mt-16 sm:pt-12"
              aria-label={dict.product.specs}
            >
              <h2 className="flex items-center gap-3 font-display text-2xl text-slate-900 sm:text-3xl">
                <span aria-hidden className="block h-2.5 w-2.5 bg-brand-700" />
                {dict.product.specs}
              </h2>
              {/* Mobile-first spec sheet: a clean, scannable label → value row per
                  fact. One readable column on phones; flows into 2–3 columns from
                  sm up (CSS columns) so long lists stay tight. Long values wrap to
                  their own line under the label instead of crowding. */}
              <dl className="mt-6 columns-1 gap-x-10 sm:mt-8 sm:columns-2 lg:columns-3">
                {product.facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 break-inside-avoid border-b border-line py-3.5"
                  >
                    <dt className="text-sm text-slate-500">{fact.label}</dt>
                    <dd className="text-sm font-semibold text-slate-900">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </Reveal>
        )}

        {galleryMedia.length > 1 && (
          <div className="mt-12 border-t border-line pt-10 sm:mt-16 sm:pt-12">
            <ProductGallery images={galleryMedia} locale={locale} heading={dict.product.gallery} />
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-12 border-t border-line pt-10 sm:mt-16 sm:pt-12" aria-label={dict.product.related}>
            <h2 className="flex items-center gap-3 font-display text-2xl text-slate-900 sm:text-3xl">
              <span aria-hidden className="block h-2.5 w-2.5 bg-brand-700" />
              {dict.product.related}
            </h2>
            <Reveal stagger={0.08} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  href={`${categoryHref}/${p.slug}`}
                  locale={locale}
                />
              ))}
            </Reveal>
          </section>
        )}
      </article>
    </>
  );
}
