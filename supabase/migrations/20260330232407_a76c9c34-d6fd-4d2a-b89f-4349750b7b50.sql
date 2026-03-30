
CREATE TABLE public.about_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon text NOT NULL DEFAULT 'Film',
  label text NOT NULL,
  value text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.about_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read about_stats" ON public.about_stats FOR SELECT TO public USING (true);
CREATE POLICY "Anon manage about_stats" ON public.about_stats FOR ALL TO anon USING (true) WITH CHECK (true);

-- Seed default stats
INSERT INTO public.about_stats (icon, label, value, sort_order) VALUES
  ('Film', 'Projetos', '40+', 0),
  ('Camera', 'Anos de Experiência', '12', 1),
  ('Award', 'Prêmios', '8', 2);
