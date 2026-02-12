import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UpcomingEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  event_type: string;
  color: string;
  created_by: string;
}

export function useUpcomingEvents(days: number = 7) {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const future = new Date();
        future.setDate(future.getDate() + days);

        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .gte('start_time', now.toISOString())
          .lte('start_time', future.toISOString())
          .order('start_time', { ascending: true })
          .limit(10);

        if (error) throw error;

        setEvents(data || []);
      } catch (e) {
        console.error('Error fetching upcoming events:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, [days]);

  return { events, loading };
}
