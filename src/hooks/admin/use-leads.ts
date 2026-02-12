import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Lead, LeadFilters, CreateLeadForm, CreateActivityForm, DuplicateCheckResult, LeadStage } from '@/types/crm-types';
import { LEAD_STAGE_INFO } from '@/types/crm-types';
import { 
  useBackendLeads, 
  useBackendLead, 
  useBackendCreateLead, 
  useBackendUpdateLeadStatus, 
  useBackendAssignLead 
} from '@/hooks/use-backend-leads';

// Fetch all leads with filtering and follow-up priority
export function useLeads(filters: LeadFilters, options?: { enabled?: boolean }) {
  return useBackendLeads(filters, options);
}

// Fetch single lead with activities
export function useLead(leadId: string) {
  return useBackendLead(leadId);
}

// Check for duplicate leads/users (simplified for backend)
export function useCheckDuplicates() {
  return useMutation({
    mutationFn: async (params: { email: string; company_domain?: string }): Promise<DuplicateCheckResult[]> => {
      // For now, return empty array since backend doesn't have duplicate check endpoint
      // This can be implemented later if needed
      return [];
    },
  });
}

// Create new lead
export function useCreateLead() {
  return useBackendCreateLead();
}

// Update lead (using assign for now since general update not available in backend)
export function useUpdateLead() {
  const assignLead = useBackendAssignLead();
  
  return {
    ...assignLead,
    mutateAsync: async (params: { leadId: string; updates: Partial<Lead> }) => {
      // For now, only handle assignment updates
      if (params.updates.assigned_admin_users) {
        return assignLead.mutateAsync({
          leadId: params.leadId,
          assignedAdminUsers: params.updates.assigned_admin_users
        });
      }
      throw new Error('Only assignment updates are supported via backend API');
    }
  };
}

// Update lead stage
export function useUpdateLeadStage() {
  const updateStatus = useBackendUpdateLeadStatus();
  
  return {
    ...updateStatus,
    mutateAsync: async (params: { leadId: string; stage: LeadStage }) => {
      return updateStatus.mutateAsync(params);
    }
  };
}

// Create lead activity (simplified for backend)
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityData: CreateActivityForm) => {
      // Activities not implemented in backend yet
      // Return mock data for now
      return {
        id: Date.now().toString(),
        ...activityData,
        created_at: new Date().toISOString()
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backend-lead'] });
      toast.success('Activity logged successfully');
    },
    onError: (error) => {
      console.error('Error creating activity:', error);
      toast.error('Failed to log activity');
    },
  });
}

// Delete lead (not implemented in backend yet)
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadId: string) => {
      // Delete not implemented in backend yet
      throw new Error('Delete functionality not available yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backend-leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    },
  });
}

// Get lead pipeline stats
export function useLeadPipelineStats(enabled: boolean = true) {
  const { data: leads = [] } = useBackendLeads({
    searchQuery: '',
    leadType: 'all',
    leadStage: 'all',
    assignedTo: 'all',
    priorityLevel: 'all',
    source: 'all'
  }, {
    enabled // Only fetch leads when stats are enabled
  });

  return useQuery({
    queryKey: ['backend-lead-pipeline-stats', leads.length],
    queryFn: async () => {
      const activeLeads = leads.filter(lead => !['won', 'lost'].includes(lead.lead_stage));
      
      const stats = {
        new: { count: 0, value: 0 },
        contacted: { count: 0, value: 0 },
        interested: { count: 0, value: 0 },
        not_interested: { count: 0, value: 0 },
        follow_up_needed: { count: 0, value: 0 },
      };

      activeLeads.forEach(lead => {
        if (stats[lead.lead_stage]) {
          stats[lead.lead_stage].count += 1;
          stats[lead.lead_stage].value += lead.estimated_value || 0;
        }
      });

      return stats;
    },
    enabled: enabled && leads.length >= 0,
    staleTime: 60_000,
  });
}