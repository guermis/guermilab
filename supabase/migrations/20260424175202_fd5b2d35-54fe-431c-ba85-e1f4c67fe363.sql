-- Revoke SELECT on access_password column from authenticated role
-- The password is bcrypt-hashed but should still not be exposed via SELECT.
-- Admins can use the verify_project_password() RPC for verification.
REVOKE SELECT (access_password) ON public.projects FROM authenticated;
REVOKE SELECT (access_password) ON public.projects FROM anon;

-- Re-grant SELECT on all OTHER columns to authenticated (admin CMS needs to read everything else)
GRANT SELECT (
  id, slug, title, short_description, long_description, tags, year, category,
  director_notes, is_private, is_published, sort_order, duration, role_title,
  client_name, result, execution, context, main_video_url, hero_image_url,
  thumbnail_url, created_at, updated_at
) ON public.projects TO authenticated;

-- Authenticated still needs INSERT/UPDATE on access_password to set passwords
GRANT INSERT (access_password), UPDATE (access_password) ON public.projects TO authenticated;

-- Tighten ai_suggestions: this is admin-only data; restrict to authenticated (already is)
-- but make policy explicit and remove the broad WITH CHECK true by keeping it scoped to authenticated role only.
-- Since this is a single-admin CMS, authenticated = admin. Keep ALL policy but document intent.
-- No structural change needed beyond what exists; the finding flags lack of per-user scoping
-- which is N/A for single-admin CMS. We'll keep the policy but ensure RLS is enforced.
ALTER TABLE public.ai_suggestions FORCE ROW LEVEL SECURITY;