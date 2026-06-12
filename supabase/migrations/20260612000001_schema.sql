-- Gergoci platform — core schema
-- Translation-table pattern: base table holds locale-independent data,
-- *_translations tables hold one row per locale ('en' | 'sq').

-- ---------------------------------------------------------------------------
-- media (referenced by project_images and partners, so created first)
-- ---------------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_en text,
  alt_sq text,
  width integer,
  height integer,
  mime_type text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- project categories
-- ---------------------------------------------------------------------------
create table public.project_categories (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.project_category_translations (
  category_id uuid not null references public.project_categories(id) on delete cascade,
  locale text not null check (locale in ('en', 'sq')),
  name text not null,
  slug text not null,
  description text,
  seo_title text,
  seo_description text,
  primary key (category_id, locale),
  unique (locale, slug)
);

-- ---------------------------------------------------------------------------
-- projects (products)
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.project_categories(id) on delete restrict,
  brochure_url text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create index projects_category_id_idx on public.projects (category_id);

create table public.project_translations (
  project_id uuid not null references public.projects(id) on delete cascade,
  locale text not null check (locale in ('en', 'sq')),
  title text not null,
  slug text not null,
  body text,
  seo_title text,
  seo_description text,
  primary key (project_id, locale),
  unique (locale, slug)
);

create table public.project_facts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  locale text not null check (locale in ('en', 'sq')),
  label text not null,
  value text not null,
  sort_order integer not null default 0
);

create index project_facts_project_id_idx on public.project_facts (project_id);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_id uuid not null references public.media(id) on delete restrict,
  sort_order integer not null default 0,
  is_featured boolean not null default false
);

create index project_images_project_id_idx on public.project_images (project_id);
create index project_images_media_id_idx on public.project_images (media_id);

-- ---------------------------------------------------------------------------
-- pages and sections
-- ---------------------------------------------------------------------------
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  key text not null unique
    check (key in ('home', 'about', 'services', 'products', 'contact', 'get-quote'))
);

create table public.page_translations (
  page_id uuid not null references public.pages(id) on delete cascade,
  locale text not null check (locale in ('en', 'sq')),
  title text not null,
  slug text not null,
  seo_title text,
  seo_description text,
  primary key (page_id, locale)
);

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  key text not null,
  type text not null,
  sort_order integer not null default 0,
  unique (page_id, key)
);

create index page_sections_page_id_idx on public.page_sections (page_id);

create table public.page_section_translations (
  section_id uuid not null references public.page_sections(id) on delete cascade,
  locale text not null check (locale in ('en', 'sq')),
  content jsonb not null default '{}'::jsonb,
  primary key (section_id, locale)
);

-- ---------------------------------------------------------------------------
-- partners
-- ---------------------------------------------------------------------------
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_media_id uuid references public.media(id) on delete set null,
  url text,
  sort_order integer not null default 0
);

-- ---------------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------------
create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  sort_order integer not null default 0
);

create table public.faq_translations (
  faq_id uuid not null references public.faqs(id) on delete cascade,
  locale text not null check (locale in ('en', 'sq')),
  question text not null,
  answer text not null,
  primary key (faq_id, locale)
);

-- ---------------------------------------------------------------------------
-- form submissions
-- ---------------------------------------------------------------------------
create table public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_type text not null check (form_type in ('contact', 'quote')),
  payload jsonb not null,
  locale text not null check (locale in ('en', 'sq')),
  is_read boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index form_submissions_created_at_idx on public.form_submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- profiles (admin users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor'))
);
