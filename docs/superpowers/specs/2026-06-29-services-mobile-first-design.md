# Services page — mobile-first redesign

**Date:** 2026-06-29
**Status:** Approved (design)

## Goal

Make the Services page deliberately **mobile-first**: design the phone experience
(< 640px) on its own terms instead of shrinking the desktop layout. At Tailwind's
`sm` breakpoint (≥ 640px) and up, the **existing styling is preserved exactly** —
it is the "tablet and larger" treatment.

## Constraints & scope decisions

- **Breakpoint:** the handoff is `sm` (640px). All new work is base (mobile)
  classes that are overridden at `sm:` to restore today's design.
- **Shared components:** the mobile-first treatment lives in the shared editorial
  primitives where the change is universally good, so the About page benefits too.
- **Bounded blast radius:** only `EditorialHero` (shared) and the Services-only
  `ServiceBlock` + feature-card section are changed. `PaneHeading`, `FramedPhoto`,
  `WindowFrame`, and `FeatureCard` internals are **not** touched, so About inherits
  only the hero changes and nothing else regresses.

## Files

- `src/components/pages/editorial.tsx` — `EditorialHero` (shared).
- `src/components/pages/ServicesView.tsx` — `ServiceBlock` + feature-card section
  (Services-only).

## Changes

### 1. Hero recomposition — `EditorialHero` (shared)

| Element | Mobile base (new) | ≥ 640px (unchanged) |
|---|---|---|
| `<header>` height | `min-h-[80vh]` | `sm:min-h-[90vh]` |
| top padding | `pt-24` | `sm:pt-32` |
| title scale | `text-[2.5rem] leading-[1.02]` | `sm:text-7xl sm:leading-[0.95]` |
| subtitle | `text-lg` | `sm:text-2xl` |
| spec strip | horizontal snap-scroll row | `sm:grid sm:grid-cols-{2,3,4}` |

**Spec strip (signature move):** below `sm`, the category list becomes a horizontal
snap-scroll row under the existing top sightline rule. Each item is a
`min-w-[9rem] shrink-0 snap-start` chip separated by `gap-5`; the mobile-only 2-col
border logic (`i % 2 === 1` left border) is removed. At `sm` it reverts to the
existing grid, keeping the `sm:border-l` separators for `i !== 0`.

Tradeoff (accepted): with four categories the last chip may sit partly off-screen —
treated as an intentional "scroll for more" affordance.

About's hero passes `specs={[]}`, so the reserved-height placeholder branch is the
only spec-strip code it hits; its margin is nudged to match (`mt-8 sm:mt-14`) but
layout is otherwise unaffected.

### 2. Tighter service-block rhythm — `ServiceBlock` (Services-only)

- Section padding: `py-14` → `py-10` (`sm:py-20` kept).
- Image ↔ text gap: `gap-10` → `gap-6` (`lg:gap-16` kept).
- Subheading: `text-lg` → `text-base` (`sm:text-lg`).
- Body paragraph margin: `mt-4` → `mt-3` (`sm:mt-4`).
- Checklist: `mt-7` → `mt-6` (`sm:mt-7`); rows `gap-4 py-3.5` → `gap-3 py-3`
  (`sm:gap-4 sm:py-3.5`).

Image-first ordering and the `lg:grid-cols-2` two-column layout are unchanged.

### 3. Feature cards → mobile carousel — `ServicesView` (Services-only)

The three stacked full-width `aspect-[3/4]` portrait cards become a horizontal snap
carousel below `sm`:

- Container (the `Reveal` wrapper) class:
  `mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4`
  → reverts at `sm` to `sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0`.
- Each `FeatureCard` is wrapped in a `div` carrying
  `w-[80%] shrink-0 snap-start sm:w-auto` so one card plus a peek of the next is
  visible on a phone; in the `sm` grid the cell controls width.
- `-mx-4 px-4` lets the row bleed to the screen edges while keeping the first card
  aligned with the heading above; cancelled at `sm`.

`FeatureCard` internals are untouched; the wrapper `div` becomes the `Reveal`
stagger target, preserving the entrance animation.

## Success criteria

- Below 640px: hero fits more comfortably on first screen, categories scroll
  horizontally as a sightline rule, service blocks read tighter, feature cards are
  a swipeable carousel.
- At/above 640px: Services renders pixel-identical to today.
- About page: identical except for the shared hero's mobile (< 640px) scale/height
  tweaks; ≥ 640px unchanged.
- No changes to `PaneHeading`, `FramedPhoto`, `WindowFrame`, `FeatureCard` internals.
