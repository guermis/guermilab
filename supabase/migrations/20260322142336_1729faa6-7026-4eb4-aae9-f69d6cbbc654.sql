
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  project_interest text,
  message text,
  source text DEFAULT 'form',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert submissions" ON public.contact_submissions
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Auth read submissions" ON public.contact_submissions
  FOR SELECT TO authenticated USING (true);
