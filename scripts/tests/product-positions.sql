-- Run with psql -v ON_ERROR_STOP=1 -d <empty_disposable_database> -f this_file.
-- The minimal fixture, migration, and assertions are all rolled back.
begin;
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  sort_order integer not null default 0
);
\ir ../../supabase/migrations/20260915000001_product_positions.sql
create function pg_temp.expect_positions(expected text[]) returns void language plpgsql as $$
declare actual text[]; positions integer[];
begin
  select array_agg(label order by sort_order), array_agg(sort_order order by sort_order)
  into actual, positions from public.projects;
  if actual is distinct from expected then raise exception 'Expected %, got %', expected, actual; end if;
  if positions is distinct from array(select generate_series(1, cardinality(expected))) then
    raise exception 'Positions are not consecutive: %', positions;
  end if;
end;
$$;
insert into public.projects(label) values ('A'), ('B'), ('C'), ('D');
select pg_temp.expect_positions(array['A','B','C','D']);
-- A manual rerun must preserve populated positions and not recreate constraints.
set constraints all immediate;
\ir ../../supabase/migrations/20260915000001_product_positions.sql
\ir ../../supabase/migrations/20260915000001_product_positions.sql
set constraints all deferred;
select pg_temp.expect_positions(array['A','B','C','D']);
update public.projects set sort_order=2 where label='D';
select pg_temp.expect_positions(array['A','D','B','C']);
update public.projects set sort_order=4 where label='A';
select pg_temp.expect_positions(array['D','B','C','A']);
update public.projects set sort_order=1 where label='A';
select pg_temp.expect_positions(array['A','D','B','C']);
update public.projects set sort_order=1 where label='A';
select pg_temp.expect_positions(array['A','D','B','C']);
insert into public.projects(label, sort_order) values ('E',2);
select pg_temp.expect_positions(array['A','E','D','B','C']);
delete from public.projects where label='D';
select pg_temp.expect_positions(array['A','E','B','C']);
update public.projects set label='C renamed' where label='C';
select pg_temp.expect_positions(array['A','E','B','C renamed']);
do $$
begin
  begin
    update public.projects set sort_order=0 where label='A';
    raise exception 'Zero position was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    update public.projects set sort_order=5 where label='A';
    raise exception 'Out-of-range position was accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    insert into public.projects(label, sort_order) values ('Invalid',6);
    raise exception 'Out-of-range insert was accepted';
  exception when invalid_parameter_value then null;
  end;
end;
$$;
select pg_temp.expect_positions(array['A','E','B','C renamed']);
set constraints all immediate;
rollback;
