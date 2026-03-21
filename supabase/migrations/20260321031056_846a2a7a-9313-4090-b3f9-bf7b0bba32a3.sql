-- Analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('click', 'view', 'scroll_depth', 'time_spent')),
  project_slug TEXT,
  page_path TEXT NOT NULL,
  value NUMERIC,
  metadata JSONB DEFAULT '{}',
  session_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_project ON public.analytics_events(project_slug);
CREATE INDEX idx_analytics_events_created ON public.analytics_events(created_at);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Public insert (anonymous tracking)
CREATE POLICY "Anyone can insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
-- Only authenticated users can read analytics
CREATE POLICY "Auth read analytics" ON public.analytics_events FOR SELECT TO authenticated USING (true);

-- AI suggestions table (for auto-tags and thumbnail suggestions)
CREATE TABLE public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('tags', 'thumbnail', 'description')),
  suggestion_data JSONB NOT NULL DEFAULT '{}',
  is_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_suggestions_project ON public.ai_suggestions(project_id);

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Auth manage ai_suggestions" ON public.ai_suggestions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public read ai_suggestions" ON public.ai_suggestions FOR SELECT USING (true);