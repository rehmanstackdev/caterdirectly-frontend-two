
import { ServiceItem } from '@/types/service-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useManagedStatus(
  updateService: (id: string, service: Partial<ServiceItem>) => Promise<ServiceItem | null>
) {
  // Toggle managed status for a service
  const toggleManagedStatus = async (id: string): Promise<ServiceItem | null> => {
    try {
      // Get the current service to check its isManaged status
      const { data: currentService, error: fetchError } = await supabase
        .from('services')
        .select('is_managed')
        .eq('id', id)
        .single();
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!currentService) {
        throw new Error('Service not found');
      }
      
      const newManagedStatus = !currentService.is_managed;
      
      // Update in Supabase
      const { error: updateError } = await supabase
        .from('services')
        .update({ is_managed: newManagedStatus })
        .eq('id', id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update in local state via updateService
      return updateService(id, { isManaged: newManagedStatus });
    } catch (error: any) {
      console.error('Error toggling managed status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update managed status',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    toggleManagedStatus
  };
}
