-- Many-to-many product ↔ category. A product keeps its single primary category
-- (projects.category_id, which still drives the canonical /products/<cat>/<slug>
-- URL and breadcrumb); this table records the full set of categories a product
-- belongs to, so it can appear under several (e.g. Windows AND Aluminium).
create table if not exists public.product_categories (
  product_id uuid not null references public.projects(id) on delete cascade,
  category_id uuid not null references public.project_categories(id) on delete cascade,
  primary key (product_id, category_id)
);

-- Backfill: seed each product's membership with its current primary category.
insert into public.product_categories (product_id, category_id)
select id, category_id from public.projects
on conflict do nothing;

-- RLS — mirror the projects/media policies: public read, editors write.
alter table public.product_categories enable row level security;

create policy "product_categories public read" on public.product_categories
  for select using (true);
create policy "product_categories editor insert" on public.product_categories
  for insert to authenticated with check (public.is_editor());
create policy "product_categories editor update" on public.product_categories
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "product_categories editor delete" on public.product_categories
  for delete to authenticated using (public.is_editor());
