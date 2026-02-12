import { useQuery } from '@tanstack/react-query';
import leadsService from '@/services/api/admin/leads.Service';
import dashboardService from '@/services/api/admin/dashboard.Service';
import type { UnifiedEntity, UnifiedFilters, LeadStage } from '@/types/crm-types';
import { LEAD_STAGE_INFO } from '@/types/crm-types';

// Map backend status to frontend stage
const mapBackendStatusToFrontendStage = (backendStatus: string): LeadStage => {
  const statusMap: Record<string, LeadStage> = {
    'new': 'new',
    'contacted': 'contacted',
    'interested': 'interested',
    'not_interested': 'not_interested',
    'follow_up': 'follow_up_needed',
    'won': 'won',
    'lost': 'lost'
  };
  return statusMap[backendStatus] || 'new';
};

// Map backend priority to frontend priority
const mapBackendPriorityToFrontend = (backendPriority: string): number => {
  const priorityMap: Record<string, number> = {
    'high': 1,
    'medium_high': 2,
    'medium': 3,
    'medium_low': 4,
    'low': 5
  };
  return priorityMap[backendPriority] || 3;
};

export const useBackendUnifiedEntities = (filters: UnifiedFilters) => {
  return useQuery({
    queryKey: ['backend-unified-entities', filters.leadType, filters.status, filters.searchQuery],
    queryFn: async (): Promise<UnifiedEntity[]> => {
      // Fetch leads only
      const leadsResponse = await leadsService.getLeads(filters);
      const leadsData = leadsResponse?.data?.data || leadsResponse?.data || leadsResponse || [];
      let leads = (Array.isArray(leadsData) ? leadsData : []).map((backendLead: any) => {
        const leadStage = mapBackendStatusToFrontendStage(backendLead.leadStatus);
        const fullName = [backendLead.firstName, backendLead.lastName].filter(Boolean).join(' ');

        return {
          id: backendLead.id,
          name: fullName || backendLead.email,
          email: backendLead.email,
          first_name: backendLead.firstName || null,
          last_name: backendLead.lastName || null,
          company_name: backendLead.company || null,
          phone: backendLead.phone || null,
          job_title: backendLead.jobTitle || null,
          lead_type: backendLead.leadType,
          lead_stage: leadStage,
          priority_level: mapBackendPriorityToFrontend(backendLead.priorityLevel),
          estimated_value: backendLead.estimatedValue || 0,
          expected_close_date: backendLead.expectedClose || null,
          source: backendLead.source || null,
          notes: backendLead.note || null,
          assigned_admin_users: backendLead.assignedTo ? [backendLead.assignedTo.id] : [],
          affiliate_id: null,
          created_by: null,
          created_at: backendLead.createdAt,
          updated_at: backendLead.updatedAt,
          updated_by: null,
          utm_parameters: {},
          event_types: [],
          full_name: fullName || backendLead.email,
          stage_info: LEAD_STAGE_INFO[leadStage],
          next_followup: null,
          has_upcoming_followup: false
        };
      });

      // Apply search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        leads = leads.filter(lead =>
          lead.email.toLowerCase().includes(query) ||
          (lead.first_name && lead.first_name.toLowerCase().includes(query)) ||
          (lead.last_name && lead.last_name.toLowerCase().includes(query)) ||
          (lead.company_name && lead.company_name.toLowerCase().includes(query))
        );
      }

      // Apply filters and transform to entities
      const leadEntities = leads
        .filter(lead => {
          // Apply lead type filter
          if (filters.leadType && filters.leadType !== 'all' && lead.lead_type !== filters.leadType) {
            return false;
          }
          // Apply status filter
          if (filters.status === 'converted') return lead.lead_stage === 'won';
          if (filters.status === 'active') return !['won', 'lost'].includes(lead.lead_stage);
          if (filters.status === 'archived') return lead.lead_stage === 'lost';
          return true;
        })
        .map(lead => ({
          id: lead.id,
          type: 'lead' as const,
          email: lead.email,
          first_name: lead.first_name,
          last_name: lead.last_name,
          company_name: lead.company_name,
          user_type: null,
          lead_type: lead.lead_type,
          lead_stage: lead.lead_stage,
          assigned_admin_users: lead.assigned_admin_users,
          roles: [],
          created_at: lead.created_at,
          updated_at: lead.updated_at,
          full_name: lead.full_name,
          entity_label: `${lead.lead_type} Lead`
        }));

      // Sort by created_at descending
      return leadEntities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    staleTime: 300_000, // 5 minutes
    gcTime: 600_000, // 10 minutes
  });
};

export const useBackendEntityCounts = () => {
  return useQuery({
    queryKey: ['backend-entity-counts'],
    queryFn: async () => {
      // Fetch dashboard stats and leads
      const [dashboardStatsResponse, leadsResponse] = await Promise.all([
        dashboardService.getDashboardStats(),
        leadsService.getLeads({})
      ]);

      // Handle response structure
      const dashboardStats = dashboardStatsResponse?.data?.data || dashboardStatsResponse?.data || dashboardStatsResponse;
      const leadsData = leadsResponse?.data?.data || leadsResponse?.data || leadsResponse || [];
      const leads = Array.isArray(leadsData) ? leadsData : [];

      // Calculate lead counts
      const activeLeads = leads.filter((l: any) => !['won', 'lost'].includes(mapBackendStatusToFrontendStage(l.leadStatus))).length;

      const leadCounts = {
        total: dashboardStats.totalLeads || leads.length,
        vendor: leads.filter((l: any) => l.leadType === 'vendor').length,
        event_host: leads.filter((l: any) => l.leadType === 'event_host').length,
        active: activeLeads,
        converted: leads.filter((l: any) => mapBackendStatusToFrontendStage(l.leadStatus) === 'won').length,
      };

      // Get user counts from dashboard stats API
      const userCounts = {
        total: dashboardStats.totalUsers || 0,
        admin: dashboardStats.totalAdmins || 0,
        vendor: dashboardStats.totalVendors || 0,
        event_host: dashboardStats.totalHosts || 0,
      };

      return {
        leads: leadCounts,
        users: userCounts
      };
    },
    staleTime: 300_000, // 5 minutes
    gcTime: 600_000, // 10 minutes
  });
};
