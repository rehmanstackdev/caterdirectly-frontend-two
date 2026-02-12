import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCreateLead, useCheckDuplicates } from './use-leads';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { CreateLeadForm } from '@/types/crm-types';

interface BulkUploadResult {
  successful: number;
  failed: number;
  duplicates: number;
  errors: Array<{ row: number; error: string }>;
  duplicateEmails: string[];
}

export function useBulkLeadUpload() {
  const queryClient = useQueryClient();
  const createLead = useCreateLead();
  const checkDuplicates = useCheckDuplicates();

  return useMutation({
    mutationFn: async (leads: CreateLeadForm[]): Promise<BulkUploadResult> => {
      const result: BulkUploadResult = {
        successful: 0,
        failed: 0,
        duplicates: 0,
        errors: [],
        duplicateEmails: []
      };

      // Get current user info for auto-assignment
      const { data: currentUser } = await supabase.auth.getUser();
      const currentUserId = currentUser.user?.id;
      
      // Check if current user is admin
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUserId);
      
      const isAdmin = userRoles?.some(ur => ur.role === 'admin' || ur.role === 'super-admin');

      // Process leads sequentially to avoid overwhelming the system
      for (let i = 0; i < leads.length; i++) {
        const lead = leads[i];
        try {
          // Check for duplicates before creating the lead
          const emailDomain = lead.email.includes('@') ? lead.email.split('@')[1].toLowerCase() : undefined;
          const duplicateResult = await new Promise<any[]>((resolve, reject) => {
            checkDuplicates.mutate(
              {
                email: lead.email,
                company_domain: emailDomain
              },
              {
                onSuccess: resolve,
                onError: reject
              }
            );
          });

          // Skip if duplicate found
          if (duplicateResult.some(r => r.is_user)) {
            result.duplicates++;
            result.duplicateEmails.push(lead.email);
            continue;
          }

          // Auto-assign to current user if no assignment and user is admin
          const leadWithAssignment = {
            ...lead,
            assigned_admin_users: lead.assigned_admin_users?.length > 0 
              ? lead.assigned_admin_users 
              : (isAdmin && currentUserId ? [currentUserId] : [])
          };

          await createLead.mutateAsync(leadWithAssignment);
          result.successful++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: (lead as any).rowNumber || i + 1,
            error: error instanceof Error ? error.message : 'Failed to create lead'
          });
        }
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      if (result.successful > 0) {
        toast.success(`Successfully uploaded ${result.successful} leads`);
      }
      if (result.duplicates > 0) {
        toast.info(`Skipped ${result.duplicates} duplicate leads`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to upload ${result.failed} leads`);
      }
    },
    onError: (error) => {
      console.error('Bulk upload failed:', error);
      toast.error('Bulk upload failed');
    }
  });
}