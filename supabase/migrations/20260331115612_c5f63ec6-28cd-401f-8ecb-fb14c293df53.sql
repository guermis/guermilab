
-- Remove anon write policies on content tables
DROP POLICY IF EXISTS "Anon manage hero_images" ON public.hero_images;
DROP POLICY IF EXISTS "Anon manage videos_vertical" ON public.videos_vertical;
DROP POLICY IF EXISTS "Anon manage videos_horizontal" ON public.videos_horizontal;
DROP POLICY IF EXISTS "Anon manage photography_albums" ON public.photography_albums;
DROP POLICY IF EXISTS "Anon manage photography_photos" ON public.photography_photos;
DROP POLICY IF EXISTS "Anon manage about_content" ON public.about_content;
DROP POLICY IF EXISTS "Anon manage about_stats" ON public.about_stats;

-- Add authenticated write policy for about_stats (was missing)
CREATE POLICY "Auth manage about_stats" ON public.about_stats
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Remove public read on ai_suggestions (internal data)
DROP POLICY IF EXISTS "Public read ai_suggestions" ON public.ai_suggestions;

-- Revoke access_password column from anon/public reads on projects
-- Create a secure view for public project access that excludes access_password
CREATE OR REPLACE VIEW public.projects_public AS
  SELECT id, slug, title, short_description, long_description, tags, year, category,
         thumbnail_url, hero_image_url, main_video_url, is_published, is_private,
         sort_order, client_name, role_title, duration, context, execution, result,
         director_notes, created_at, updated_at
  FROM public.projects
  WHERE is_published = true;

-- Grant access to the view
GRANT SELECT ON public.projects_public TO anon;
GRANT SELECT ON public.projects_public TO authenticated;

-- Remove anon storage policies on media bucket
DROP POLICY IF EXISTS "Allow anon upload to media" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon update in media" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon delete from media" ON storage.objects;

-- Ensure authenticated storage policies exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth upload media' AND tablename = 'objects') THEN
    EXECUTE 'CREATE POLICY "Auth upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = ''media'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth update media' AND tablename = 'objects') THEN
    EXECUTE 'CREATE POLICY "Auth update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = ''media'')';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth delete media' AND tablename = 'objects') THEN
    EXECUTE 'CREATE POLICY "Auth delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = ''media'')';
  END IF;
END $$;
