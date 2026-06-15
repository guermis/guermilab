
-- 1) Drop legacy columns from hero_images
ALTER TABLE public.hero_images DROP COLUMN IF EXISTS image_url;
ALTER TABLE public.hero_images DROP COLUMN IF EXISTS image_url_vertical;

-- 2) Tighten RLS on admin tables: replace "Auth manage" (true) with admin-only
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'hero_images','videos_vertical','videos_horizontal',
    'photography_albums','photography_photos',
    'about_content','about_stats',
    'links','links_profile',
    'content_blocks','project_themes','theme_settings',
    'projects','ai_suggestions'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Auth manage ' || t, t);
    EXECUTE format($f$
      CREATE POLICY %I ON public.%I
        FOR ALL TO authenticated
        USING (public.has_role(auth.uid(), 'admin'::app_role))
        WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role))
    $f$, 'Admins manage ' || t, t);
  END LOOP;
END $$;

-- 3) Tighten storage media bucket writes to admin only
DROP POLICY IF EXISTS "Auth upload media" ON storage.objects;
DROP POLICY IF EXISTS "Auth update media" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete media" ON storage.objects;

CREATE POLICY "Admins upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'::app_role));
