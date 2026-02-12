
import { ServiceItem } from '@/types/service-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useApprovalFunctions(
  updateService: (id: string, service: Partial<ServiceItem>) => Promise<ServiceItem | null>
) {
  // Approve a service
  const approveService = async (id: string): Promise<ServiceItem | null> => {
    try {
      const result = await updateService(id, {
        status: 'approved',
        active: true,
        adminFeedback: 'Service approved'
      });
      
      // Make sure the change is reflected in Supabase
      if (result) {
        const { error } = await supabase
          .from('services')
          .update({
            status: 'approved',
            active: true,
            admin_feedback: 'Service approved'
          })
          .eq('id', id);
          
        if (error) {
          console.error('Error updating service in Supabase:', error);
          toast({
            title: 'Warning',
            description: 'Service status may not be fully updated in the database.',
            variant: 'destructive'
          });
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Error approving service:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve service',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Reject a service
  const rejectService = async (id: string, feedback: string): Promise<ServiceItem | null> => {
    try {
      const result = await updateService(id, {
        status: 'rejected',
        active: false,
        adminFeedback: feedback
      });
      
      // Make sure the change is reflected in Supabase
      if (result) {
        const { error } = await supabase
          .from('services')
          .update({
            status: 'rejected',
            active: false,
            admin_feedback: feedback
          })
          .eq('id', id);
          
        if (error) {
          console.error('Error updating service in Supabase:', error);
          toast({
            title: 'Warning',
            description: 'Service status may not be fully updated in the database.',
            variant: 'destructive'
          });
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Error rejecting service:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject service',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    approveService,
    rejectService
  };
}
