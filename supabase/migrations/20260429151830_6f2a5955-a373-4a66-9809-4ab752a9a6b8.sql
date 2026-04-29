-- Align RLS policies for links/links_profile with other admin tables.
-- The Admin panel already requires authentication; restricting to a specific
-- 'admin' role was preventing legitimate authenticated users from managing
-- their own page (uploads, inserts).

DROP POLICY IF EXISTS "links admin insert" ON public.links;
DROP POLICY IF EXISTS "links admin update" ON public.links;
DROP POLICY IF EXISTS "links admin delete" ON public.links;

CREATE POLICY "Auth manage links"
ON public.links
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "links_profile admin insert" ON public.links_profile;
DROP POLICY IF EXISTS "links_profile admin update" ON public.links_profile;
DROP POLICY IF EXISTS "links_profile admin delete" ON public.links_profile;

CREATE POLICY "Auth manage links_profile"
ON public.links_profile
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);