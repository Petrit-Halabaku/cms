# Homepage hero — admin-managed media (image → video) + cinematic GSAP

**Date:** 2026-07-02
**Status:** Approved (design). Implemented on branch working tree — NOT committed per user.

## Goal

Make the homepage hero match the other pages' full-bleed dark editorial hero, with
a background **image now / video later** that the admin uploads (saved to a
`homepage/` folder in the `media` bucket). Keep the current hero text/CTAs, but
animate them more cinematically with GSAP.

## Decisions (confirmed)

- Admin manages the media **in the Home → Hero section editor** (path saved in the
  hero's jsonb `content`).
- **Extend the shared `EditorialHero`** (image-or-video bg, optional CTA slot,
  optional breadcrumb) rather than a separate component.
- **Cinematic** animation, guarded by `prefersReducedMotion()`.
- Media **type inferred from file extension** (`.mp4/.webm/.mov` → video, else image).

## Changes

### 1. Schema — `src/lib/sections.ts`
Extend `heroSchema` with `media_path: string` and `media_alt: string` (both default
""). No migration — stored in the existing `page_section_translations.content` jsonb.
`media_path` is shared across locales; `media_alt` may be per-locale.

### 2. Upload guard — `src/lib/admin/upload.ts`
Add opt-in `options.allowVideo` to `uploadFile`. With it, the `media` bucket accepts
`image/webp` **plus** `video/mp4`, `video/webm`, `video/quicktime`; without it, the
existing WebP-only rule is unchanged for all other callers.

### 3. Helper — `src/lib/site.ts`
`isVideoPath(path)` → `/\.(mp4|webm|mov)$/i`. Add `HERO_MEDIA_FOLDER = "homepage"`.

### 4. Shared component — `src/components/pages/editorial.tsx` (`EditorialHero`)
Backward-compatible new optional props (existing 5 callers unchanged):
- `breadcrumbLabel?` / `breadcrumbHref?` now optional.
- `kicker?` — top eyebrow shown when there's no breadcrumb (homepage: the tagline).
- `mediaType?: "image" | "video"` (default `"image"`).
- `actions?: ReactNode` — rendered in place of the spec strip (homepage: the CTAs).
- `titleAccentLast?: boolean` — accent the heading's last word.
- When `image.path` is empty, the hero falls back to the solid `brand-950` +
  sightlines (graceful state before any upload).

Extract the media + overlay + sightlines into a **client** `HeroBackdrop`
(`src/components/pages/HeroBackdrop.tsx`) so it can run GSAP. Renders `<Image>` or an
autoplay/muted/loop/`playsInline` `<video>` by `mediaType`.

### 5. Cinematic GSAP — `HeroBackdrop`
- Media: `from` scale ~1.14 → 1 on load, then a slow continuous drift (sine yoyo).
- Sightlines: `scaleY` 0 → 1, staggered, top origin.
- Text (kicker → word-by-word heading → subtitle → CTAs) via existing `SplitHeading`
  + `Reveal` with a staggered `delay` ladder.
- All motion no-ops under `prefersReducedMotion()`.

### 6. Homepage hero — `src/components/sections/SectionRenderer.tsx` (`Hero()`)
Rewrite to render the extended `EditorialHero`:
`kicker` = tagline, `title` = heading (`titleAccentLast`), `subtitle` = subheading,
`image` = `{ path: media_path, alt: media_alt || heading }`,
`mediaType` = `isVideoPath(media_path) ? "video" : "image"`,
`actions` = Call-now (`tel:`) + Products link, restyled for the dark surface
(white primary pill + white-outline secondary). Drop the old light split layout and
`HeroVisual` from the hero (files left in place, unused).

### 7. Admin upload UI — `src/components/admin/SectionEditor.tsx`
In the `type === "hero"` block, add a `HeroMediaField`:
- Preview of the current `media_path` (`<img>` or `<video>` by type).
- File input (`accept="image/webp,video/mp4,video/webm"`) →
  `uploadFile("media", file, HERO_MEDIA_FOLDER, { allowVideo: true })` → on success
  set `media_path` on **both** locales; a text input edits `media_alt` (current locale).
- Saved with the existing "Save section" button.

## Success criteria

- Admin can upload a WebP or MP4/WebM in the Home hero editor; it lands under
  `media/homepage/…` and appears as the homepage hero background.
- Homepage hero renders full-bleed and dark like the other pages, with the current
  heading/subheading/CTAs, animated cinematically (reduced-motion safe).
- Other pages' heroes are visually unchanged.
- No DB migration; build passes.
