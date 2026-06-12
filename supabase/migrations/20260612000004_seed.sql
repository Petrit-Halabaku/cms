-- Gergoci platform — seed data
-- Fixed UUIDs so later migrations / redirect maps can reference rows:
--   a… = project_categories, b… = projects, c… = pages,
--   d… = page_sections, e… = faqs, f… = partners
-- Placeholder copy is marked 'TODO: content migration'.

-- ---------------------------------------------------------------------------
-- project categories
-- ---------------------------------------------------------------------------
insert into public.project_categories (id, sort_order) values
  ('a0000000-0000-4000-8000-000000000001', 1), -- windows
  ('a0000000-0000-4000-8000-000000000002', 2), -- doors
  ('a0000000-0000-4000-8000-000000000003', 3), -- sliding systems
  ('a0000000-0000-4000-8000-000000000004', 4), -- aluminium
  ('a0000000-0000-4000-8000-000000000005', 5), -- glass
  ('a0000000-0000-4000-8000-000000000006', 6), -- blinds
  ('a0000000-0000-4000-8000-000000000007', 7); -- roller shutters

insert into public.project_category_translations
  (category_id, locale, name, slug, description, seo_title, seo_description)
values
  ('a0000000-0000-4000-8000-000000000001', 'en', 'Windows',          'windows',            'TODO: content migration', 'Windows | Gergoci',            'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000001', 'sq', 'Dritare',          'dritare',            'TODO: content migration', 'Dritare | Gergoci',            'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000002', 'en', 'Doors',            'doors',              'TODO: content migration', 'Doors | Gergoci',              'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000002', 'sq', 'Dyer',             'dyer',               'TODO: content migration', 'Dyer | Gergoci',               'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000003', 'en', 'Sliding Systems',  'sliding-systems',    'TODO: content migration', 'Sliding Systems | Gergoci',    'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000003', 'sq', 'Sisteme Rrëshqitëse', 'sisteme-rreshqitese', 'TODO: content migration', 'Sisteme Rrëshqitëse | Gergoci', 'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000004', 'en', 'Aluminium',        'aluminium',          'TODO: content migration', 'Aluminium | Gergoci',          'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000004', 'sq', 'Alumin',           'alumin',             'TODO: content migration', 'Alumin | Gergoci',             'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000005', 'en', 'Glass',            'glass',              'TODO: content migration', 'Glass | Gergoci',              'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000005', 'sq', 'Xhama',            'xhama',              'TODO: content migration', 'Xhama | Gergoci',              'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000006', 'en', 'Blinds',           'blinds',             'TODO: content migration', 'Blinds | Gergoci',             'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000006', 'sq', 'Perde',            'perde',              'TODO: content migration', 'Perde | Gergoci',              'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000007', 'en', 'Roller Shutters',  'roller-shutters',    'TODO: content migration', 'Roller Shutters | Gergoci',    'TODO: content migration'),
  ('a0000000-0000-4000-8000-000000000007', 'sq', 'Roleta',           'roleta',             'TODO: content migration', 'Roleta | Gergoci',             'TODO: content migration');

-- ---------------------------------------------------------------------------
-- projects (products) — all published
-- ---------------------------------------------------------------------------
insert into public.projects (id, category_id, sort_order, published) values
  -- windows
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 1, true), -- bluEvolution 73
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 2, true), -- bluEvolution 82
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 3, true), -- bluEvolution 92
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 4, true), -- greenEvolution box
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 5, true), -- Self-locking drive gear
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 6, true), -- MULTI SECUAIR
  -- doors
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000002', 1, true), -- Doorsystem bluEvolution 82
  ('b0000000-0000-4000-8000-000000000008', 'a0000000-0000-4000-8000-000000000002', 2, true), -- Doorsystem bluEvolution 92
  ('b0000000-0000-4000-8000-000000000009', 'a0000000-0000-4000-8000-000000000002', 3, true), -- A-TS Self-locking door lock
  ('b0000000-0000-4000-8000-000000000010', 'a0000000-0000-4000-8000-000000000002', 4, true), -- Z-TF
  -- sliding systems
  ('b0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000003', 1, true), -- evolutionDrive HST
  -- aluminium
  ('b0000000-0000-4000-8000-000000000012', 'a0000000-0000-4000-8000-000000000004', 1, true), -- SMARTIA M6
  ('b0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000004', 2, true), -- SMARTIA M11000
  ('b0000000-0000-4000-8000-000000000014', 'a0000000-0000-4000-8000-000000000004', 3, true), -- SMARTIA S67
  ('b0000000-0000-4000-8000-000000000015', 'a0000000-0000-4000-8000-000000000004', 4, true), -- SUPREME S77
  -- glass
  ('b0000000-0000-4000-8000-000000000016', 'a0000000-0000-4000-8000-000000000005', 1, true), -- ClimaGuard Premium2
  ('b0000000-0000-4000-8000-000000000017', 'a0000000-0000-4000-8000-000000000005', 2, true), -- ClimaGuard Solar
  ('b0000000-0000-4000-8000-000000000018', 'a0000000-0000-4000-8000-000000000005', 3, true), -- ExtraClear
  ('b0000000-0000-4000-8000-000000000019', 'a0000000-0000-4000-8000-000000000005', 4, true), -- Laminated Glass
  -- blinds
  ('b0000000-0000-4000-8000-000000000020', 'a0000000-0000-4000-8000-000000000006', 1, true), -- MecoClassic
  -- roller shutters
  ('b0000000-0000-4000-8000-000000000021', 'a0000000-0000-4000-8000-000000000007', 1, true); -- Built-in roller shutters

insert into public.project_translations
  (project_id, locale, title, slug, body, seo_title, seo_description)
values
  ('b0000000-0000-4000-8000-000000000001', 'en', 'bluEvolution 73', 'bluevolution-73', 'TODO: content migration', 'bluEvolution 73 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000001', 'sq', 'bluEvolution 73', 'bluevolution-73', 'TODO: content migration', 'bluEvolution 73 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000002', 'en', 'bluEvolution 82', 'bluevolution-82', 'TODO: content migration', 'bluEvolution 82 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000002', 'sq', 'bluEvolution 82', 'bluevolution-82', 'TODO: content migration', 'bluEvolution 82 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000003', 'en', 'bluEvolution 92', 'bluevolution-92', 'TODO: content migration', 'bluEvolution 92 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000003', 'sq', 'bluEvolution 92', 'bluevolution-92', 'TODO: content migration', 'bluEvolution 92 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000004', 'en', 'greenEvolution box', 'greenevolution-box', 'TODO: content migration', 'greenEvolution box | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000004', 'sq', 'greenEvolution box', 'greenevolution-box', 'TODO: content migration', 'greenEvolution box | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000005', 'en', 'Self-locking drive gear', 'self-locking-drive-gear', 'TODO: content migration', 'Self-locking drive gear | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000005', 'sq', 'Mekanizmi vetëbllokues', 'mekanizmi-vetebllokues', 'TODO: content migration', 'Mekanizmi vetëbllokues | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000006', 'en', 'MULTI SECUAIR secured ventilation position', 'multi-secuair-secured-ventilation-position', 'TODO: content migration', 'MULTI SECUAIR secured ventilation position | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000006', 'sq', 'MULTI SECUAIR pozicioni i ajrosjes së sigurt', 'multi-secuair-ajrosje-e-sigurt', 'TODO: content migration', 'MULTI SECUAIR pozicioni i ajrosjes së sigurt | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000007', 'en', 'Doorsystem bluEvolution 82', 'doorsystem-bluevolution-82', 'TODO: content migration', 'Doorsystem bluEvolution 82 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000007', 'sq', 'Sistemi i dyerve bluEvolution 82', 'sistemi-dyerve-bluevolution-82', 'TODO: content migration', 'Sistemi i dyerve bluEvolution 82 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000008', 'en', 'Doorsystem bluEvolution 92', 'doorsystem-bluevolution-92', 'TODO: content migration', 'Doorsystem bluEvolution 92 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000008', 'sq', 'Sistemi i dyerve bluEvolution 92', 'sistemi-dyerve-bluevolution-92', 'TODO: content migration', 'Sistemi i dyerve bluEvolution 92 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000009', 'en', 'A-TS Self-locking door lock', 'a-ts-self-locking-door-lock', 'TODO: content migration', 'A-TS Self-locking door lock | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000009', 'sq', 'A-TS Brava vetëbllokuese', 'a-ts-brava-vetebllokuese', 'TODO: content migration', 'A-TS Brava vetëbllokuese | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000010', 'en', 'Z-TF', 'z-tf', 'TODO: content migration', 'Z-TF | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000010', 'sq', 'Z-TF', 'z-tf', 'TODO: content migration', 'Z-TF | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000011', 'en', 'evolutionDrive HST', 'evolutiondrive-hst', 'TODO: content migration', 'evolutionDrive HST | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000011', 'sq', 'evolutionDrive HST', 'evolutiondrive-hst', 'TODO: content migration', 'evolutionDrive HST | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000012', 'en', 'SMARTIA M6', 'smartia-m6', 'TODO: content migration', 'SMARTIA M6 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000012', 'sq', 'SMARTIA M6', 'smartia-m6', 'TODO: content migration', 'SMARTIA M6 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000013', 'en', 'SMARTIA M11000', 'smartia-m11000', 'TODO: content migration', 'SMARTIA M11000 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000013', 'sq', 'SMARTIA M11000', 'smartia-m11000', 'TODO: content migration', 'SMARTIA M11000 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000014', 'en', 'SMARTIA S67', 'smartia-s67', 'TODO: content migration', 'SMARTIA S67 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000014', 'sq', 'SMARTIA S67', 'smartia-s67', 'TODO: content migration', 'SMARTIA S67 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000015', 'en', 'SUPREME S77', 'supreme-s77', 'TODO: content migration', 'SUPREME S77 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000015', 'sq', 'SUPREME S77', 'supreme-s77', 'TODO: content migration', 'SUPREME S77 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000016', 'en', 'ClimaGuard Premium2', 'climaguard-premium2', 'TODO: content migration', 'ClimaGuard Premium2 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000016', 'sq', 'ClimaGuard Premium2', 'climaguard-premium2', 'TODO: content migration', 'ClimaGuard Premium2 | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000017', 'en', 'ClimaGuard Solar', 'climaguard-solar', 'TODO: content migration', 'ClimaGuard Solar | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000017', 'sq', 'ClimaGuard Solar', 'climaguard-solar', 'TODO: content migration', 'ClimaGuard Solar | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000018', 'en', 'ExtraClear', 'extraclear', 'TODO: content migration', 'ExtraClear | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000018', 'sq', 'ExtraClear', 'extraclear', 'TODO: content migration', 'ExtraClear | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000019', 'en', 'Laminated Glass', 'laminated-glass', 'TODO: content migration', 'Laminated Glass | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000019', 'sq', 'Xham i laminuar', 'xham-i-laminuar', 'TODO: content migration', 'Xham i laminuar | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000020', 'en', 'MecoClassic', 'mecoclassic', 'TODO: content migration', 'MecoClassic | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000020', 'sq', 'MecoClassic', 'mecoclassic', 'TODO: content migration', 'MecoClassic | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000021', 'en', 'Built-in roller shutters', 'built-in-roller-shutters', 'TODO: content migration', 'Built-in roller shutters | Gergoci', 'TODO: content migration'),
  ('b0000000-0000-4000-8000-000000000021', 'sq', 'Roleta të integruara', 'roleta-te-integruara', 'TODO: content migration', 'Roleta të integruara | Gergoci', 'TODO: content migration');

-- Three placeholder spec facts per product per locale so product pages render a facts list.
insert into public.project_facts (project_id, locale, label, value, sort_order)
select p.id, t.locale, t.label, 'TODO: content migration', t.sort_order
from public.projects p
cross join (values
  ('en', 'Profile depth', 1),
  ('en', 'Glazing', 2),
  ('en', 'Thermal insulation', 3),
  ('sq', 'Thellësia e profilit', 1),
  ('sq', 'Xhamimi', 2),
  ('sq', 'Izolimi termik', 3)
) as t(locale, label, sort_order);

-- ---------------------------------------------------------------------------
-- pages
-- ---------------------------------------------------------------------------
insert into public.pages (id, key) values
  ('c0000000-0000-4000-8000-000000000001', 'home'),
  ('c0000000-0000-4000-8000-000000000002', 'about'),
  ('c0000000-0000-4000-8000-000000000003', 'services'),
  ('c0000000-0000-4000-8000-000000000004', 'products'),
  ('c0000000-0000-4000-8000-000000000005', 'contact'),
  ('c0000000-0000-4000-8000-000000000006', 'get-quote');

insert into public.page_translations (page_id, locale, title, slug, seo_title, seo_description) values
  ('c0000000-0000-4000-8000-000000000001', 'en', 'Home',        '',           'Gergoci — Windows, Doors & Glass Systems in Pejë, Kosovo', 'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000001', 'sq', 'Ballina',     '',           'Gergoci — Dritare, Dyer & Sisteme Xhami në Pejë, Kosovë',  'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000002', 'en', 'About Us',    'about',      'About Us | Gergoci',      'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000002', 'sq', 'Rreth Nesh',  'rreth-nesh', 'Rreth Nesh | Gergoci',    'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000003', 'en', 'Services',    'services',   'Services | Gergoci',      'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000003', 'sq', 'Shërbimet',   'sherbimet',  'Shërbimet | Gergoci',     'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000004', 'en', 'Products',    'products',   'Products | Gergoci',      'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000004', 'sq', 'Produktet',   'produktet',  'Produktet | Gergoci',     'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000005', 'en', 'Contact',     'contact',    'Contact | Gergoci',       'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000005', 'sq', 'Kontakti',    'kontakti',   'Kontakti | Gergoci',      'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000006', 'en', 'Get a Quote', 'get-quote',  'Get a Quote | Gergoci',   'TODO: content migration'),
  ('c0000000-0000-4000-8000-000000000006', 'sq', 'Kërko Ofertë','kerko-oferte','Kërko Ofertë | Gergoci', 'TODO: content migration');

-- ---------------------------------------------------------------------------
-- page sections
-- ---------------------------------------------------------------------------
insert into public.page_sections (id, page_id, key, type, sort_order) values
  -- home
  ('d0000000-0000-4000-8000-000000000101', 'c0000000-0000-4000-8000-000000000001', 'hero',              'hero',         1),
  ('d0000000-0000-4000-8000-000000000102', 'c0000000-0000-4000-8000-000000000001', 'features',          'cards',        2),
  ('d0000000-0000-4000-8000-000000000103', 'c0000000-0000-4000-8000-000000000001', 'featured-products', 'product-grid', 3),
  ('d0000000-0000-4000-8000-000000000104', 'c0000000-0000-4000-8000-000000000001', 'offer-grid',        'grid',         4),
  ('d0000000-0000-4000-8000-000000000105', 'c0000000-0000-4000-8000-000000000001', 'faq',               'faq',          5),
  ('d0000000-0000-4000-8000-000000000106', 'c0000000-0000-4000-8000-000000000001', 'partners',          'logo-strip',   6),
  ('d0000000-0000-4000-8000-000000000107', 'c0000000-0000-4000-8000-000000000001', 'counters',          'counters',     7),
  ('d0000000-0000-4000-8000-000000000108', 'c0000000-0000-4000-8000-000000000001', 'location',          'location',     8),
  ('d0000000-0000-4000-8000-000000000109', 'c0000000-0000-4000-8000-000000000001', 'quote-cta',         'cta',          9),
  -- about
  ('d0000000-0000-4000-8000-000000000201', 'c0000000-0000-4000-8000-000000000002', 'story',    'rich-text', 1),
  ('d0000000-0000-4000-8000-000000000202', 'c0000000-0000-4000-8000-000000000002', 'values',   'cards',     2),
  ('d0000000-0000-4000-8000-000000000203', 'c0000000-0000-4000-8000-000000000002', 'gallery',  'gallery',   3),
  ('d0000000-0000-4000-8000-000000000204', 'c0000000-0000-4000-8000-000000000002', 'counters', 'counters',  4),
  -- services
  ('d0000000-0000-4000-8000-000000000301', 'c0000000-0000-4000-8000-000000000003', 'intro',              'rich-text', 1),
  ('d0000000-0000-4000-8000-000000000302', 'c0000000-0000-4000-8000-000000000003', 'service-categories', 'cards',     2),
  ('d0000000-0000-4000-8000-000000000303', 'c0000000-0000-4000-8000-000000000003', 'installation',       'list',      3),
  ('d0000000-0000-4000-8000-000000000304', 'c0000000-0000-4000-8000-000000000003', 'maintenance',        'list',      4),
  -- products landing
  ('d0000000-0000-4000-8000-000000000401', 'c0000000-0000-4000-8000-000000000004', 'intro', 'rich-text', 1),
  -- contact
  ('d0000000-0000-4000-8000-000000000501', 'c0000000-0000-4000-8000-000000000005', 'info', 'contact-info', 1),
  -- get-quote
  ('d0000000-0000-4000-8000-000000000601', 'c0000000-0000-4000-8000-000000000006', 'intro', 'rich-text', 1);

insert into public.page_section_translations (section_id, locale, content) values
  -- home / hero
  ('d0000000-0000-4000-8000-000000000101', 'en', '{"heading": "Windows, Doors & Glass Systems", "subheading": "TODO: content migration", "cta_label": "Call us now", "phone": "+383 44 000 000", "_note": "TODO: content migration — confirm phone number"}'),
  ('d0000000-0000-4000-8000-000000000101', 'sq', '{"heading": "Dritare, Dyer & Sisteme Xhami", "subheading": "TODO: content migration", "cta_label": "Na telefononi", "phone": "+383 44 000 000", "_note": "TODO: content migration — confirm phone number"}'),
  -- home / features (3 feature cards)
  ('d0000000-0000-4000-8000-000000000102', 'en', '{"items": [{"key": "windows", "title": "Window systems", "body": "TODO: content migration"}, {"key": "doors", "title": "Door systems", "body": "TODO: content migration"}, {"key": "glass", "title": "Glass systems", "body": "TODO: content migration"}]}'),
  ('d0000000-0000-4000-8000-000000000102', 'sq', '{"items": [{"key": "windows", "title": "Sisteme dritaresh", "body": "TODO: content migration"}, {"key": "doors", "title": "Sisteme dyersh", "body": "TODO: content migration"}, {"key": "glass", "title": "Sisteme xhami", "body": "TODO: content migration"}]}'),
  -- home / featured products (rows resolved from projects at render time)
  ('d0000000-0000-4000-8000-000000000103', 'en', '{"heading": "Featured products"}'),
  ('d0000000-0000-4000-8000-000000000103', 'sq', '{"heading": "Produkte të zgjedhura"}'),
  -- home / offer grid
  ('d0000000-0000-4000-8000-000000000104', 'en', '{"heading": "What we offer", "items": [{"title": "PVC windows & doors", "body": "TODO: content migration"}, {"title": "Aluminium systems", "body": "TODO: content migration"}, {"title": "Glass solutions", "body": "TODO: content migration"}, {"title": "Blinds & roller shutters", "body": "TODO: content migration"}]}'),
  ('d0000000-0000-4000-8000-000000000104', 'sq', '{"heading": "Çfarë ofrojmë", "items": [{"title": "Dritare & dyer PVC", "body": "TODO: content migration"}, {"title": "Sisteme alumini", "body": "TODO: content migration"}, {"title": "Zgjidhje xhami", "body": "TODO: content migration"}, {"title": "Perde & roleta", "body": "TODO: content migration"}]}'),
  -- home / faq (questions come from faqs table)
  ('d0000000-0000-4000-8000-000000000105', 'en', '{"heading": "Frequently asked questions"}'),
  ('d0000000-0000-4000-8000-000000000105', 'sq', '{"heading": "Pyetje të shpeshta"}'),
  -- home / partners (logos come from partners table)
  ('d0000000-0000-4000-8000-000000000106', 'en', '{"heading": "Our partners"}'),
  ('d0000000-0000-4000-8000-000000000106', 'sq', '{"heading": "Partnerët tanë"}'),
  -- home / counters
  ('d0000000-0000-4000-8000-000000000107', 'en', '{"heading": "Gergoci in numbers", "items": [{"label": "Years of experience", "value": "25+"}, {"label": "Projects completed", "value": "1000+"}, {"label": "Product systems", "value": "21"}, {"label": "Partner brands", "value": "13"}], "_note": "TODO: content migration — confirm real numbers"}'),
  ('d0000000-0000-4000-8000-000000000107', 'sq', '{"heading": "Gergoci në numra", "items": [{"label": "Vite përvojë", "value": "25+"}, {"label": "Projekte të përfunduara", "value": "1000+"}, {"label": "Sisteme produktesh", "value": "21"}, {"label": "Marka partnere", "value": "13"}], "_note": "TODO: content migration — confirm real numbers"}'),
  -- home / location & hours
  ('d0000000-0000-4000-8000-000000000108', 'en', '{"heading": "Visit us", "address": "Pejë, Kosovo", "lat": 42.6548, "lng": 20.3172, "phone": "+383 44 000 000", "hours": [{"days": "Monday – Friday", "hours": "08:00 – 17:00"}, {"days": "Saturday", "hours": "08:00 – 14:00"}], "_note": "TODO: content migration — confirm address, phone and hours"}'),
  ('d0000000-0000-4000-8000-000000000108', 'sq', '{"heading": "Na vizitoni", "address": "Pejë, Kosovë", "lat": 42.6548, "lng": 20.3172, "phone": "+383 44 000 000", "hours": [{"days": "E hënë – E premte", "hours": "08:00 – 17:00"}, {"days": "E shtunë", "hours": "08:00 – 14:00"}], "_note": "TODO: content migration — confirm address, phone and hours"}'),
  -- home / quote CTA
  ('d0000000-0000-4000-8000-000000000109', 'en', '{"heading": "Need a quote?", "body": "TODO: content migration", "cta_label": "Get a quote"}'),
  ('d0000000-0000-4000-8000-000000000109', 'sq', '{"heading": "Ju nevojitet një ofertë?", "body": "TODO: content migration", "cta_label": "Kërko ofertë"}'),
  -- about / story
  ('d0000000-0000-4000-8000-000000000201', 'en', '{"heading": "Our story", "body": "TODO: content migration"}'),
  ('d0000000-0000-4000-8000-000000000201', 'sq', '{"heading": "Historia jonë", "body": "TODO: content migration"}'),
  -- about / values
  ('d0000000-0000-4000-8000-000000000202', 'en', '{"heading": "Our values", "items": [{"title": "Quality", "body": "TODO: content migration"}, {"title": "Reliability", "body": "TODO: content migration"}, {"title": "Experience", "body": "TODO: content migration"}]}'),
  ('d0000000-0000-4000-8000-000000000202', 'sq', '{"heading": "Vlerat tona", "items": [{"title": "Cilësia", "body": "TODO: content migration"}, {"title": "Besueshmëria", "body": "TODO: content migration"}, {"title": "Përvoja", "body": "TODO: content migration"}]}'),
  -- about / gallery (media ids filled once images are uploaded)
  ('d0000000-0000-4000-8000-000000000203', 'en', '{"heading": "Gallery", "media_ids": []}'),
  ('d0000000-0000-4000-8000-000000000203', 'sq', '{"heading": "Galeria", "media_ids": []}'),
  -- about / counters
  ('d0000000-0000-4000-8000-000000000204', 'en', '{"items": [{"label": "Years of experience", "value": "25+"}, {"label": "Projects completed", "value": "1000+"}, {"label": "Product systems", "value": "21"}, {"label": "Partner brands", "value": "13"}], "_note": "TODO: content migration — confirm real numbers"}'),
  ('d0000000-0000-4000-8000-000000000204', 'sq', '{"items": [{"label": "Vite përvojë", "value": "25+"}, {"label": "Projekte të përfunduara", "value": "1000+"}, {"label": "Sisteme produktesh", "value": "21"}, {"label": "Marka partnere", "value": "13"}], "_note": "TODO: content migration — confirm real numbers"}'),
  -- services / intro
  ('d0000000-0000-4000-8000-000000000301', 'en', '{"heading": "Services", "body": "TODO: content migration"}'),
  ('d0000000-0000-4000-8000-000000000301', 'sq', '{"heading": "Shërbimet", "body": "TODO: content migration"}'),
  -- services / categories
  ('d0000000-0000-4000-8000-000000000302', 'en', '{"items": [{"title": "Installation", "body": "TODO: content migration"}, {"title": "Maintenance", "body": "TODO: content migration"}, {"title": "Consultation", "body": "TODO: content migration"}]}'),
  ('d0000000-0000-4000-8000-000000000302', 'sq', '{"items": [{"title": "Montimi", "body": "TODO: content migration"}, {"title": "Mirëmbajtja", "body": "TODO: content migration"}, {"title": "Konsulenca", "body": "TODO: content migration"}]}'),
  -- services / installation list
  ('d0000000-0000-4000-8000-000000000303', 'en', '{"heading": "Installation", "items": ["TODO: content migration"]}'),
  ('d0000000-0000-4000-8000-000000000303', 'sq', '{"heading": "Montimi", "items": ["TODO: content migration"]}'),
  -- services / maintenance list
  ('d0000000-0000-4000-8000-000000000304', 'en', '{"heading": "Maintenance", "items": ["TODO: content migration"]}'),
  ('d0000000-0000-4000-8000-000000000304', 'sq', '{"heading": "Mirëmbajtja", "items": ["TODO: content migration"]}'),
  -- products / intro
  ('d0000000-0000-4000-8000-000000000401', 'en', '{"heading": "Our products", "body": "TODO: content migration"}'),
  ('d0000000-0000-4000-8000-000000000401', 'sq', '{"heading": "Produktet tona", "body": "TODO: content migration"}'),
  -- contact / info
  ('d0000000-0000-4000-8000-000000000501', 'en', '{"heading": "Contact us", "address": "Pejë, Kosovo", "phone": "+383 44 000 000", "email": "info@gergoci.eu", "lat": 42.6548, "lng": 20.3172, "_note": "TODO: content migration — confirm contact details"}'),
  ('d0000000-0000-4000-8000-000000000501', 'sq', '{"heading": "Na kontaktoni", "address": "Pejë, Kosovë", "phone": "+383 44 000 000", "email": "info@gergoci.eu", "lat": 42.6548, "lng": 20.3172, "_note": "TODO: content migration — confirm contact details"}'),
  -- get-quote / intro
  ('d0000000-0000-4000-8000-000000000601', 'en', '{"heading": "Request a quote", "body": "TODO: content migration"}'),
  ('d0000000-0000-4000-8000-000000000601', 'sq', '{"heading": "Kërkoni një ofertë", "body": "TODO: content migration"}');

-- ---------------------------------------------------------------------------
-- faqs (8 placeholder rows)
-- ---------------------------------------------------------------------------
insert into public.faqs (id, sort_order) values
  ('e0000000-0000-4000-8000-000000000001', 1),
  ('e0000000-0000-4000-8000-000000000002', 2),
  ('e0000000-0000-4000-8000-000000000003', 3),
  ('e0000000-0000-4000-8000-000000000004', 4),
  ('e0000000-0000-4000-8000-000000000005', 5),
  ('e0000000-0000-4000-8000-000000000006', 6),
  ('e0000000-0000-4000-8000-000000000007', 7),
  ('e0000000-0000-4000-8000-000000000008', 8);

insert into public.faq_translations (faq_id, locale, question, answer) values
  ('e0000000-0000-4000-8000-000000000001', 'en', 'What types of windows do you offer?',            'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000001', 'sq', 'Çfarë llojesh dritaresh ofroni?',                 'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000002', 'en', 'Do you provide installation?',                    'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000002', 'sq', 'A ofroni montim?',                                'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000003', 'en', 'What warranty do your products come with?',       'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000003', 'sq', 'Çfarë garancie kanë produktet tuaja?',            'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000004', 'en', 'How long does delivery take?',                    'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000004', 'sq', 'Sa kohë zgjat dorëzimi?',                         'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000005', 'en', 'Can I order custom sizes?',                       'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000005', 'sq', 'A mund të porosis përmasa të personalizuara?',    'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000006', 'en', 'How do I request a quote?',                       'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000006', 'sq', 'Si mund të kërkoj një ofertë?',                   'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000007', 'en', 'Do you work outside Pejë?',                       'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000007', 'sq', 'A punoni edhe jashtë Pejës?',                     'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000008', 'en', 'What maintenance do PVC windows need?',           'TODO: content migration'),
  ('e0000000-0000-4000-8000-000000000008', 'sq', 'Çfarë mirëmbajtjeje kërkojnë dritaret PVC?',      'TODO: content migration');

-- ---------------------------------------------------------------------------
-- partners (13 placeholder rows — names/logos via content migration)
-- ---------------------------------------------------------------------------
insert into public.partners (id, name, sort_order) values
  ('f0000000-0000-4000-8000-000000000001', 'Partner 01 (TODO: content migration)', 1),
  ('f0000000-0000-4000-8000-000000000002', 'Partner 02 (TODO: content migration)', 2),
  ('f0000000-0000-4000-8000-000000000003', 'Partner 03 (TODO: content migration)', 3),
  ('f0000000-0000-4000-8000-000000000004', 'Partner 04 (TODO: content migration)', 4),
  ('f0000000-0000-4000-8000-000000000005', 'Partner 05 (TODO: content migration)', 5),
  ('f0000000-0000-4000-8000-000000000006', 'Partner 06 (TODO: content migration)', 6),
  ('f0000000-0000-4000-8000-000000000007', 'Partner 07 (TODO: content migration)', 7),
  ('f0000000-0000-4000-8000-000000000008', 'Partner 08 (TODO: content migration)', 8),
  ('f0000000-0000-4000-8000-000000000009', 'Partner 09 (TODO: content migration)', 9),
  ('f0000000-0000-4000-8000-000000000010', 'Partner 10 (TODO: content migration)', 10),
  ('f0000000-0000-4000-8000-000000000011', 'Partner 11 (TODO: content migration)', 11),
  ('f0000000-0000-4000-8000-000000000012', 'Partner 12 (TODO: content migration)', 12),
  ('f0000000-0000-4000-8000-000000000013', 'Partner 13 (TODO: content migration)', 13);
