-- Remove the redundant home closing CTA (click-to-call is already in the hero).
delete from public.page_sections
where id = 'd0000000-0000-4000-8000-000000000109';
