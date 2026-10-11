# Product Pages Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the three product views (landing, category, detail) into one cohesive "editorial catalogue" system matching the About/Services visual language.

**Architecture:** Extract the editorial "window" image treatment into a shared `WindowFrame`, rebuild `ProductCard` on top of it, then restyle/restructure the three page views. Presentational only — no data, schema, routing, or i18n changes.

**Tech Stack:** Next.js 16 (App Router, RSC), React 19, Tailwind v4, GSAP (existing motion primitives), Supabase (existing data layer).

## Global Constraints

- **Do NOT commit or push.** (User directive: "no commit no push".) Each task ends with a verification checkpoint, not a commit.
- **No new colors or fonts.** Use existing tokens only: `brand-50/100/700/950`, `accent`, `line`, `paper`; `font-display`, `kicker`, `font-serif`.
- **No DB/schema/content/CMS-admin changes. No routing or JSON-LD payload changes. No new i18n keys** — reuse existing `dict.product.*` (`specs`, `gallery`, `downloadBrochure`, `related`, `backToCategory`, `noProducts`). Inline bilingual literals (e.g. Products/Produkte) are allowed where a label has no dict key.
- **`FramedPhoto` must stay visually identical** after refactor — About/Services depend on it.
- **Verification = compile + inspect rendered HTML.** There is no test runner. The dev server runs at `http://localhost:3000`. `/en/...` routes 301-redirect, so always use `curl -sL`. Real slugs for checks: category `doors`, product `doors/feal-termo-85-vs-and-vp`.

---

### Task 1: Extract `WindowFrame`, refactor `FramedPhoto`

**Files:**
- Create: `src/components/pages/WindowFrame.tsx`
- Modify: `src/components/pages/editorial.tsx` (the `FramedPhoto` function, currently lines ~189–233, and its imports)

**Interfaces:**
- Produces: `WindowFrame({ children: React.ReactNode; index?: number; aspect?: "landscape" | "portrait" | "square"; className?: string })` — a relative container with `group`, border, `bg-brand-50`, the mullion cross, and the top sightline tick rule (+ optional `index` marker). The consumer supplies the image element as `children` (typically a `fill` image).

- [ ] **Step 1: Create `WindowFrame`**

Create `src/components/pages/WindowFrame.tsx`:

```tsx
type Aspect = "landscape" | "portrait" | "square";

const RATIO: Record<Aspect, string> = {
  landscape: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

/**
 * The editorial "window" image treatment: a framed container with a centered
 * mullion cross and a top measurement "sightline" tick rule (plus an optional
 * catalogue index). The image element is supplied as children — usually a
 * `fill` next/image or MediaImage — so both storage-path and media-row images
 * can share one signature. Keeps `group` so a child can use `group-hover:`.
 */
export function WindowFrame({
  children,
  index,
  aspect = "landscape",
  className = "",
}: {
  children: React.ReactNode;
  index?: number;
  aspect?: Aspect;
  className?: string;
}) {
  return (
    <div
      className={`group relative ${RATIO[aspect]} overflow-hidden border border-line bg-brand-50 ${className}`}
    >
      {children}

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-white/40 mix-blend-overlay" />
        <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/40 mix-blend-overlay" />
      </div>

      <div className="pointer-events-none absolute top-0 left-0 flex w-full items-center justify-between bg-gradient-to-b from-brand-950/55 to-transparent px-4 pt-3 pb-8">
        <div aria-hidden className="flex items-end gap-1.5">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className="block w-px bg-white/70"
              style={{ height: i % 3 === 0 ? "0.85rem" : "0.5rem" }}
            />
          ))}
        </div>
        {index !== undefined && (
          <span aria-hidden className="font-serif text-2xl text-white/80 italic">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Refactor `FramedPhoto` to compose `WindowFrame`**

In `src/components/pages/editorial.tsx`, add the import near the top (with the other relative imports):

```tsx
import { WindowFrame } from "./WindowFrame";
```

Replace the entire `FramedPhoto` function with:

```tsx
/** Photo framed like a window: mullion cross + top sightline tick rule + index. */
export function FramedPhoto({
  image,
  index,
  aspect = "landscape",
}: {
  image: EditorialImage;
  index?: number;
  aspect?: "landscape" | "portrait";
}) {
  return (
    <WindowFrame index={index} aspect={aspect}>
      <Image
        src={storageUrl("media", image.path)}
        alt={image.alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
      />
    </WindowFrame>
  );
}
```

- [ ] **Step 3: Verify it compiles and About is visually unchanged (parity check)**

Run:

```bash
curl -sL "http://localhost:3000/en/about" -o /dev/null -w "about %{http_code}\n"
curl -sL "http://localhost:3000/en/about" | grep -c "mix-blend-overlay"
```

Expected: `about 200`, and the mullion count is non-zero (the experience section + gallery still render framed photos). Then open `/en/about` and `/en/services` in a browser and confirm the framed photos and the About gallery look identical to before.

- [ ] **Step 4: Confirm no new compile errors**

Run:

```bash
tail -30 .next/dev/logs/next-development.log | grep -iE "error|module not found|⨯" | grep -vi "already running" || echo "clean"
```

Expected: `clean` (transient mid-edit reload errors may appear once; re-run after a fresh request to confirm they don't recur).

---

### Task 2: Redesign `ProductCard` and `ProductGrid`

**Files:**
- Modify: `src/components/ProductCard.tsx` (both `ProductCard` and `ProductGrid`)

**Interfaces:**
- Consumes: `WindowFrame` (Task 1), `MediaImage`, `ProductListItem` (has `title`, `slug`, `brand?: string | null`, `featuredImage`).
- Produces: `ProductCard({ product: ProductListItem; href: string; locale: Locale; index?: number; priority?: boolean })` and `ProductGrid({ products; hrefFor; locale })` (now passes a running `index`).

- [ ] **Step 1: Rewrite `ProductCard.tsx`**

Replace the whole file with:

```tsx
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
```

Note: the named group `group/card` is used so the whole card drives the image scale, underline grow, and arrow fill; `WindowFrame`'s own unnamed `group` is left for `FramedPhoto`'s standalone hover.

- [ ] **Step 2: Verify a grid renders with framed, numbered cards**

Run:

```bash
curl -sL "http://localhost:3000/en/products/doors" | grep -oE 'group/card|font-serif text-2xl text-white/80 italic' | sort | uniq -c
```

Expected: multiple `group/card` occurrences (one per card) and several italic index markers. Page returns content (cards present).

---

### Task 3: Restyle the products landing (`ProductCatalog`)

**Files:**
- Modify: `src/components/ProductCatalog.tsx` (results grid + the `Filters` heading)

**Interfaces:**
- Consumes: redesigned `ProductCard` (Task 2). Keeps all existing filter logic, props, and bilingual strings.

- [ ] **Step 1: Pass `index` to the catalogue cards and widen vertical gap**

In `src/components/ProductCatalog.tsx`, replace this block:

```tsx
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, index) => (
              <ProductCard
                key={p.id}
                product={p}
                locale={locale}
                href={`${hrefBase}/${p.categorySlug}/${p.slug}`}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
```

with:

```tsx
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, index) => (
              <ProductCard
                key={p.id}
                product={p}
                locale={locale}
                href={`${hrefBase}/${p.categorySlug}/${p.slug}`}
                index={index}
                priority={index === 0}
              />
            ))}
          </div>
        ) : (
```

- [ ] **Step 2: Add the brand pane square to the Filters heading**

In the same file, replace:

```tsx
      <div className="flex items-center justify-between pb-4">
        <p className="font-display text-lg text-slate-900">{L.filters}</p>
```

with:

```tsx
      <div className="flex items-center justify-between pb-4">
        <p className="flex items-center gap-2.5 font-display text-lg text-slate-900">
          <span aria-hidden className="block h-2.5 w-2.5 shrink-0 bg-brand-700" />
          {L.filters}
        </p>
```

- [ ] **Step 3: Verify landing renders the new catalogue**

Run:

```bash
curl -sL "http://localhost:3000/en/products" | grep -oE 'group/card' | wc -l
```

Expected: a positive count (one per product card). Open `/en/products`, toggle a category and a brand filter, and confirm results narrow and indices stay contiguous.

---

### Task 4: Category archive — `EditorialHero` + editorial chips

**Files:**
- Modify: `src/components/pages/CategoryView.tsx`
- Modify: `src/components/ProductFilter.tsx` (chip styling only)

**Interfaces:**
- Consumes: `EditorialHero({ breadcrumbLabel, breadcrumbHref, title, subtitle, image: { path, alt }, specs: { value?, label }[] })`, redesigned `ProductGrid`.

- [ ] **Step 1: Swap `PageHero` → `EditorialHero` in `CategoryView`**

Replace the import line:

```tsx
import { PageHero } from "@/components/PageHero";
```

with:

```tsx
import { EditorialHero } from "@/components/pages/editorial";
```

Then replace the `return (...)` body's hero usage. Replace:

```tsx
  const heroKey = CATEGORY_HERO_KEY[category.id];
  const heroImage = heroKey ? storageUrl("media", `hero/categories/${heroKey}.webp`) : undefined;

  return (
    <>
      <PageHero
        kicker={dict.nav.products}
        title={category.name}
        intro={category.description ?? undefined}
        image={heroImage}
        imageAlt={category.name}
      />
```

with:

```tsx
  const heroKey = CATEGORY_HERO_KEY[category.id];
  const heroPath = heroKey ? `hero/categories/${heroKey}.webp` : "products/products.webp";
  const brandCount = new Set(
    products.map((p) => p.brand).filter((b): b is string => Boolean(b)),
  ).size;
  const specs = [
    {
      value: String(products.length),
      label: locale === "sq" ? "Produkte" : "Products",
    },
    ...(brandCount > 0
      ? [{ value: String(brandCount), label: locale === "sq" ? "Marka" : "Brands" }]
      : []),
  ];

  return (
    <>
      <EditorialHero
        breadcrumbLabel={dict.nav.products}
        breadcrumbHref={`${basePath}/${ROUTE_SLUGS[locale].products}`}
        title={category.name}
        subtitle={category.description ?? dict.footer.tagline}
        image={{ path: heroPath, alt: category.name }}
        specs={specs}
      />
```

The `storageUrl` import is now unused in this file — remove it from the import on line 9 (change `import { ROUTE_SLUGS, storageUrl } from "@/lib/site";` to `import { ROUTE_SLUGS } from "@/lib/site";`).

- [ ] **Step 2: Restyle the brand chips in `ProductFilter`**

In `src/components/ProductFilter.tsx`, replace the `chip` function's `className`:

```tsx
      className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
        active === key
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-line text-slate-600 hover:border-brand-700 hover:text-brand-700"
      }`}
```

with:

```tsx
      className={`border px-4 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase transition-colors ${
        active === key
          ? "border-brand-700 bg-brand-700 text-white"
          : "border-line text-slate-600 hover:border-brand-700 hover:text-brand-700"
      }`}
```

- [ ] **Step 3: Verify category renders the editorial hero + chips + grid**

Run:

```bash
curl -sL "http://localhost:3000/en/products/doors" | grep -oE 'Breadcrumb|group/card' | sort | uniq -c
```

Expected: a `Breadcrumb` nav (from `EditorialHero`) and multiple `group/card` cards. Open `/en/products/doors`, confirm the taller editorial hero with the count spec strip, the uppercase brand chips filter correctly, and an empty category still shows `noProducts`.

---

### Task 5: Product detail — framed hero, navy technical-data band, windowed gallery

**Files:**
- Modify: `src/components/pages/ProductView.tsx`
- Modify: `src/components/ProductGallery.tsx` (thumbnail treatment only; lightbox unchanged)

**Interfaces:**
- Consumes: `WindowFrame` (Task 1), redesigned `ProductCard` (Task 2). Keeps `getCategoryBySlug`, `getProductBySlug`, `getProductsByCategory`, `JsonLd`, `ProductGallery`, `MediaImage`, `SplitHeading`, `Reveal` and all existing data/JSON-LD behavior.

- [ ] **Step 1: Window-frame the gallery thumbnails in `ProductGallery`**

In `src/components/ProductGallery.tsx`, add the import (with the other imports):

```tsx
import { WindowFrame } from "@/components/pages/WindowFrame";
```

Replace the thumbnail grid block:

```tsx
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((media, index) => (
          <button
            key={media.id}
            type="button"
            className="group relative aspect-square overflow-hidden border border-line bg-brand-50"
            onClick={() => setOpenIndex(index)}
          >
            <MediaImage
              media={media}
              locale={locale}
              className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          </button>
        ))}
      </div>
```

with:

```tsx
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((media, index) => (
          <button
            key={media.id}
            type="button"
            className="block w-full cursor-zoom-in"
            onClick={() => setOpenIndex(index)}
            aria-label={`Open image ${index + 1} of ${images.length}`}
          >
            <WindowFrame index={index} aspect="square">
              <MediaImage
                media={media}
                locale={locale}
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </WindowFrame>
          </button>
        ))}
      </div>
```

- [ ] **Step 2: Restructure `ProductView` — hero, navy technical-data band, gallery/related**

In `src/components/pages/ProductView.tsx`, update imports: remove `MediaImage`? No — it is still used in the hero. Add `WindowFrame` and `PaneHeading`. Change:

```tsx
import { MediaImage } from "@/components/MediaImage";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
```

to:

```tsx
import { MediaImage } from "@/components/MediaImage";
import { WindowFrame } from "@/components/pages/WindowFrame";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
```

Then replace everything from `<article ...>` through its closing `</article>` (the markup after the two `JsonLd` blocks and the breadcrumb `<div>`) with this. The breadcrumb back-link `<div>` and the two `JsonLd` blocks above it stay unchanged.

```tsx
      {/* Hero */}
      <article className="mx-auto max-w-7xl px-4 pt-6 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
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
        <section className="bg-brand-950 py-14 text-white sm:py-20" aria-label={dict.product.specs}>
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
          <div className="pt-12 sm:pt-16">
            <ProductGallery images={galleryMedia} locale={locale} heading={dict.product.gallery} />
          </div>
        )}

        {related.length > 0 && (
          <section
            className="mt-12 border-t border-line pt-10 sm:mt-16 sm:pt-12"
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
```

Note: the old inline spec `<section>` (the light `columns` dl) and the old brand-pane image offset div are intentionally removed — replaced by the navy band and `WindowFrame`. `ImageOff` and `FileDown` imports remain in use.

- [ ] **Step 3: Verify the detail page renders all sections**

Run:

```bash
html=$(curl -sL "http://localhost:3000/en/products/doors/feal-termo-85-vs-and-vp")
echo "$html" | grep -oE 'bg-brand-950 py-14|aria-label="Specifications"|mix-blend-overlay|"@type":"Product"|"@type":"BreadcrumbList"' | sort | uniq -c
```

Expected: the navy technical-data section present (when the product has facts), the framed hero (`mix-blend-overlay`), and both JSON-LD types still emitted. Open the page and confirm: framed hero image, navy Technical-data band with tick rule and tabular values, window-framed gallery thumbnails that still open the lightbox (click + ←/→), and a related-products row of numbered cards.

- [ ] **Step 4: Verify a product with no facts and the SQ locale**

Run:

```bash
curl -sL "http://localhost:3000/en/products/doors/salamander-bluevolution-82-entrance-door" -o /dev/null -w "detail %{http_code}\n"
curl -sL "http://localhost:3000/sq/produktet/dyer" -o /dev/null -w "sq-category %{http_code}\n"
```

Expected: both render (content returned). Confirm a facts-less product simply omits the navy band, and the SQ category page renders the editorial hero. (If the SQ category slug differs, derive it from a link on `/sq/produktet`.)

- [ ] **Step 5: Final no-regression sweep**

Run:

```bash
b=$(grep -cE "missing required .src.|empty string.*src" .next/dev/logs/next-development.log)
for u in /en/products /en/products/doors /en/products/doors/feal-termo-85-vs-and-vp /en/about; do curl -s -o /dev/null "http://localhost:3000$u"; done
sleep 2
a=$(grep -cE "missing required .src.|empty string.*src" .next/dev/logs/next-development.log)
echo "image errors before/after: $b/$a"
```

Expected: `before == after` (no new image errors across landing, category, detail, and About).

---

## Self-Review

**Spec coverage:**
- §1 signature (window imagery, catalogue index, technical-data band) → Tasks 1, 2, 5. ✓
- §2 `WindowFrame` new + `FramedPhoto` refactor → Task 1. ✓
- §2/§3.1 `ProductCard` redesign + landing → Tasks 2, 3. ✓
- §3.2 category `EditorialHero` + chips → Task 4. ✓
- §3.3 detail hero + navy band + windowed gallery + related → Task 5. ✓
- §4 no data changes → all tasks presentational; verified by reusing existing fetches. ✓
- §5 motion/a11y/responsive → reuse `Reveal`/`SplitHeading`; decorative overlays `aria-hidden`; grids responsive. ✓
- §6 out-of-scope respected (no i18n keys, no JSON-LD/data/routing changes). ✓
- §7 verification → each task's verify steps + Task 5 Step 5 sweep cover items 1–6. ✓
- §8 risks: `FramedPhoto` parity (Task 1 Step 3), `EditorialHero` image adapter via `path` not URL (Task 4 Step 1), index numbering positional (Tasks 2–5), empty technical band hidden (Task 5 Step 2 condition). ✓

**Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**Type consistency:** `WindowFrame` signature identical across Tasks 1/2/5; `ProductCard` `index?` prop introduced in Task 2 and used in Tasks 3/4(via `ProductGrid`)/5; `EditorialHero` `image: { path, alt }` and `specs: { value?, label }[]` match `editorial.tsx`. ✓

**Note on named groups:** `group/card` (ProductCard) vs unnamed `group` (WindowFrame/FramedPhoto/gallery button) are intentionally distinct so hover scopes don't collide.
