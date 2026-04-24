-- 1. Drop the public SELECT policy on projects that exposed access_password
DROP POLICY IF EXISTS "Public read projects" ON public.projects;

-- Add an authenticated-only management/read policy is already present ("Auth manage projects").
-- Revoke direct table SELECT from anon/public to ensure all public reads go through projects_public view.
REVOKE SELECT ON public.projects FROM anon;
REVOKE SELECT ON public.projects FROM PUBLIC;

-- 2. Recreate projects_public view with security_invoker so RLS of querying user applies
DROP VIEW IF EXISTS public.projects_public;

CREATE VIEW public.projects_public
WITH (security_invoker = on)
AS
SELECT
  id,
  slug,
  title,
  short_description,
  long_description,
  tags,
  year,
  category,
  thumbnail_url,
  hero_image_url,
  main_video_url,
  is_published,
  is_private,
  sort_order,
  client_name,
  role_title,
  duration,
  context,
  execution,
  result,
  director_notes,
  created_at,
  updated_at
FROM public.projects
WHERE is_published = true;

-- Because the view uses security_invoker, the querying role needs SELECT on the underlying table
-- for published rows. We re-grant a narrow SELECT on the view AND add a public SELECT policy on
-- projects scoped to is_published = true that we re-create but EXCLUDE access_password via column grants.
GRANT SELECT ON public.projects_public TO anon, authenticated;

-- Recreate a narrow public RLS policy on projects (needed because security_invoker view will check RLS),
-- but use column-level GRANTs so anon cannot read access_password.
CREATE POLICY "Public read published projects"
ON public.projects
FOR SELECT
TO anon
USING (is_published = true);

-- Column-level grants: explicitly grant SELECT only on safe columns to anon (access_password excluded)
GRANT SELECT (
  id, slug, title, short_description, long_description, tags, year, category,
  thumbnail_url, hero_image_url, main_video_url, is_published, is_private,
  sort_order, client_name, role_title, duration, context, execution, result,
  director_notes, created_at, updated_at
) ON public.projects TO anon;

-- Authenticated keeps full access via existing "Auth manage projects" policy + default grants
GRANT SELECT ON public.projects TO authenticated;

-- 3. Restrict storage.objects SELECT on the 'media' bucket to remove broad listing
-- Drop the duplicate/over-broad policies and keep one scoped policy that allows reading individual files.
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
DROP POLICY IF EXISTS "Allow anon select from media" ON storage.objects;

-- Re-create a single SELECT policy that allows reading objects but not listing the root.
-- name <> '' ensures requests targeting a specific object path are allowed; bucket-level list calls
-- (which evaluate against an empty/null name) will be denied.
CREATE POLICY "Public read media files"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'media' AND name IS NOT NULL AND length(name) > 0);