-- Tighten anonymous policy: only published AND not private
DROP POLICY IF EXISTS "Public read published projects" ON public.projects;

CREATE POLICY "Public read published public projects"
ON public.projects
FOR SELECT
TO anon
USING (is_published = true AND is_private = false);

-- Restrict column-level access to access_password for anon (defense-in-depth; view already excludes it)
REVOKE SELECT (access_password) ON public.projects FROM anon;

-- Ensure projects_public view (used by clients) does not expose access_password
-- (Recreated previously with security_invoker; reaffirm it excludes access_password)
DROP VIEW IF EXISTS public.projects_public;
CREATE VIEW public.projects_public
WITH (security_invoker = on) AS
SELECT
  id, slug, title, short_description, long_description, tags, year, category,
  thumbnail_url, hero_image_url, main_video_url, context, execution, result,
  client_name, role_title, duration, sort_order, is_published, is_private,
  director_notes, created_at, updated_at
FROM public.projects
WHERE is_published = true AND is_private = false;

GRANT SELECT ON public.projects_public TO anon, authenticated;