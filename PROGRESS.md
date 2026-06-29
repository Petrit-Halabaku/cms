# Goal
Rebuild **gergoci.eu** — a bilingual (EN/SQ) marketing site + admin CMS for GERGOCI, a
doors/windows company in Pejë, Kosovo. Catalog lives in Supabase; GERGOCI brand; GSAP hero;
SEO-ready. Lead capture is **click-to-call** (the Get-a-Quote and Contact forms were removed at
the owner's request). Outcome: a fast, on-brand site that drives qualified local calls.

## Current state
- **Phases 0–5 complete:** catalog (23 products, EN + flagged-SQ, specs in `project_facts`, brands,
  4 brochures), homepage **GSAP window-open hero** (swappable video slot), **GERGOCI brand restyle**
  (`@theme` palette + logos + favicon), page/FAQ copy filled, **SEO JSON-LD** (Organization,
  LocalBusiness, Product+brand, BreadcrumbList), **products page = filterable catalog** (category +
  brand sidebar), client-side brand filter on category pages.
- **Lead forms removed** — contact is info-only (phone/address/map); all CTAs are click-to-call.
- **Just added:** per-page hero-image wiring (About/Contact/Category via `PageHero`, webp) + an
  about-gallery ingest script + fixed a fill-script conflict.
- **DB target:** hosted Supabase (`crokyxdyosszmwnfcfyu`). **No git commits** made (owner's to do).
- **Awaiting owner assets/data:** product images (22 of 23 on placeholder), per-page hero webps,
  real About-us copy, real contact details + counter numbers, About-gallery photos.

## Files in flight (this turn)
- `src/components/pages/SimplePageView.tsx` — About hero image (`/hero/about/hero.webp`)
- `src/components/pages/ContactView.tsx` — Contact hero image (`/hero/contact/hero.webp`)
- `src/components/pages/CategoryView.tsx` — per-category hero (`/hero/categories/<key>/hero.webp`) + `CATEGORY_HERO_KEY` map
- `scripts/lib/site-content.mjs` — section …109 reconciled to the Call-now CTA (idempotency fix)
- `scripts/ingest-about-gallery.mjs` — **NEW** about-gallery → `media` bucket + section …203 `media_ids`
- `~/.claude-personal/plans/synthetic-shimmying-hummingbird.md` — the runbook plan

## Changed (this session, broad)
- **Catalog:** `import-catalog` / `ingest-media` / `ingest-brochures` / `verify-import` + libs
  (`slugify`, `image-dimensions`, `spec-labels`, `catalog`) + `brand_fk` migration.
- **Hero:** `HeroVisual` rebuild + `HERO_MEDIA` config; logos in `public/brand/`; favicon `src/app/icon.svg`.
- **Brand restyle:** `globals.css` `@theme` (GERGOCI palette + 5 tokens), Header/Footer logos, rgba
  glow rebrands, mist/accent in `SectionRenderer`.
- **SEO:** layout Organization + LocalBusiness; `ProductView` Product + Breadcrumb; `content.ts`
  brand wiring; `database.types.ts` `brand_partner_id`.
- **Products filter:** `ProductCatalog` + `ProductFilter`; `getAllProducts`.
- **Removal:** Get-a-Quote + both forms + admin submissions; Call-now CTAs; sitemap/redirects/dictionary
  cleanup; DB `get-quote` page deleted; home CTA → Call-now.
- **Content fill:** `fill-content` + `site-content` (page copy, FAQs, SEO descriptions).
- **Memory:** `gergoci-env-state`, `gergoci-execution-workflow`.

## Failed attempts / blockers
- ~~`:3000` was briefly serving a different project ("DCLense")~~ **Resolved** — Gergoci is back on
  `:3000`; the hero wiring is verified live in EN + SQ (About, Contact, Windows category → correct
  webp `<img>` src + navy fallback until files are dropped). Source is `tsc`-clean.
- **`supabase db push` blocked** by the production-deploy gate — the owner runs migrations.
- **`.env.example` edit blocked** by the `.env.*` deny rule — owner applies the provided content.
  (EmailJS is no longer needed since forms were removed.)
- **Stale dev/route cache**: `/get-quote` appeared 200 and `.next/types` referenced deleted routes —
  clears on a real restart/rebuild (DB + source confirmed clean).
- **Reading `.env.local` blocked** (deny rule) — scripts read it themselves at owner runtime.

## Next step
**Owner drops product images** into `media-import/<slug>/NN.webp` (per `image-manifest.json`) →
run `node scripts/ingest-media.mjs --apply` → re-run the placeholder report (expect 0 on placeholder).
In parallel: hand over About-us copy + contact details, and drop the hero/gallery webp files.
