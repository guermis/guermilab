-- Theme settings table (global portfolio theme)
CREATE TABLE public.theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'default',
  is_active BOOLEAN NOT NULL DEFAULT false,
  font_display TEXT NOT NULL DEFAULT 'Playfair Display',
  font_body TEXT NOT NULL DEFAULT 'Inter',
  color_background TEXT NOT NULL DEFAULT '0 0% 4%',
  color_foreground TEXT NOT NULL DEFAULT '40 20% 92%',
  color_primary TEXT NOT NULL DEFAULT '38 80% 55%',
  color_secondary TEXT NOT NULL DEFAULT '0 0% 12%',
  color_muted TEXT NOT NULL DEFAULT '0 0% 14%',
  color_accent TEXT NOT NULL DEFAULT '38 80% 55%',
  color_border TEXT NOT NULL DEFAULT '0 0% 16%',
  spacing_base NUMERIC NOT NULL DEFAULT 1,
  border_radius NUMERIC NOT NULL DEFAULT 0.25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project-specific theme overrides
CREATE TABLE public.project_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id TEXT NOT NULL UNIQUE,
  font_display TEXT,
  font_body TEXT,
  color_background TEXT,
  color_foreground TEXT,
  color_primary TEXT,
  color_secondary TEXT,
  color_accent TEXT,
  spacing_base NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Projects table for CMS
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  short_description TEXT,
  long_description TEXT,
  tags TEXT[] DEFAULT '{}',
  year TEXT,
  category TEXT,
  thumbnail_url TEXT,
  hero_image_url TEXT,
  main_video_url TEXT,
  context TEXT,
  execution TEXT,
  result TEXT,
  client_name TEXT,
  role_title TEXT,
  duration TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Content blocks for projects
CREATE TABLE public.content_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL CHECK (block_type IN ('text', 'image', 'video', 'quote')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  heading TEXT,
  body TEXT,
  src TEXT,
  alt TEXT,
  caption TEXT,
  quote_text TEXT,
  quote_author TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_blocks_project ON public.content_blocks(project_id);
CREATE INDEX idx_projects_slug ON public.projects(slug);

-- Enable RLS
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_blocks ENABLE ROW LEVEL SECURITY;

-- Public read for all (portfolio is public)
CREATE POLICY "Public read theme_settings" ON public.theme_settings FOR SELECT USING (true);
CREATE POLICY "Public read project_themes" ON public.project_themes FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Public read content_blocks" ON public.content_blocks FOR SELECT USING (true);

-- Authenticated users can manage (admin)
CREATE POLICY "Auth manage theme_settings" ON public.theme_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage project_themes" ON public.project_themes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Auth manage content_blocks" ON public.content_blocks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_theme_settings_updated_at BEFORE UPDATE ON public.theme_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_themes_updated_at BEFORE UPDATE ON public.project_themes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_blocks_updated_at BEFORE UPDATE ON public.content_blocks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default theme
INSERT INTO public.theme_settings (name, is_active, font_display, font_body, color_background, color_foreground, color_primary, color_secondary, color_muted, color_accent, color_border)
VALUES ('Cinematográfico', true, 'Playfair Display', 'Inter', '0 0% 4%', '40 20% 92%', '38 80% 55%', '0 0% 12%', '0 0% 14%', '38 80% 55%', '0 0% 16%');