import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useBackendWaitlist, useBackendWaitlistStats } from '@/hooks/use-backend-waitlist';

interface WaitlistEntry {
  id: string;
  email: string;
  reason?: string;
  source?: string;
  created_at: string;
}

interface WaitlistStats {
  totalEntries: number;
  todayEntries: number;
  sourceBreakdown: Record<string, number>;
}

export const useAdminWaitlist = () => {
  return useBackendWaitlist();
};

export const useWaitlistStats = () => {
  return useBackendWaitlistStats();
};