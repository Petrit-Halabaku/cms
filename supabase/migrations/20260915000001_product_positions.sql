-- Product order is a global, one-based position. Preserve the existing sequence.
lock table public.projects in share row exclusive mode;
with positions as (
  select id, row_number() over (order by sort_order, id)::integer as position
  from public.projects
)
update public.projects p set sort_order = positions.position
from positions where p.id = positions.id and p.sort_order <> positions.position;

-- The SQL may also be rerun manually after the migration has been applied.
do $$
begin
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.projects'::regclass and conname = 'projects_position_positive'
  ) then
    alter table public.projects
      add constraint projects_position_positive check (sort_order >= 1);
  end if;
  if not exists (
    select 1 from pg_catalog.pg_constraint
    where conrelid = 'public.projects'::regclass and conname = 'projects_position_unique'
  ) then
    alter table public.projects
      add constraint projects_position_unique unique (sort_order) deferrable initially deferred;
  end if;
end;
$$;

-- Serialize edits before any row locks are acquired, including inserts/deletes.
create or replace function public.lock_product_positions()
returns trigger language plpgsql set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(71520260915001::bigint);
  return null;
end;
$$;

create or replace trigger projects_position_lock
before insert or update or delete on public.projects
for each statement execute function public.lock_product_positions();

create or replace function public.maintain_product_positions()
returns trigger language plpgsql set search_path = '' as $$
declare
  product_count integer;
begin
  -- Updates made below shift neighbours; they must not initiate another move.
  if pg_catalog.pg_trigger_depth() > 1 then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.projects set sort_order = sort_order - 1
    where sort_order > old.sort_order;
    return old;
  end if;

  if tg_op = 'UPDATE' and new.sort_order = old.sort_order then return new; end if;

  select count(*) into product_count from public.projects;
  if tg_op = 'INSERT' then
    product_count := product_count + 1;
    -- Existing importers omit sort_order (default 0): append those products.
    if new.sort_order = 0 then new.sort_order := product_count; end if;
  end if;
  if new.sort_order is null or new.sort_order < 1 or new.sort_order > product_count then
    raise exception 'Position must be between 1 and %.', product_count using errcode = '22023';
  end if;

  if tg_op = 'INSERT' then
    update public.projects set sort_order = sort_order + 1 where sort_order >= new.sort_order;
  elsif new.sort_order < old.sort_order then
    update public.projects set sort_order = sort_order + 1
    where sort_order >= new.sort_order and sort_order < old.sort_order;
  else
    update public.projects set sort_order = sort_order - 1
    where sort_order > old.sort_order and sort_order <= new.sort_order;
  end if;
  return new;
end;
$$;

create or replace trigger projects_position_shift
before insert or update of sort_order or delete on public.projects
for each row execute function public.maintain_product_positions();

revoke all on function public.lock_product_positions() from public;
revoke all on function public.maintain_product_positions() from public;
