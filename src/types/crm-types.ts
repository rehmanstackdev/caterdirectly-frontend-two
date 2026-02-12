import type { UserRole } from '@/types/supabase-types';

// Database types (stubbed)
export type LeadRow = any;
export type LeadActivityRow = any;
export type LeadAssignmentRow = any;
export type AffiliateRow = any;
export type AdminPermissionRow = any;

// Enums
export type LeadStage = 'new' | 'contacted' | 'interested' | 'not_interested' | 'follow_up_needed' | 'won' | 'lost';
export type LeadType = 'vendor' | 'event_host' | 'catering_vendor' | 'venue_vendor' | 'party_rental_vendor' | 'staffing_vendor';
export type AdminPermissionCategory = 'sales' | 'operations' | 'accounting' | 'support' | 'system';

// Stage descriptions
export interface LeadStageInfo {
  stage: LeadStage;
  displayName: string;
  description: string;
  color: string;
}

export const LEAD_STAGE_INFO: Record<LeadStage, LeadStageInfo> = {
  new: {
    stage: 'new',
    displayName: 'New Lead',
    description: 'Fresh lead that needs initial contact',
    color: 'bg-blue-100 text-blue-800'
  },
  contacted: {
    stage: 'contacted',
    displayName: 'Contacted',
    description: 'Initial contact has been made',
    color: 'bg-yellow-100 text-yellow-800'
  },
  interested: {
    stage: 'interested',
    displayName: 'Interested',
    description: 'Lead has shown interest in our services',
    color: 'bg-green-100 text-green-800'
  },
  not_interested: {
    stage: 'not_interested',
    displayName: 'Not Interested',
    description: 'Lead is not interested at this time',
    color: 'bg-gray-100 text-gray-800'
  },
  follow_up_needed: {
    stage: 'follow_up_needed',
    displayName: 'Follow Up Needed',
    description: 'Lead requires follow-up contact',
    color: 'bg-orange-100 text-orange-800'
  },
  won: {
    stage: 'won',
    displayName: 'Won',
    description: 'Lead has converted to a customer',
    color: 'bg-emerald-100 text-emerald-800'
  },
  lost: {
    stage: 'lost',
    displayName: 'Lost',
    description: 'Lead will not convert',
    color: 'bg-red-100 text-red-800'
  }
};

// Enhanced lead interface with computed properties
export interface Lead {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  company_domain?: string | null;
  phone?: string | null;
  job_title?: string | null;
  lead_type: LeadType;
  lead_stage: LeadStage;
  priority_level: number;
  estimated_value: number;
  expected_close_date?: string | null;
  source?: string | null;
  utm_parameters: Record<string, any>;
  assigned_admin_users: string[];
  affiliate_id?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  converted_user_id?: string | null;
  converted_at?: string | null;
  
  // Computed properties
  full_name?: string;
  stage_info?: LeadStageInfo;
  next_followup?: string;
  has_upcoming_followup?: boolean;
}

// Lead activity interface
export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  title: string;
  description?: string | null;
  admin_user_id: string;
  contact_method?: string | null;
  outcome?: string | null;
  old_stage?: LeadStage | null;
  new_stage?: LeadStage | null;
  scheduled_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  
  // Additional data
  admin_user?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

// Filter options
export interface LeadFilters {
  searchQuery: string;
  leadType: LeadType | 'all';
  leadStage: LeadStage | 'all';
  assignedTo: string | 'all' | 'unassigned';
  priorityLevel: number | 'all';
  source: string | 'all';
}

// View modes
export type ViewMode = 'table' | 'kanban' | 'list';

// Filter options for unified view
export interface UnifiedFilters {
  searchQuery: string;
  entityType: 'all' | 'leads' | 'users';
  userType: 'all' | 'admin' | 'vendor' | 'event_host';
  leadType: LeadType | 'all';
  status: 'all' | 'active' | 'converted' | 'archived';
}

// Combined entity type for unified table
export interface UnifiedEntity {
  id: string;
  type: 'lead' | 'user';
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  user_type?: string | null;
  lead_type?: LeadType | null;
  lead_stage?: LeadStage | null;
  roles?: string[];
  created_at: string;
  updated_at?: string;
  
  // Computed
  full_name?: string;
  entity_label?: string;
}

// Admin permission interface
export interface AdminPermission {
  id: string;
  user_id: string;
  permission_category: AdminPermissionCategory;
  permissions: Record<string, boolean>;
  granted_by: string;
  created_at: string;
  updated_at: string;
}

// Affiliate interface
export interface Affiliate {
  id: string;
  user_id?: string | null;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  referral_code: string;
  commission_rate: number;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  total_referrals: number;
  total_revenue: number;
  total_commission: number;
  payment_info: Record<string, any>;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at: string;
  updated_at: string;
}

// API response types
export interface DuplicateCheckResult {
  existing_user_id?: string | null;
  existing_lead_id?: string | null;
  is_user: boolean;
  company_match: boolean;
}

// Form types
export interface CreateLeadForm {
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  job_title?: string;
  lead_type: LeadType;
  priority_level: number;
  estimated_value: number;
  expected_close_date?: string;
  source?: string;
  assigned_admin_users: string[];
  affiliate_id?: string;
  notes?: string;
}

export interface CreateActivityForm {
  lead_id: string;
  activity_type: string;
  title: string;
  description?: string;
  contact_method?: string;
  outcome?: string;
  scheduled_at?: string;
  completed_at?: string;
}