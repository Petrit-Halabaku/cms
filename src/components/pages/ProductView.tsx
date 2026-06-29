import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileDown, ImageOff } from "lucide-react";

import { JsonLd } from "@/components/JsonLd";
import { MediaImage } from "@/components/MediaImage";
import { WindowFrame } from "@/components/pages/WindowFrame";
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

      {/* Hero */}
      <article className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid gap-6 sm:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <Reveal y={20}>
            <WindowFrame aspect="landscape">
              {featured ? (
                <MediaImage
                  media={featured}
                  locale={locale}
                  className="h-full w-full object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <span className="grid h-full w-full place-items-center">
                  <ImageOff className="h-14 w-14 text-brand-200" aria-hidden />
                </span>
              )}
            </WindowFrame>
          </Reveal>

          <div>
            <p className="kicker">{category.name}</p>
            <SplitHeading
              as="h1"
              text={product.title}
              onScroll={false}
              delay={0.1}
              className="mt-4 font-display text-3xl leading-[0.98] text-slate-900 sm:text-5xl"
            />
            {product.brand && (
              <p className="mt-3 text-sm font-semibold tracking-[0.18em] text-slate-400 uppercase">
                {product.brand}
              </p>
            )}
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
      </article>

      {/* Technical data — navy precision band */}
      {product.facts.length > 0 && (
        <section className="bg-brand-950 py-10 text-white sm:py-20" aria-label={dict.product.specs}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal y={12} className="flex items-center gap-3">
              <span aria-hidden className="block h-2.5 w-2.5 shrink-0 bg-accent" />
              <h2 className="font-display text-2xl text-white sm:text-3xl">{dict.product.specs}</h2>
            </Reveal>
            <div aria-hidden className="mt-6 flex items-end gap-1.5">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="block w-px bg-white/25"
                  style={{ height: i % 4 === 0 ? "0.7rem" : "0.4rem" }}
                />
              ))}
            </div>
            <dl className="mt-6 columns-1 gap-x-12 sm:mt-8 sm:columns-2 lg:columns-3">
              {product.facts.map((fact) => (
                <div
                  key={fact.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5 break-inside-avoid border-b border-white/15 py-3.5"
                >
                  <dt className="text-sm text-white/60">{fact.label}</dt>
                  <dd className="font-display text-sm tracking-wide text-white tabular-nums">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Gallery + related */}
      <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        {galleryMedia.length > 1 && (
          <div className="pt-10 sm:pt-16">
            <ProductGallery images={galleryMedia} locale={locale} heading={dict.product.gallery} />
          </div>
        )}

        {related.length > 0 && (
          <section
            className="mt-10 border-t border-line pt-8 sm:mt-16 sm:pt-12"
            aria-label={dict.product.related}
          >
            <h2 className="flex items-center gap-3 font-display text-2xl text-slate-900 sm:text-3xl">
              <span aria-hidden className="block h-2.5 w-2.5 bg-brand-700" />
              {dict.product.related}
            </h2>
            <Reveal stagger={0.08} className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  href={`${categoryHref}/${p.slug}`}
                  locale={locale}
                  index={i}
                />
              ))}
            </Reveal>
          </section>
        )}
      </div>
    </>
  );
}
