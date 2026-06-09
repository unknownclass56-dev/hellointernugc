import { useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    async function trackVisit() {
      const path = location.pathname;
      
      // Simple RPC or raw UPSERT.
      // We will do a simple select and insert/update for simplicity without needing an RPC function,
      // though RPC is recommended for atomic increments.
      
      const { data } = await supabase.from('page_visits').select('visit_count').eq('path', path).single();
      
      if (data) {
        await supabase.from('page_visits').update({
          visit_count: data.visit_count + 1,
          last_visited: new Date().toISOString()
        }).eq('path', path);
      } else {
        await supabase.from('page_visits').insert({
          path: path,
          visit_count: 1,
          last_visited: new Date().toISOString()
        });
      }
    }

    trackVisit();
  }, [location.pathname]);
}
