import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Tables } from '@/integrations/supabase/types';

type DraftAnalyticsRow = Tables<'draft_analytics'>;

export interface DraftAnalytics {
  id: string;
  draft_id: string;
  event_type: 'created' | 'updated' | 'viewed' | 'shared' | 'converted' | 'exported';
  event_data: any;
  user_id: string;
  created_at: string;
}

export function useDraftAnalytics() {
  const [analytics, setAnalytics] = useState<DraftAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const logEvent = async (
    draftId: string,
    eventType: DraftAnalytics['event_type'],
    eventData: any = {}
  ) => {
    if (!user) return;

    try {
      await supabase.rpc('log_draft_event', {
        p_draft_id: draftId,
        p_event_type: eventType,
        p_event_data: eventData,
        p_user_id: user.id
      });
    } catch (error) {
      console.error('Failed to log analytics event:', error);
    }
  };

  const getDraftAnalytics = async (draftId: string) => {
    if (!user) return [];

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('draft_analytics')
        .select('*')
        .eq('draft_id', draftId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to load analytics:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAnalyticsSummary = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('draft_analytics')
        .select('event_type, draft_id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Process analytics data
      const summary = {
        totalEvents: data.length,
        draftsCreated: data.filter(d => d.event_type === 'created').length,
        draftsShared: data.filter(d => d.event_type === 'shared').length,
        draftsConverted: data.filter(d => d.event_type === 'converted').length,
        mostActiveDay: new Date().toISOString().split('T')[0],
        recentActivity: data.slice(0, 10)
      };

      return summary;
    } catch (error) {
      console.error('Failed to load analytics summary:', error);
      return null;
    }
  };

  return {
    analytics,
    isLoading,
    logEvent,
    getDraftAnalytics,
    getUserAnalyticsSummary,
  };
}