# Services Page Mobile-First Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Services page a deliberate mobile-first layout (< 640px) while preserving today's design pixel-for-pixel at `sm` (≥ 640px) and up.

**Architecture:** Pure responsive-className edits in two files. New styles are base (mobile) Tailwind classes; every change is overridden at `sm:` to restore the existing "tablet and larger" design. No component internals beyond `EditorialHero` and `ServicesView` are touched.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS v4, GSAP (`Reveal`).

## Global Constraints

- **Breakpoint:** mobile-first work is base classes; the handoff to existing design is Tailwind `sm` (640px). Never introduce a new breakpoint value.
- **At ≥ 640px the rendered output must be identical to before** — every base-class change must carry a matching `sm:` override that restores the current value.
- **Do not modify** `PaneHeading`, `FramedPhoto`, `WindowFrame`, or `FeatureCard` internals.
- **No automated tests exist for CSS.** Verification per task = `npm run build` succeeds **and** a visual check at < 640px and ≥ 640px via `npm run dev`.
- Spec: `docs/superpowers/specs/2026-06-29-services-mobile-first-design.md`.

---

### Task 1: Hero recomposition — `EditorialHero` (shared)

**Files:**
- Modify: `src/components/pages/editorial.tsx` (the `EditorialHero` function, ~lines 74–191)

**Interfaces:**
- Consumes: nothing new.
- Produces: no API change — `EditorialHero`'s props are unchanged. Consumed unchanged by `ServicesView.tsx` and `AboutView.tsx`.

- [ ] **Step 1: Reduce header height and top padding**

In the `<header>` element, change `min-h-[90vh]` to `min-h-[80vh] sm:min-h-[90vh]`:

```tsx
<header className="relative flex min-h-[80vh] flex-col justify-end overflow-hidden border-b border-line bg-brand-950 text-white sm:min-h-[90vh]">
```

In the `<EditorialContainer>` for the hero body, change `pt-28 pb-0 sm:pt-32` to `pt-24 pb-0 sm:pt-32`:

```tsx
<EditorialContainer className="relative pt-24 pb-0 sm:pt-32">
```

- [ ] **Step 2: Tighten the title and subtitle scale for mobile**

Change the `SplitHeading` (title) className from
`mt-6 max-w-4xl font-display text-5xl leading-[0.95] text-white sm:text-7xl` to:

```tsx
className="mt-5 max-w-4xl font-display text-[2.5rem] leading-[1.02] text-white sm:mt-6 sm:text-7xl sm:leading-[0.95]"
```

Change the subtitle `<p>` className from
`mt-6 max-w-xl font-serif text-xl text-accent italic sm:text-2xl` to:

```tsx
className="mt-5 max-w-xl font-serif text-lg text-accent italic sm:mt-6 sm:text-2xl"
```

- [ ] **Step 3: Match the empty-specs placeholder margin**

In the `specs.length === 0` branch, change `mt-10 h-[3.75rem] sm:mt-14 sm:h-[4.25rem]` to `mt-8 h-[3.75rem] sm:mt-14 sm:h-[4.25rem]` so About's hero (which passes `specs={[]}`) keeps consistent spacing:

```tsx
<div aria-hidden className="mt-8 h-[3.75rem] sm:mt-14 sm:h-[4.25rem]" />
```

- [ ] **Step 4: Convert the spec strip to a mobile snap-scroll row**

Replace the spec `<ul>` className. The current value is:

```tsx
className={`mt-10 grid grid-cols-2 border-t border-white/15 sm:mt-14 ${
  specs.length === 4 ? "sm:grid-cols-4" : specs.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
}`}
```

Change to (base = horizontal scroll row, `sm:` restores the grid):

```tsx
className={`mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto border-t border-white/15 pb-1 sm:mt-14 sm:grid sm:gap-0 sm:overflow-visible sm:pb-0 ${
  specs.length === 4 ? "sm:grid-cols-4" : specs.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"
}`}
```

- [ ] **Step 5: Update the spec `<li>` classes for the scroll row**

The current `<li>` className is:

```tsx
className={`py-5 sm:py-6 ${
  i !== 0 ? "sm:border-l sm:border-white/15 sm:pl-6" : ""
} ${i % 2 === 1 ? "border-l border-white/15 pl-4 sm:pl-6" : ""}`}
```

Replace with (drop the mobile 2-col border logic; add mobile min-width + snap; keep the `sm:` grid separators):

```tsx
className={`min-w-[9rem] shrink-0 snap-start py-5 sm:min-w-0 sm:shrink sm:py-6 ${
  i !== 0 ? "sm:border-l sm:border-white/15 sm:pl-6" : ""
}`}
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 7: Visual verification**

Run: `npm run dev`, open `/en/services`.
- At < 640px (DevTools device ~390px): hero ≈ 80vh tall, title noticeably smaller than desktop, four category chips scroll horizontally under the tick rule.
- Resize to ≥ 640px: hero is identical to before (90vh, `text-7xl`, 4-col grid spec strip with left borders).
- Open `/en/about`: hero shows the smaller mobile title/height < 640px; ≥ 640px unchanged; no spec strip present.

- [ ] **Step 8: Commit**

```bash
git add src/components/pages/editorial.tsx
git commit -m "feat: mobile-first EditorialHero (scroll spec strip, tighter title)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Tighter service-block rhythm — `ServiceBlock` (Services-only)

**Files:**
- Modify: `src/components/pages/ServicesView.tsx` (the `ServiceBlock` function, ~lines 53–101)

**Interfaces:**
- Consumes: `EditorialHero` from Task 1 (no API change — independent).
- Produces: no API change.

- [ ] **Step 1: Tighten section padding and grid gap**

Change the `<section>` className `border-b border-line py-14 sm:py-20` to:

```tsx
className="border-b border-line py-10 sm:py-20"
```

Change the `<EditorialContainer>` className `grid items-center gap-10 lg:grid-cols-2 lg:gap-16` to:

```tsx
className="grid items-center gap-6 lg:grid-cols-2 lg:gap-16"
```

- [ ] **Step 2: Tighten subheading and body text for mobile**

Change the subheading `<p>` className from
`mt-5 max-w-xl text-lg leading-relaxed font-medium text-slate-800` to:

```tsx
className="mt-4 max-w-xl text-base leading-relaxed font-medium text-slate-800 sm:mt-5 sm:text-lg"
```

Change the body `<p>` className from `mt-4 max-w-xl leading-relaxed text-slate-600` to:

```tsx
className="mt-3 max-w-xl leading-relaxed text-slate-600 sm:mt-4"
```

- [ ] **Step 3: Tighten the checklist rhythm**

Change the `<ul>` className `mt-7 space-y-px border-t border-line` to:

```tsx
className="mt-6 space-y-px border-t border-line sm:mt-7"
```

Change the `<li>` className from
`group flex items-start gap-4 border-b border-line py-3.5 transition-colors hover:bg-brand-50/50` to:

```tsx
className="group flex items-start gap-3 border-b border-line py-3 transition-colors hover:bg-brand-50/50 sm:gap-4 sm:py-3.5"
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 5: Visual verification**

`npm run dev`, `/en/services`:
- At < 640px: service blocks sit closer together, subheading is `text-base`, checklist rows are tighter; image still appears above its text.
- At ≥ 640px: spacing/type identical to before.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/ServicesView.tsx
git commit -m "feat: tighten Services block rhythm on mobile

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Feature cards → mobile carousel — `ServicesView` (Services-only)

**Files:**
- Modify: `src/components/pages/ServicesView.tsx` (the feature-cards `<section>` in `ServicesView`, ~lines 37–48)

**Interfaces:**
- Consumes: `FeatureCard` (unchanged), `Reveal` (`stagger` animates direct children).
- Produces: no API change.

- [ ] **Step 1: Make the Reveal wrapper a mobile carousel**

Change the feature-cards `Reveal` className from
`mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5` to (base = edge-bleed snap scroll; `sm:` restores the grid):

```tsx
className="mt-8 -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 sm:mx-0 sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-5 sm:overflow-visible sm:px-0"
```

- [ ] **Step 2: Wrap each card so it sizes and snaps on mobile**

Change the map body from rendering `<FeatureCard>` directly to wrapping it in a sizing `div` (this `div` becomes the `Reveal` stagger target). Current:

```tsx
{featureCards.cards.map((card) => (
  <FeatureCard key={card.title} title={card.title} image={card.image} />
))}
```

Replace with:

```tsx
{featureCards.cards.map((card) => (
  <div key={card.title} className="w-[80%] shrink-0 snap-start sm:w-auto">
    <FeatureCard title={card.title} image={card.image} />
  </div>
))}
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build completes with no errors.

- [ ] **Step 4: Visual verification**

`npm run dev`, `/en/services`, scroll to "Customer Service is Our #1 Priority":
- At < 640px: cards are a horizontal swipe carousel — one card ~80% wide with a peek of the next; the row bleeds to the screen edges, first card aligned with the heading; stagger entrance animation still plays.
- At ≥ 640px: identical 3-column grid as before.

- [ ] **Step 5: Commit**

```bash
git add src/components/pages/ServicesView.tsx
git commit -m "feat: feature-card mobile carousel on Services

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review

**Spec coverage:**
- Hero height/padding/title/subtitle/spec-strip → Task 1 ✓
- About empty-specs placeholder consistency → Task 1, Step 3 ✓
- Service-block padding/gap/subheading/body/checklist → Task 2 ✓
- Feature-card carousel + edge bleed + wrapper-as-stagger-target → Task 3 ✓
- "Do not touch PaneHeading/FramedPhoto/WindowFrame/FeatureCard internals" → no task modifies them ✓
- "≥640px identical" → every base change carries a `sm:` restore ✓

**Placeholder scan:** none — every step shows the exact final className string.

**Type consistency:** no type/signature changes; props of `EditorialHero` and `FeatureCard` are unchanged across all tasks.
