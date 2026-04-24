-- ============================================================
-- 1) Hash project access_password and provide verification RPC
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Hash any existing plaintext passwords (idempotent: only hash values that
-- are not already a bcrypt hash starting with $2)
UPDATE public.projects
SET access_password = crypt(access_password, gen_salt('bf'))
WHERE access_password IS NOT NULL
  AND access_password <> ''
  AND access_password NOT LIKE '$2%';

-- Trigger to automatically hash any new/updated plaintext password
CREATE OR REPLACE FUNCTION public.hash_project_access_password()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.access_password IS NOT NULL
     AND NEW.access_password <> ''
     AND NEW.access_password NOT LIKE '$2%' THEN
    NEW.access_password := crypt(NEW.access_password, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hash_project_access_password ON public.projects;
CREATE TRIGGER trg_hash_project_access_password
BEFORE INSERT OR UPDATE OF access_password ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.hash_project_access_password();

-- Public RPC to verify a private project password without exposing the hash
CREATE OR REPLACE FUNCTION public.verify_project_password(
  project_slug text,
  password_attempt text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT access_password INTO stored_hash
  FROM public.projects
  WHERE slug = project_slug
    AND is_published = true
    AND is_private = true
  LIMIT 1;

  IF stored_hash IS NULL OR stored_hash = '' THEN
    RETURN false;
  END IF;

  RETURN stored_hash = crypt(password_attempt, stored_hash);
END;
$$;

REVOKE ALL ON FUNCTION public.verify_project_password(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_project_password(text, text) TO anon, authenticated;

-- Restrict SELECT on access_password column even for authenticated users.
-- Admins manage passwords by writing (INSERT/UPDATE), they don't need to read them back.
REVOKE SELECT (access_password) ON public.projects FROM authenticated;
REVOKE SELECT (access_password) ON public.projects FROM anon;
-- Keep INSERT/UPDATE on the column for authenticated admins
GRANT INSERT (access_password), UPDATE (access_password) ON public.projects TO authenticated;

-- ============================================================
-- 2) Harden contact_submissions public INSERT policy
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert submissions" ON public.contact_submissions;

CREATE POLICY "Anyone can insert valid submissions"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (
  name IS NOT NULL
  AND char_length(btrim(name)) BETWEEN 1 AND 100
  AND email IS NOT NULL
  AND char_length(email) BETWEEN 5 AND 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND (message IS NULL OR char_length(message) <= 2000)
  AND (project_interest IS NULL OR char_length(project_interest) <= 200)
  AND (source IS NULL OR char_length(source) <= 50)
);