-- Gergoci platform — storage buckets
--   media     : public read — product/site images
--   brochures : public read — product brochure PDFs

insert into storage.buckets (id, name, public)
values
  ('media', 'media', true),
  ('brochures', 'brochures', true)
on conflict (id) do nothing;

-- Public read on both buckets (objects are also reachable via public URL).
create policy "public read media and brochures" on storage.objects
  for select using (bucket_id in ('media', 'brochures'));

-- Editors manage objects in both buckets.
create policy "editors insert media and brochures" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('media', 'brochures') and public.is_editor());

create policy "editors update media and brochures" on storage.objects
  for update to authenticated
  using (bucket_id in ('media', 'brochures') and public.is_editor())
  with check (bucket_id in ('media', 'brochures') and public.is_editor());

create policy "editors delete media and brochures" on storage.objects
  for delete to authenticated
  using (bucket_id in ('media', 'brochures') and public.is_editor());
