
import { useCallback } from 'react';
import { ServiceItem } from '@/types/service-types';
import ServicesService from '@/services/api/services.Service';
import { toast } from 'sonner';

export function useDeleteService(setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>) {
  return useCallback(async (id: string): Promise<boolean> => {
    try {
      await ServicesService.deleteService(id);
      
      setServices((prevServices) => {
        return prevServices.filter(service => service.id !== id);
      });
      
      return true;
    } catch (error: any) {
      console.error('Error deleting service:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to delete service';
      toast.error(message);
      return false;
    }
  }, [setServices]);
}
