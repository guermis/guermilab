-- 1. Trigger/helper functions should never be callable via the API
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.hash_project_access_password() FROM PUBLIC, anon, authenticated;

-- has_role is used inside RLS policies (needs EXECUTE for signed-in users only)
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- verify_project_password is intentionally public (password gate for private projects),
-- but must never be executable with elevated intent beyond its purpose.
REVOKE ALL ON FUNCTION public.verify_project_password(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_project_password(text, text) TO anon, authenticated;

-- 2. project_themes must not leak private/unpublished project theming
DROP POLICY IF EXISTS "Public read project_themes" ON public.project_themes;

CREATE POLICY "Public read themes of published public projects"
ON public.project_themes
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    WHERE (p.id::text = project_themes.project_id OR p.slug = project_themes.project_id)
      AND p.is_published = true
      AND p.is_private = false
  )
);