import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBackendAssignLead } from '@/hooks/use-backend-leads';
import { toast } from 'sonner';

export function useUpdateLeadAssignment() {
  const queryClient = useQueryClient();
  const assignLead = useBackendAssignLead();

  return useMutation({
    mutationFn: async ({ leadId, adminIds }: { leadId: string; adminIds: string[] }) => {
      return assignLead.mutateAsync({
        leadId,
        assignedAdminUsers: adminIds
      });
    },
    onMutate: async ({ leadId, adminIds }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['backend-leads'] });
      await queryClient.cancelQueries({ queryKey: ['backend-unified-entities'] });
      
      // Optimistically update backend unified entities
      queryClient.setQueriesData({ queryKey: ['backend-unified-entities'] }, (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((entity: any) =>
          entity.type === 'lead' && entity.id === leadId
            ? { ...entity, assigned_admin_users: adminIds }
            : entity
        );
      });

      // Optimistically update backend leads lists
      queryClient.setQueriesData({ queryKey: ['backend-leads'] }, (oldLeads: any) => {
        if (!oldLeads) return oldLeads;
        return Array.isArray(oldLeads)
          ? oldLeads.map((lead: any) =>
              lead.id === leadId ? { ...lead, assigned_admin_users: adminIds } : lead
            )
          : oldLeads;
      });

      // Optimistically update the single lead cache
      queryClient.setQueryData(['backend-lead', leadId], (oldLead: any) => {
        if (!oldLead?.lead) return oldLead;
        return { ...oldLead, lead: { ...oldLead.lead, assigned_admin_users: adminIds } };
      });
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['backend-leads'] });
      queryClient.invalidateQueries({ queryKey: ['backend-unified-entities'] });
      if (variables?.leadId) {
        queryClient.invalidateQueries({ queryKey: ['backend-lead', variables.leadId] });
      }
      toast.success('Lead assignment updated successfully');
    },
    onError: (error: any, variables) => {
      // Rollback: refetch affected queries
      queryClient.invalidateQueries({ queryKey: ['backend-unified-entities'] });
      queryClient.invalidateQueries({ queryKey: ['backend-leads'] });
      if (variables?.leadId) {
        queryClient.invalidateQueries({ queryKey: ['backend-lead', variables.leadId] });
      }
      console.error('Error updating lead assignment:', error);
      toast.error('Failed to update lead assignment');
    },
  });
}