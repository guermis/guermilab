
-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Allow anyone to read media files (public portfolio)
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT TO public USING (bucket_id = 'media');

-- Allow authenticated users to upload
CREATE POLICY "Auth upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');

-- Allow authenticated users to update/replace
CREATE POLICY "Auth update media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media');

-- Allow authenticated users to delete
CREATE POLICY "Auth delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media');
