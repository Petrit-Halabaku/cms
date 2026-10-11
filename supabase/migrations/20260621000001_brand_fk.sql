-- Phase 1 (catalog migration) — link each product to its manufacturer brand.
-- Brands live in public.partners; this nullable FK lets a product reference one,
-- enabling brand display and client-side brand filtering on the catalog.
-- Append-only and idempotent (safe to re-run / re-apply).

alter table public.projects
  add column if not exists brand_partner_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'projects_brand_partner_id_fkey'
  ) then
    alter table public.projects
      add constraint projects_brand_partner_id_fkey
      foreign key (brand_partner_id) references public.partners(id) on delete set null;
  end if;
end $$;

create index if not exists projects_brand_partner_id_idx
  on public.projects (brand_partner_id);
