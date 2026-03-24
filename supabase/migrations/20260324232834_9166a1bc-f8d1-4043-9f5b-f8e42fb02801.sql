
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_private boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS access_password text,
  ADD COLUMN IF NOT EXISTS director_notes jsonb DEFAULT '[]'::jsonb;
