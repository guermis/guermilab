
-- Storage policies for media bucket (allow anon uploads/reads/deletes)
CREATE POLICY "Allow anon upload to media" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow anon select from media" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'media');
CREATE POLICY "Allow anon update in media" ON storage.objects FOR UPDATE TO anon USING (bucket_id = 'media') WITH CHECK (bucket_id = 'media');
CREATE POLICY "Allow anon delete from media" ON storage.objects FOR DELETE TO anon USING (bucket_id = 'media');
