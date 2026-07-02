-- Editor-managed image galleries (e.g. the homepage "Our projects" showcase).
-- Rows reference a file in the `media` storage bucket by path and carry an
-- explicit order, so admins can upload, remove, and reorder without renaming files.
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  gallery text not null,              -- e.g. 'projects'
  storage_path text not null,         -- path within the `media` bucket
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_gallery_idx
  on public.gallery_images (gallery, sort_order);

alter table public.gallery_images enable row level security;

create policy "gallery_images public read" on public.gallery_images
  for select using (true);
create policy "gallery_images editor insert" on public.gallery_images
  for insert to authenticated with check (public.is_editor());
create policy "gallery_images editor update" on public.gallery_images
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "gallery_images editor delete" on public.gallery_images
  for delete to authenticated using (public.is_editor());
