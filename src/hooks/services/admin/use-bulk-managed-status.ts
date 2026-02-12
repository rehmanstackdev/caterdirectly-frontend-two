
import { ServiceItem } from '@/types/service-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useBulkManagedStatus() {
  // Update managed status for all services by a vendor
  const updateManagedStatusByVendor = async (
    vendorName: string, 
    isManaged: boolean, 
    services: ServiceItem[],
    setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>
  ): Promise<boolean> => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('services')
        .update({ is_managed: isManaged })
        .eq('vendor_name', vendorName);
        
      if (error) {
        throw error;
      }
      
      // Update all services in the local state
      const updatedServices = services.map(service => 
        service.vendorName === vendorName 
          ? { ...service, isManaged } 
          : service
      );
      
      setServices(updatedServices);
      
      return true;
    } catch (error: any) {
      console.error('Error updating managed status by vendor:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update managed status for vendor services',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    updateManagedStatusByVendor
  };
}
