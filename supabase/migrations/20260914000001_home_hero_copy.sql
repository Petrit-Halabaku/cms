-- Keep the homepage slogan and category line in the content edited by Admin.
-- Merge only these fields, preserving the description, media, and actions.
update public.page_section_translations as translation
set content = translation.content || case translation.locale
  when 'en' then '{"heading":"The Pledge of Quality","categories":"Window | Doors | Glass | Blinds"}'::jsonb
  when 'sq' then '{"heading":"Premtimi i Cilësisë","categories":"Dritare | Dyer | Xham | Roleta"}'::jsonb
end
from public.page_sections as section
join public.pages as page on page.id = section.page_id
where translation.section_id = section.id
  and page.key = 'home'
  and section.type = 'hero'
  and translation.locale in ('en', 'sq');
