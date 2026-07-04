# "What we offer" card background images — design

Date: 2026-07-04 · Status: approved ("go")

## Goal

Each card in the "What we offer" (grid) and homepage features (cards) sections can
carry a subject-matched background photo (aluminium card → aluminium windows, glass
card → glass, …), uploaded per card from the admin section editor.

## Data

`titleBody` item schema (`src/lib/sections.ts`) gains optional `image_path` — a
storage path in the `media` bucket. No migration: items live in `page_sections.content`
jsonb. No `image_alt`: the photo is decorative (the card's title/body carry the
meaning), so it renders with `alt=""`.

## Admin (`src/components/admin/SectionEditor.tsx`)

`ItemListEditor` gains a `type: "image"` field: thumbnail preview when set, an
upload button (webp → `media` bucket, `cards/` folder, via the existing
`uploadFile`), and a remove button. The cards/grid editors add
`{ key: "image_path", label: "Background image", type: "image" }`. Any change
marks the section dirty exactly like text edits (flows through `onChange`).

## Site (`src/components/sections/SectionRenderer.tsx` — `Cards`)

When `item.image_path` is set:

- `next/image` fill renders the photo full-bleed behind the card content, under a
  navy scrim (`brand-950` gradient, same family as the heroes) for legibility.
- Title turns white, body `white/75`, mullion-cross hover lines `white/40`;
  the brand square and accent underline stay.
- Hover adds a slow zoom on the photo (`scale-105`, 700ms), replacing the flat
  card's background-tint hover.

Cards without an image render exactly as today (flat `bg-paper`, unchanged), so the
section keeps working while photos are uploaded one by one.

## Out of scope

Media-library picking, per-image alt text, category-derived images.
