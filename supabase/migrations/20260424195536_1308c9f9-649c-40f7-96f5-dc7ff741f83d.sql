ALTER TABLE public.hero_images
  ADD COLUMN IF NOT EXISTS video_url text;

-- Make image_url nullable now that hero is video-driven
ALTER TABLE public.hero_images
  ALTER COLUMN image_url DROP NOT NULL;