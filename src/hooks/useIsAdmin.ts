import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns whether the currently-authenticated user has the `admin` role.
 * Re-checks on auth state changes.
 */
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (active) { setIsAdmin(false); setLoading(false); }
        return;
      }
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      if (active) {
        setIsAdmin(!!data && !error);
        setLoading(false);
      }
    };

    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setLoading(true);
      check();
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);

  return { isAdmin, loading };
}
