-- Ensure the "Aluminium" product category exists with EN/SQ translations, matching
-- the other categories. Idempotent: if the category is already present (it ships in
-- the seed), both inserts are no-ops. Once present it surfaces automatically in the
-- nav and category pages via getCategories(); it appears as a products *filter* once
-- products are assigned to it. Its homepage "What we offer" card ("Aluminium systems")
-- already deep-links here via the offer-grid key migration.
insert into public.project_categories (id, sort_order)
values ('a0000000-0000-4000-8000-000000000004', 4)
on conflict (id) do nothing;

insert into public.project_category_translations
  (category_id, locale, name, slug, description, seo_title, seo_description)
values
  ('a0000000-0000-4000-8000-000000000004', 'en', 'Aluminium', 'aluminium', null, 'Aluminium | Gergoci', null),
  ('a0000000-0000-4000-8000-000000000004', 'sq', 'Alumin', 'alumin', null, 'Alumin | Gergoci', null)
on conflict do nothing;
