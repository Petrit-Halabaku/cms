# Product pages redesign — design

- **Date:** 2026-06-28
- **Status:** Approved direction (Approach A), pending spec review
- **Scope:** All three product views — landing (`/products`), category archive (`/products/[category]`), detail (`/products/[category]/[product]`)
- **Goal:** Make the product browsing flow distinctive and cohesive with the editorial system already used on About/Services — it currently reads as a generic card-grid catalogue.

## 1. Concept and signature

**"Seen through the frame."** GERGOCI's product *is* the frame — windows, doors, glazing — so every product is presented as if viewed through one of its own frames. Three devices, all drawn from the existing editorial system, unify the three pages:

1. **Window-framed imagery** — the `FramedPhoto` treatment (thin mullion cross + the measurement "sightline" tick rule) becomes the standard product-image treatment everywhere (cards, detail hero, gallery thumbs).
2. **Catalogue index** — a two-digit `NN` marker per product. A product range genuinely *is* an ordered catalogue, so numbering encodes real information rather than decoration (passes the frontend-design "is it actually a sequence?" test).
3. **Technical-data readout** — the detail spec sheet becomes a precision panel on a navy (`brand-950`) band with the sightline tick rule and tabular figures, echoing the About stats band so the two pages read as one family.

The palette, type, and motion are the established tokens: navy/sky (`brand-950` / `accent #8dd7f7`), `font-display` (expanded Archivo), `kicker`, `PaneHeading`, `SplitHeading`, `Reveal`. The redesign restyles and restructures presentation only — **no new colors or fonts**, **no DB/schema/content changes**, **no new i18n keys** (existing `product.*` labels are reused).

## 2. Component architecture

### New / changed shared components

- **`WindowFrame` (new, `src/components/pages/WindowFrame.tsx`)** — presentational wrapper that renders the editorial "window" overlay (border, centered mullion cross, top sightline tick rule, optional `index` number) around arbitrary children. Pure markup, no data. This extracts the signature currently inlined in `FramedPhoto` so both editorial pages and product images share one implementation.
  - Props: `{ children; index?: number; aspect?: "landscape" | "portrait" | "square"; className?: string }`.
- **`FramedPhoto` (refactor, `editorial.tsx`)** — recomposed to render its `next/image` inside `WindowFrame`. **Public API and rendered appearance must stay identical** (About/Services depend on it); this is a non-visual refactor verified by eye on `/en/about`.
- **`ProductCard` (redesign, `src/components/ProductCard.tsx`)** — the catalogue atom, used by landing, category, and related. Image wrapped in `WindowFrame` with the catalogue index; below it the category `kicker`, the product title in `font-display`, an optional brand line, and the arrow affordance. Hover: image scale (existing easing) + an `accent` underline that grows under the title. `ProductGrid` (same file) keeps its signature but passes a running index for the `NN` marker.

### Per-page components

- **`ProductsView`** (landing) — keep `EditorialHero`; keep CMS `SectionRenderer` output; restyle the catalogue. `ProductCatalog` keeps its filter logic but is restyled (see §3.1).
- **`CategoryView`** — swap `PageHero` → `EditorialHero` for consistency with landing/About; keep `ProductFilter` logic, restyle its chips and grid.
- **`ProductView`** (detail) — restructured layout (see §3.3). Continues to use `ProductGallery` (lightbox) and `JsonLd` unchanged in behavior; gallery thumbnails reframed as windows.

### Untouched
`ProductGallery` lightbox behavior, `MediaImage`, `SplitHeading`, `Reveal`, all data functions in `lib/db/content.ts`, routing, and JSON-LD payloads.

## 3. Page designs

### 3.1 Landing `/products`

```
[ EditorialHero — "Products", tagline, photo ]   (unchanged)
CMS sections… (SectionRenderer, unchanged)

■ Browse the range                       (PaneHeading + total count)
[ filters: Categories ▸ / Brands ▸ ]     (existing ProductCatalog facets, restyled)
  01 ▢   02 ▢   03 ▢
  04 ▢   05 ▢   06 ▢                      (redesigned ProductCard grid)
```

`ProductCatalog` keeps multi-select category+brand filtering and the desktop sidebar / mobile panel structure. Restyle only: the `Filters` heading and groups adopt `kicker`/`PaneHeading` styling and the brand pane square; the results grid uses the redesigned `ProductCard` with running catalogue indices. Count label and empty state reuse the component's existing bilingual strings.

### 3.2 Category `/products/[category]`

```
[ EditorialHero — category name, description as subtitle,
  specs strip = product count + brand count ]
Filter:  All · Schüco · …                (ProductFilter chips, editorial restyle)
  01 ▢   02 ▢   03 ▢
  04 ▢   05 ▢                            (redesigned ProductCard grid)
```

Replace `PageHero` with `EditorialHero` so every product surface shares one header system. The category hero image (existing `CATEGORY_HERO_KEY` → storage path) feeds `EditorialHero`'s `image`; the category description becomes the subtitle; the spec strip shows derived counts (e.g. `NN products`, `NN brands`) using `EditorialHero`'s existing `specs` slot. `ProductFilter` keeps brand-chip logic; chips restyled to the editorial chip treatment; results use the redesigned grid. Empty state reuses `dict.product.noProducts`.

### 3.3 Detail `/products/[category]/[product]` — centerpiece

```
‹ back to {Category}                       (existing back link, restyled)

┌─ sightline ticks ─────────────┬─────────────────────┐
│                               │  NN · {CATEGORY}     │  kicker + index
│   [ featured photo,           │  {Product Title}     │  SplitHeading h1
│     framed as a window ]      │  {brand · partner}   │  optional brand line
│        + mullion cross        │  {body paragraphs}   │
│                               │  [ Download brochure]│  existing CTA, restyled
└───────────────────────────────┴─────────────────────┘

■ TECHNICAL DATA                           navy band (brand-950)
  ┌ sightline tick rule ──────────────────────────────┐
  {label} ······ {value}      {label} ······ {value}
  {label} ······ {value}      {label} ······ {value}   tabular figures

■ GALLERY                                  window-framed thumbs → existing lightbox

More from {Category}                       redesigned ProductCard row (related)
  01 ▢   02 ▢   03 ▢
```

- **Hero:** featured image in `WindowFrame` (landscape) with the brand-pane offset retained or simplified; right column gets the `NN · CATEGORY` kicker, `SplitHeading` title, optional `brand` line, body paragraphs, and the brochure CTA. Layout stays a 2-column grid on `lg`, stacks on mobile (image first).
- **Technical data (the signature beat):** the spec list (`product.facts`) moves onto a full-bleed `brand-950` band. Heading uses `PaneHeading` (light, accent pane). Facts render as a tabular `label ···· value` readout (white-on-navy, `white/15` hairlines, sightline tick rule above), flowing 1→2→3 columns. Reuses `dict.product.specs` as the heading. Rendered only when `product.facts.length > 0`.
- **Gallery:** unchanged `ProductGallery` lightbox; thumbnails get the window frame so they match the cards. Rendered only when `galleryMedia.length > 1` (existing condition).
- **Related:** redesigned `ProductCard` row under a `PaneHeading` ("More from {category}" / reuse `dict.product.related`). Existing `related` slice (max 3) unchanged.

## 4. Data flow

No changes. Each view keeps its current server-side fetches (`getAllProducts`, `getProductsByCategory`, `getCategoryBySlug`, `getProductBySlug`, `getPage`) and prop shapes (`ProductListItem`, `ProductCatalogItem`, media rows). The redesign is presentational. Pages remain statically generated with on-demand revalidation; client components (`ProductCatalog`, `ProductFilter`, `ProductGallery`) keep their `"use client"` boundaries.

## 5. Motion, accessibility, responsive

- **Motion:** reuse `Reveal` (fade-rise, scroll-triggered, reduced-motion aware) and `SplitHeading`. Card hover transitions reuse the existing cubic-bezier easing. No new motion primitives. The Technical-data band may use a `Reveal` stagger on the fact rows.
- **Reduced motion:** inherited from the existing primitives, which no-op under `prefers-reduced-motion`.
- **Accessibility:** mullion/tick overlays and index markers are `aria-hidden` decoration. Cards remain a single `Link` with an accessible name (title). Filters keep their existing `fieldset`/`legend`/checkbox and `aria-pressed` chip semantics. `WindowFrame` adds no interactive elements. Color contrast: white text only on navy/brand surfaces, dark text on light (per the palette rules in `globals.css`).
- **Responsive:** grids 1→2→3 columns (`sm`/`lg`/`xl` as today); detail hero stacks image-first on mobile; technical-data columns collapse to one on mobile; tap targets ≥ 40px.

## 6. Out of scope / non-goals

- No database, schema, content, or CMS-admin changes.
- No new colors, fonts, or i18n keys.
- No change to `ProductGallery` lightbox behavior, routing, or JSON-LD data.
- No changes to non-product pages, except the **internal** `FramedPhoto` refactor (must be visually identical).

## 7. Verification

1. **Visual parity (regression):** `/en/about` and `/en/services` render identically after the `FramedPhoto` → `WindowFrame` refactor (the framed photos and gallery look unchanged).
2. **Landing:** `/en/products` renders hero + CMS sections + restyled catalogue; category/brand filters still narrow results; counts and empty state correct.
3. **Category:** `/en/products/<category>` renders `EditorialHero` + brand chips + redesigned grid; brand filtering works; empty category shows `noProducts`.
4. **Detail:** `/en/products/<category>/<product>` renders framed hero, navy technical-data band (when facts exist), window-framed gallery + working lightbox, related row; JSON-LD (Product + Breadcrumb) still emitted; `notFound` still triggers on category/product mismatch.
5. **Build hygiene:** dev compiles with no new image/console errors (count-delta method); SQ locale routes render.
6. **A11y/responsive smoke:** keyboard focus visible on cards/filters/lightbox; layouts hold at mobile width.

## 8. Risks and decisions

- **`FramedPhoto` refactor risk** — mitigated by keeping its public API and asserting visual parity on About/Services as the first verification step. If parity is hard, fall back to leaving `FramedPhoto` as-is and letting `WindowFrame` be product-only (mild duplication).
- **`PageHero` → `EditorialHero` on category** — `EditorialHero` expects an `EditorialImage { path, alt }`; category heroes are currently full storage URLs via `CATEGORY_HERO_KEY`. Adapter: pass the storage path (not the full URL) so `EditorialHero` builds the URL through `storageUrl`. `PageHero` stays in the codebase for any other users.
- **Index numbering across filtered views** — indices are display-order positional (running 01..NN over the rendered list), recomputed after client-side filtering so they stay contiguous. They are decorative wayfinding, not stable product IDs.
- **Technical-data band with few facts** — with only 1–2 facts the navy band could feel empty; acceptable, and it is hidden entirely when there are zero facts.
```
