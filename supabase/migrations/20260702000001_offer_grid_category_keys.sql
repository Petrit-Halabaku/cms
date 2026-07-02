-- Deep-link the homepage "What we offer" (offer-grid) cards to product categories.
-- Each item gets a stable, locale-independent `key` that the frontend resolves to
-- the localized category slug (see CATEGORY_KEY_BY_ID in src/lib/site.ts).
--
-- Runs after the seed, so both fresh resets and the live DB converge. Idempotent:
-- jsonb_set overwrites with the same keys, and paths for missing items are no-ops.
--
-- Item order (identical in EN and SQ):
--   0  PVC windows & doors      -> windows
--   1  Aluminium systems        -> aluminium
--   2  Glass solutions          -> glass
--   3  Blinds & roller shutters -> blinds
update public.page_section_translations
set content = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(content, '{items,0,key}', '"windows"', true),
      '{items,1,key}', '"aluminium"', true
    ),
    '{items,2,key}', '"glass"', true
  ),
  '{items,3,key}', '"blinds"', true
)
where section_id = 'd0000000-0000-4000-8000-000000000104';
