# gergoci.eu — Platform Rebuild

Bilingual (EN/SQ) website + custom admin CMS for Gergoci, a doors & windows
company in Pejë, Kosovo. Replaces the previous WordPress site.

**Stack:** Next.js (App Router, TypeScript strict) · Supabase (Postgres, Auth,
Storage, RLS) · Tailwind CSS

## Local development

1. Copy the env template and fill in values from your Supabase project
   (Settings → API) and EmailJS account (Account → API Keys, plus a service
   and two templates — contact + quote). Never commit real keys.

   ```bash
   cp .env.example .env.local
   ```

   Form notification emails are sent server-side via the EmailJS REST API;
   if the `EMAILJS_*` vars are unset, submissions are still stored and the
   email step is skipped with a warning.

2. Apply database migrations. With the Supabase CLI against a local stack
   (requires Docker):

   ```bash
   supabase start          # boots local Postgres/Auth/Storage
   supabase migration up   # applies supabase/migrations in order
   ```

   Or link a hosted project and push:

   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   ```

3. Run the app:

   ```bash
   npm install
   npm run dev
   ```

## Project layout

- `supabase/migrations/` — schema, RLS policies, storage buckets, seed data
  - `…_schema.sql` — all tables (translation-table pattern, locale ∈ {en, sq})
  - `…_rls.sql` — RLS on every table; anon = read-only published content,
    anon INSERT only on `form_submissions`; writes require a `profiles` row
  - `…_storage.sql` — `media` and `brochures` buckets (public read)
  - `…_seed.sql` — 7 categories, 21 products, 6 pages + sections, 8 FAQs,
    13 partners. Placeholder copy is marked `TODO: content migration`.
- `src/lib/database.types.ts` — typed `Database` schema for supabase-js
- `src/lib/supabase/` — `client` (browser), `server` (SSR + auth cookies),
  `static` (cookie-free anon, public content), `service` (service role,
  server-side admin scripts only)
- `src/lib/db/content.ts` — typed read layer for public content
- `src/proxy.ts` — locale routing (`/` = EN, `/sq` = Albanian), admin session
  gate, legacy WordPress 301 redirects (incl. `?lang=sq`)
- `src/app/(site)/[locale]/` — public site (all slugs resolved from the DB)
- `src/app/(admin)/admin/` — admin dashboard (auth required)
- `src/lib/forms/actions.ts` — contact/quote server actions (zod, honeypot,
  rate limit, EmailJS notification)

## Admin user

```bash
node scripts/create-admin.mjs you@example.com YOUR_PASSWORD        # role: admin
node scripts/create-admin.mjs editor@example.com PASSWORD editor   # role: editor
```

Then sign in at `/admin/login`. The dashboard manages products, categories,
page content, media, partners, FAQs and form submissions; every save
revalidates the affected public pages.
