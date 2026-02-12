import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  event_type: 'order' | 'proposal' | 'meeting' | 'reminder' | 'custom';
  visibility: 'all_admins' | 'private' | 'specific_admins';
  visible_to_admins?: string[];
  source_type?: 'order' | 'proposal' | 'manual';
  source_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  color: string;
  is_auto_created: boolean;
  metadata?: any;
}

export function useCalendarEvents(startDate?: Date, endDate?: Date) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('calendar_events').select('*').order('start_time', { ascending: true });

      if (startDate) {
        query = query.gte('start_time', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('start_time', endDate.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setEvents((data || []) as CalendarEvent[]);
    } catch (e: any) {
      console.error('Error fetching calendar events:', e);
      setError(e.message || 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [startDate, endDate]);

  const createEvent = async (eventData: Partial<CalendarEvent>) => {
    try {
      // Validate required fields
      if (!eventData.created_by) {
        throw new Error('User authentication required to create events');
      }
      
      if (!eventData.title || !eventData.start_time || !eventData.end_time) {
        throw new Error('Title, start time, and end time are required');
      }

      const { data, error: createError } = await supabase
        .from('calendar_events')
        .insert([{
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          event_type: eventData.event_type,
          visibility: eventData.visibility || 'all_admins',
          visible_to_admins: eventData.visible_to_admins,
          source_type: eventData.source_type,
          source_id: eventData.source_id,
          created_by: eventData.created_by,
          color: eventData.color || '#3B82F6',
          metadata: eventData.metadata,
        }])
        .select()
        .single();

      if (createError) throw createError;

      toast({
        title: 'Event Created',
        description: 'Calendar event has been created successfully.',
      });

      await fetchEvents();
      return data;
    } catch (e: any) {
      console.error('Error creating calendar event:', e);
      toast({
        title: 'Error',
        description: e.message || 'Failed to create calendar event',
        variant: 'destructive',
      });
      throw e;
    }
  };

  const updateEvent = async (id: string, eventData: Partial<CalendarEvent>) => {
    try {
      const { error: updateError } = await supabase
        .from('calendar_events')
        .update(eventData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Event Updated',
        description: 'Calendar event has been updated successfully.',
      });

      await fetchEvents();
    } catch (e: any) {
      console.error('Error updating calendar event:', e);
      toast({
        title: 'Error',
        description: e.message || 'Failed to update calendar event',
        variant: 'destructive',
      });
      throw e;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from('calendar_events').delete().eq('id', id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Event Deleted',
        description: 'Calendar event has been deleted successfully.',
      });

      await fetchEvents();
    } catch (e: any) {
      console.error('Error deleting calendar event:', e);
      toast({
        title: 'Error',
        description: e.message || 'Failed to delete calendar event',
        variant: 'destructive',
      });
      throw e;
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refresh: fetchEvents,
  };
}
