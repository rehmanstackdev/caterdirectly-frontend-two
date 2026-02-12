import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import waitlistService from '@/services/api/admin/waitlist.Service';

interface BackendWaitlistEntry {
  id: string;
  email: string;
  reason?: string;
  cardBetaType: string;
  createdAt: string;
  updatedAt: string;
}

interface BackendWaitlistResponse {
  status: number;
  response: string;
  message: string;
  data: BackendWaitlistEntry[];
}

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

// Transform backend waitlist entry to frontend format
const transformWaitlistEntry = (backendEntry: BackendWaitlistEntry): WaitlistEntry => ({
  id: backendEntry.id,
  email: backendEntry.email,
  reason: backendEntry.reason || undefined,
  source: backendEntry.cardBetaType || 'Beta Card',
  created_at: backendEntry.createdAt
});

export const useBackendWaitlist = () => {
  return useQuery({
    queryKey: ['backend-waitlist'],
    queryFn: async (): Promise<WaitlistEntry[]> => {
      const response = await waitlistService.getWaitlistEntries();
      return (response.data || []).map(transformWaitlistEntry);
    },
    staleTime: 300_000, // 5 minutes
    gcTime: 600_000, // 10 minutes
  });
};

export const useBackendWaitlistStats = () => {
  const { data: waitlistEntries = [] } = useBackendWaitlist();

  return useQuery({
    queryKey: ['backend-waitlist-stats', waitlistEntries.length],
    queryFn: async (): Promise<WaitlistStats> => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayEntries = waitlistEntries.filter(entry => 
        new Date(entry.created_at) >= today
      ).length;

      const sourceBreakdown = waitlistEntries.reduce((acc, entry) => {
        const source = entry.source || 'unknown';
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalEntries: waitlistEntries.length,
        todayEntries,
        sourceBreakdown
      };
    },
    enabled: waitlistEntries.length >= 0,
    staleTime: 300_000, // 5 minutes
  });
};

export const useDeleteWaitlistEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await waitlistService.deleteWaitlistEntry(id);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['backend-waitlist'] });
      toast.success(result.message || 'Waitlist entry deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to delete waitlist entry';
      toast.error(errorMessage);
    },
  });
};

interface CreateWaitlistEntryData {
  email: string;
  reason?: string;
  cardBetaType?: string;
}

export const useCreateWaitlistEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWaitlistEntryData) => {
      const result = await waitlistService.createWaitlistEntry(data);
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['backend-waitlist'] });
      toast.success(result.message || 'Added to waitlist successfully');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to join waitlist';
      throw new Error(errorMessage);
    },
  });
};