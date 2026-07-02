import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    async function trackVisit() {
      try {
        const path = location.pathname;
        
        // Use upsert for atomic increment - silently fails if table doesn't exist yet
        const { data, error } = await supabase
          .from('page_visits')
          .select('visit_count')
          .eq('path', path)
          .maybeSingle(); // maybeSingle returns null (not error) when no row found

        if (error) return; // Table doesn't exist yet, silently ignore

        if (data) {
          await supabase.from('page_visits').update({
            visit_count: (data.visit_count || 0) + 1,
            last_visited_at: new Date().toISOString()
          }).eq('path', path);
        } else {
          await supabase.from('page_visits').insert({
            path,
            visit_count: 1,
            last_visited_at: new Date().toISOString()
          });
        }
      } catch {
        // Silently ignore — tracking should never break the app
      }
    }

    trackVisit();
  }, [location.pathname]);
}

