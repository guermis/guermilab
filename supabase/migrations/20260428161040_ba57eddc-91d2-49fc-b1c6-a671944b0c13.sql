
-- Singleton profile table
CREATE TABLE public.links_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_url TEXT,
  name TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.links_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "links_profile public read"
  ON public.links_profile FOR SELECT
  USING (true);

CREATE POLICY "links_profile admin insert"
  ON public.links_profile FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "links_profile admin update"
  ON public.links_profile FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "links_profile admin delete"
  ON public.links_profile FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_links_profile_updated
  BEFORE UPDATE ON public.links_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Buttons table
CREATE TABLE public.links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "links public read"
  ON public.links FOR SELECT
  USING (true);

CREATE POLICY "links admin insert"
  ON public.links FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "links admin update"
  ON public.links FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "links admin delete"
  ON public.links FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_links_updated
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_links_sort ON public.links(sort_order);
