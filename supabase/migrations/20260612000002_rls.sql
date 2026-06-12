-- Gergoci platform — Row Level Security
--
-- Policy model:
--   * anon / public read: SELECT only, and only published rows where applicable
--     (projects and their child rows are hidden until projects.published = true).
--   * anon INSERT allowed only on form_submissions.
--   * All writes require an authenticated user that has a profiles row.
--   * The service role bypasses RLS and is used only in server-side admin actions.

-- True when the current authenticated user has a profiles row (admin or editor).
-- SECURITY DEFINER so the profiles lookup does not recurse through profiles RLS.
create or replace function public.is_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

revoke execute on function public.is_editor() from public;
grant execute on function public.is_editor() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- enable RLS on every table
-- ---------------------------------------------------------------------------
alter table public.media enable row level security;
alter table public.project_categories enable row level security;
alter table public.project_category_translations enable row level security;
alter table public.projects enable row level security;
alter table public.project_translations enable row level security;
alter table public.project_facts enable row level security;
alter table public.project_images enable row level security;
alter table public.pages enable row level security;
alter table public.page_translations enable row level security;
alter table public.page_sections enable row level security;
alter table public.page_section_translations enable row level security;
alter table public.partners enable row level security;
alter table public.faqs enable row level security;
alter table public.faq_translations enable row level security;
alter table public.form_submissions enable row level security;
alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- public-content tables: open SELECT, editor-only writes
-- ---------------------------------------------------------------------------
-- media
create policy "media public read" on public.media
  for select using (true);
create policy "media editor insert" on public.media
  for insert to authenticated with check (public.is_editor());
create policy "media editor update" on public.media
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "media editor delete" on public.media
  for delete to authenticated using (public.is_editor());

-- project_categories
create policy "project_categories public read" on public.project_categories
  for select using (true);
create policy "project_categories editor insert" on public.project_categories
  for insert to authenticated with check (public.is_editor());
create policy "project_categories editor update" on public.project_categories
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "project_categories editor delete" on public.project_categories
  for delete to authenticated using (public.is_editor());

-- project_category_translations
create policy "project_category_translations public read" on public.project_category_translations
  for select using (true);
create policy "project_category_translations editor insert" on public.project_category_translations
  for insert to authenticated with check (public.is_editor());
create policy "project_category_translations editor update" on public.project_category_translations
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "project_category_translations editor delete" on public.project_category_translations
  for delete to authenticated using (public.is_editor());

-- pages
create policy "pages public read" on public.pages
  for select using (true);
create policy "pages editor insert" on public.pages
  for insert to authenticated with check (public.is_editor());
create policy "pages editor update" on public.pages
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "pages editor delete" on public.pages
  for delete to authenticated using (public.is_editor());

-- page_translations
create policy "page_translations public read" on public.page_translations
  for select using (true);
create policy "page_translations editor insert" on public.page_translations
  for insert to authenticated with check (public.is_editor());
create policy "page_translations editor update" on public.page_translations
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "page_translations editor delete" on public.page_translations
  for delete to authenticated using (public.is_editor());

-- page_sections
create policy "page_sections public read" on public.page_sections
  for select using (true);
create policy "page_sections editor insert" on public.page_sections
  for insert to authenticated with check (public.is_editor());
create policy "page_sections editor update" on public.page_sections
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "page_sections editor delete" on public.page_sections
  for delete to authenticated using (public.is_editor());

-- page_section_translations
create policy "page_section_translations public read" on public.page_section_translations
  for select using (true);
create policy "page_section_translations editor insert" on public.page_section_translations
  for insert to authenticated with check (public.is_editor());
create policy "page_section_translations editor update" on public.page_section_translations
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "page_section_translations editor delete" on public.page_section_translations
  for delete to authenticated using (public.is_editor());

-- partners
create policy "partners public read" on public.partners
  for select using (true);
create policy "partners editor insert" on public.partners
  for insert to authenticated with check (public.is_editor());
create policy "partners editor update" on public.partners
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "partners editor delete" on public.partners
  for delete to authenticated using (public.is_editor());

-- faqs
create policy "faqs public read" on public.faqs
  for select using (true);
create policy "faqs editor insert" on public.faqs
  for insert to authenticated with check (public.is_editor());
create policy "faqs editor update" on public.faqs
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "faqs editor delete" on public.faqs
  for delete to authenticated using (public.is_editor());

-- faq_translations
create policy "faq_translations public read" on public.faq_translations
  for select using (true);
create policy "faq_translations editor insert" on public.faq_translations
  for insert to authenticated with check (public.is_editor());
create policy "faq_translations editor update" on public.faq_translations
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "faq_translations editor delete" on public.faq_translations
  for delete to authenticated using (public.is_editor());

-- ---------------------------------------------------------------------------
-- projects + child tables: anon sees only published; editors see everything
-- ---------------------------------------------------------------------------
create policy "projects public read published" on public.projects
  for select using (published = true or public.is_editor());
create policy "projects editor insert" on public.projects
  for insert to authenticated with check (public.is_editor());
create policy "projects editor update" on public.projects
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "projects editor delete" on public.projects
  for delete to authenticated using (public.is_editor());

create policy "project_translations read of published" on public.project_translations
  for select using (
    public.is_editor()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.published = true
    )
  );
create policy "project_translations editor insert" on public.project_translations
  for insert to authenticated with check (public.is_editor());
create policy "project_translations editor update" on public.project_translations
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "project_translations editor delete" on public.project_translations
  for delete to authenticated using (public.is_editor());

create policy "project_facts read of published" on public.project_facts
  for select using (
    public.is_editor()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.published = true
    )
  );
create policy "project_facts editor insert" on public.project_facts
  for insert to authenticated with check (public.is_editor());
create policy "project_facts editor update" on public.project_facts
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "project_facts editor delete" on public.project_facts
  for delete to authenticated using (public.is_editor());

create policy "project_images read of published" on public.project_images
  for select using (
    public.is_editor()
    or exists (
      select 1 from public.projects p
      where p.id = project_id and p.published = true
    )
  );
create policy "project_images editor insert" on public.project_images
  for insert to authenticated with check (public.is_editor());
create policy "project_images editor update" on public.project_images
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "project_images editor delete" on public.project_images
  for delete to authenticated using (public.is_editor());

-- ---------------------------------------------------------------------------
-- form_submissions: anyone may INSERT; only editors may read/update/delete
-- ---------------------------------------------------------------------------
create policy "form_submissions public insert" on public.form_submissions
  for insert with check (true);
create policy "form_submissions editor read" on public.form_submissions
  for select to authenticated using (public.is_editor());
create policy "form_submissions editor update" on public.form_submissions
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "form_submissions editor delete" on public.form_submissions
  for delete to authenticated using (public.is_editor());

-- ---------------------------------------------------------------------------
-- profiles: users read their own row; all writes go through the service role
-- ---------------------------------------------------------------------------
create policy "profiles read own" on public.profiles
  for select to authenticated using (id = auth.uid());
