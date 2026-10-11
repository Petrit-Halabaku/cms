-- Enforce upload rules at Storage, so direct API calls cannot bypass the UI.
update storage.buckets
set file_size_limit = 104857600,
    allowed_mime_types = array['image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
where id = 'media';

update storage.buckets
set file_size_limit = 20971520,
    allowed_mime_types = array['application/pdf']
where id = 'brochures';
