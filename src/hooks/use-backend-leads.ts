import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import leadsService from '@/services/api/admin/leads.Service';
import type { Lead, LeadFilters, CreateLeadForm, LeadStage } from '@/types/crm-types';
import { LEAD_STAGE_INFO } from '@/types/crm-types';

// Backend API interfaces
interface BackendLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  leadType: 'vendor' | 'event_host';
  leadStatus: 'new' | 'contacted' | 'interested' | 'not_interested' | 'follow_up' | 'won' | 'lost';
  priorityLevel: 'high' | 'medium_high' | 'medium' | 'medium_low' | 'low';
  estimatedValue?: number;
  expectedClose?: string;
  source?: string;
  note?: string;
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BackendLeadsResponse {
  status: number;
  response: string;
  message: string;
  data: BackendLead[];
}

interface BackendLeadResponse {
  status: number;
  response: string;
  message: string;
  data: BackendLead;
}

interface CreateLeadRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  jobTitle?: string;
  leadType: 'vendor' | 'event_host';
  priorityLevel: 'high' | 'medium_high' | 'medium' | 'medium_low' | 'low';
  estimatedValue?: number;
  expectedClose?: string;
  source?: string;
  note?: string;
  leadStatus: 'new' | 'contacted' | 'interested' | 'not_interested' | 'follow_up' | 'won' | 'lost';
  assignTo?: string;
}

interface UpdateLeadStatusRequest {
  leadStatus: 'new' | 'contacted' | 'interested' | 'not_interested' | 'follow_up' | 'won' | 'lost';
}

interface AssignLeadRequest {
  userId: string;
}

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

// Map frontend stage to backend status
const mapFrontendStageToBackendStatus = (frontendStage: LeadStage): string => {
  const stageMap: Record<LeadStage, string> = {
    'new': 'new',
    'contacted': 'contacted',
    'interested': 'interested', 
    'not_interested': 'not_interested',
    'follow_up_needed': 'follow_up',
    'won': 'won',
    'lost': 'lost'
  };
  return stageMap[frontendStage] || 'new';
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

// Map frontend priority to backend priority
const mapFrontendPriorityToBackend = (frontendPriority: number): string => {
  const priorityMap: Record<number, string> = {
    1: 'high',
    2: 'medium_high', 
    3: 'medium',
    4: 'medium_low',
    5: 'low'
  };
  return priorityMap[frontendPriority] || 'medium';
};

// Transform backend lead to frontend format
const transformBackendLead = (backendLead: BackendLead): Lead => {
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
};

// Transform frontend create form to backend format
const transformCreateLeadForm = (formData: CreateLeadForm): CreateLeadRequest => {
  const assignedUsers = Array.isArray(formData.assigned_admin_users) 
    ? formData.assigned_admin_users.filter(id => !!id)
    : [];
    
  return {
    firstName: formData.first_name || 'Unknown',
    lastName: formData.last_name || 'Lead',
    email: formData.email,
    phone: formData.phone || 'N/A',
    company: formData.company_name || undefined,
    jobTitle: formData.job_title || undefined,
    leadType: formData.lead_type,
    priorityLevel: mapFrontendPriorityToBackend(formData.priority_level),
    estimatedValue: formData.estimated_value || undefined,
    expectedClose: formData.expected_close_date || undefined,
    source: formData.source || undefined,
    note: formData.notes || undefined,
    leadStatus: 'new',
    assignTo: assignedUsers.length > 0 ? assignedUsers[0] : undefined
  };
};

// Fetch all leads
export const useBackendLeads = (filters: LeadFilters, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['backend-leads', JSON.stringify(filters)],
    queryFn: async (): Promise<Lead[]> => {
      const response = await leadsService.getLeads(filters);

      // Handle nested response structure - API may return { data: { data: [...] } } or { data: [...] }
      const leadsData = response?.data?.data || response?.data || response || [];
      let leads = (Array.isArray(leadsData) ? leadsData : []).map(transformBackendLead);
      
      // Apply client-side filtering (since backend doesn't support all filters yet)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        leads = leads.filter(lead => 
          lead.email.toLowerCase().includes(query) ||
          (lead.first_name && lead.first_name.toLowerCase().includes(query)) ||
          (lead.last_name && lead.last_name.toLowerCase().includes(query)) ||
          (lead.company_name && lead.company_name.toLowerCase().includes(query))
        );
      }
      
      if (filters.leadType !== 'all') {
        leads = leads.filter(lead => lead.lead_type === filters.leadType);
      }
      
      if (filters.leadStage !== 'all') {
        leads = leads.filter(lead => lead.lead_stage === filters.leadStage);
      }
      
      if (filters.priorityLevel !== 'all') {
        leads = leads.filter(lead => lead.priority_level === filters.priorityLevel);
      }
      
      if (filters.source !== 'all') {
        leads = leads.filter(lead => lead.source === filters.source);
      }
      
      if (filters.assignedTo === 'unassigned') {
        leads = leads.filter(lead => !lead.assigned_admin_users || lead.assigned_admin_users.length === 0);
      } else if (filters.assignedTo !== 'all') {
        leads = leads.filter(lead => 
          lead.assigned_admin_users && lead.assigned_admin_users.includes(filters.assignedTo)
        );
      }
      
      // Sort by creation date (newest first)
      return leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    staleTime: 300_000, // 5 minutes
    gcTime: 600_000, // 10 minutes
    enabled: options?.enabled !== false, // Default to true if not specified
  });
};

// Fetch single lead
export const useBackendLead = (leadId: string) => {
  return useQuery({
    queryKey: ['backend-lead', leadId],
    queryFn: async () => {
      const response = await leadsService.getLeadById(leadId);

      // Handle nested response structure
      const leadData = response?.data?.data || response?.data || response;
      const lead = transformBackendLead(leadData);
      
      return {
        lead,
        activities: [] // Activities not implemented in backend yet
      };
    },
    enabled: !!leadId,
  });
};

// Create new lead
export const useBackendCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leadData: CreateLeadForm): Promise<Lead> => {
      const requestData = transformCreateLeadForm(leadData);
      const response = await leadsService.createLead(requestData);
      return transformBackendLead(response.data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backend-leads'] });
      queryClient.invalidateQueries({ queryKey: ['backend-unified-entities'] });
      queryClient.invalidateQueries({ queryKey: ['backend-entity-counts'] });
      toast.success(`Lead created: ${data.email}`);
    },
    onError: (error: any) => {
      console.error('[Backend Create Lead] Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create lead';
      toast.error(errorMessage);
    },
  });
};

// Update lead status
export const useBackendUpdateLeadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { leadId: string; stage: LeadStage }) => {
      const requestData: UpdateLeadStatusRequest = {
        leadStatus: mapFrontendStageToBackendStatus(params.stage)
      };
      
      const response = await leadsService.updateLeadStatus(params.leadId, requestData);
      return transformBackendLead(response.data);
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['backend-leads'] });
      await queryClient.cancelQueries({ queryKey: ['backend-unified-entities'] });
      
      // Optimistically update leads list
      queryClient.setQueriesData({ queryKey: ['backend-leads'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((lead: any) => 
          lead.id === params.leadId 
            ? { ...lead, lead_stage: params.stage, stage_info: LEAD_STAGE_INFO[params.stage] }
            : lead
        );
      });
      
      // Optimistically update unified entities
      queryClient.setQueriesData({ queryKey: ['backend-unified-entities'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((entity: any) => 
          entity.type === 'lead' && entity.id === params.leadId
            ? { ...entity, lead_stage: params.stage }
            : entity
        );
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backend-leads'] });
      queryClient.invalidateQueries({ queryKey: ['backend-unified-entities'] });
      queryClient.invalidateQueries({ queryKey: ['backend-lead', data.id] });
      toast.success('Lead status updated successfully');
    },
    onError: (error: any) => {
      console.error('[Backend Update Lead Status] Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update lead status';
      toast.error(errorMessage);
    },
  });
};

// Assign lead to admin users
export const useBackendAssignLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { leadId: string; assignedAdminUsers: string[] }) => {
      if (params.assignedAdminUsers.length === 0) {
        throw new Error('At least one user must be assigned');
      }
      
      const requestData: AssignLeadRequest = {
        userId: params.assignedAdminUsers[0] // Backend only supports single assignment
      };
      
      const response = await leadsService.assignLead(params.leadId, requestData);
      return transformBackendLead(response.data);
    },
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['backend-leads'] });
      await queryClient.cancelQueries({ queryKey: ['backend-unified-entities'] });
      
      // Optimistically update leads list
      queryClient.setQueriesData({ queryKey: ['backend-leads'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((lead: any) => 
          lead.id === params.leadId 
            ? { ...lead, assigned_admin_users: params.assignedAdminUsers }
            : lead
        );
      });
      
      // Optimistically update unified entities
      queryClient.setQueriesData({ queryKey: ['backend-unified-entities'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((entity: any) => 
          entity.type === 'lead' && entity.id === params.leadId
            ? { ...entity, assigned_admin_users: params.assignedAdminUsers }
            : entity
        );
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['backend-leads'] });
      queryClient.invalidateQueries({ queryKey: ['backend-unified-entities'] });
      queryClient.invalidateQueries({ queryKey: ['backend-lead', data.id] });
      toast.success('Lead assignment updated successfully');
    },
    onError: (error: any) => {
      console.error('[Backend Assign Lead] Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to assign lead';
      toast.error(errorMessage);
    },
  });
};