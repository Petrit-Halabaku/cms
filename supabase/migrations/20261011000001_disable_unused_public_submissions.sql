-- No submission endpoint exists. Close direct anonymous writes until a validated
-- server submission flow is introduced. Existing editor access is preserved.
drop policy if exists "form_submissions public insert" on public.form_submissions;
