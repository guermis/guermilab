import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

function getSessionId(): string {
  let id = sessionStorage.getItem('analytics_session');
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('analytics_session', id);
  }
  return id;
}

export function useAnalytics(projectSlug?: string) {
  const sessionId = useRef(getSessionId());
  const startTime = useRef(Date.now());
  const maxScroll = useRef(0);
  const tracked = useRef(false);

  const trackEvent = useCallback(async (
    eventType: 'click' | 'view' | 'scroll_depth' | 'time_spent',
    value?: number,
    metadata?: Record<string, unknown>
  ) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        project_slug: projectSlug || null,
        page_path: window.location.pathname,
        value: value || null,
        metadata: metadata || {},
        session_id: sessionId.current,
      });
    } catch {
      // Silent fail for analytics
    }
  }, [projectSlug]);

  // Track page view
  useEffect(() => {
    if (!tracked.current) {
      trackEvent('view');
      tracked.current = true;
    }
  }, [trackEvent]);

  // Track scroll depth
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const depth = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      if (depth > maxScroll.current) {
        maxScroll.current = depth;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track time spent on unmount
  useEffect(() => {
    return () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000);
      if (timeSpent > 2) {
        // Use sendBeacon for reliability on page unload
        const payload = {
          event_type: 'time_spent',
          project_slug: projectSlug || null,
          page_path: window.location.pathname,
          value: timeSpent,
          metadata: { scroll_depth: maxScroll.current },
          session_id: sessionId.current,
        };

        // Fire and forget
        navigator.sendBeacon?.(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/analytics_events`,
          new Blob([JSON.stringify(payload)], { type: 'application/json' })
        );

        // Also track scroll depth
        if (maxScroll.current > 0) {
          trackEvent('scroll_depth', maxScroll.current);
        }
      }
    };
  }, [projectSlug, trackEvent]);

  const trackClick = useCallback((element?: string) => {
    trackEvent('click', undefined, { element });
  }, [trackEvent]);

  return { trackClick, trackEvent };
}
