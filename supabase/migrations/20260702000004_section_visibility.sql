-- Per-section publishing columns:
--   active   — whether the section renders on the live site (visibility switch)
--   is_draft — originally a manual draft flag; the UI later replaced it with an
--              automatic "unsaved changes" cue, so this column is no longer read.
--              Kept here to match what was applied; harmless and unused.
-- Existing sections stay visible and non-draft.
alter table public.page_sections
  add column if not exists active boolean not null default true,
  add column if not exists is_draft boolean not null default false;
