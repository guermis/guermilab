
-- Hero images table
CREATE TABLE public.hero_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hero_images" ON public.hero_images FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage hero_images" ON public.hero_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Videos vertical table
CREATE TABLE public.videos_vertical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client text,
  duration text,
  video_url text,
  thumbnail_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.videos_vertical ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read videos_vertical" ON public.videos_vertical FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage videos_vertical" ON public.videos_vertical FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Videos horizontal table
CREATE TABLE public.videos_horizontal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  client text,
  duration text,
  video_url text,
  thumbnail_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.videos_horizontal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read videos_horizontal" ON public.videos_horizontal FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage videos_horizontal" ON public.videos_horizontal FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Photography albums table
CREATE TABLE public.photography_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  cover_image_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.photography_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read photography_albums" ON public.photography_albums FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage photography_albums" ON public.photography_albums FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Photography photos table
CREATE TABLE public.photography_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid NOT NULL REFERENCES public.photography_albums(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.photography_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read photography_photos" ON public.photography_photos FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage photography_photos" ON public.photography_photos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- About content table
CREATE TABLE public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Sobre',
  description text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read about_content" ON public.about_content FOR SELECT TO public USING (true);
CREATE POLICY "Auth manage about_content" ON public.about_content FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert default about content
INSERT INTO public.about_content (title, description) VALUES (
  'Guermi Lab',
  'Produtora audiovisual especializada em conteúdo premium para marcas e artistas. Combinamos storytelling cinematográfico com tecnologia de ponta para criar experiências visuais memoráveis.'
);
