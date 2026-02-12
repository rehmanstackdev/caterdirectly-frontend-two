
import { useCallback } from 'react';
import { ServiceItem, PriceType } from '@/types/service-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useUpdateService(setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>) {
  return useCallback(async (id: string, serviceUpdate: Partial<ServiceItem>): Promise<ServiceItem | null> => {
    try {
      // Convert from our interface format to database format
      const dbUpdate: any = {};
      
      if (serviceUpdate.name !== undefined) dbUpdate.name = serviceUpdate.name;
      if (serviceUpdate.type !== undefined) dbUpdate.type = serviceUpdate.type;
      if (serviceUpdate.description !== undefined) dbUpdate.description = serviceUpdate.description;
      if (serviceUpdate.price !== undefined) dbUpdate.price = serviceUpdate.price;
      if (serviceUpdate.price_type !== undefined) dbUpdate.price_type = serviceUpdate.price_type as PriceType;
      if (serviceUpdate.image !== undefined) dbUpdate.image = serviceUpdate.image;
      if (serviceUpdate.status !== undefined) dbUpdate.status = serviceUpdate.status;
      if (serviceUpdate.active !== undefined) dbUpdate.active = serviceUpdate.active;
      if (serviceUpdate.adminFeedback !== undefined) dbUpdate.admin_feedback = serviceUpdate.adminFeedback;
      if (serviceUpdate.location !== undefined) dbUpdate.location = serviceUpdate.location;
      if (serviceUpdate.service_details !== undefined) dbUpdate.service_details = serviceUpdate.service_details;
      
      // Special handling for isManaged toggle
      if ('isManaged' in serviceUpdate) {
        if (serviceUpdate.isManaged === undefined) {
          // This is from toggleManagedStatus - we need to toggle the current value
          const { data: currentService } = await supabase
            .from('services')
            .select('is_managed')
            .eq('id', id)
            .single();
            
          if (currentService) {
            dbUpdate.is_managed = !currentService.is_managed;
          }
        } else {
          dbUpdate.is_managed = serviceUpdate.isManaged;
        }
      }
      
      const { data, error } = await supabase
        .from('services')
        .update(dbUpdate)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      if (!data) {
        throw new Error('Service not found');
      }
      
      // Transform the data to match our ServiceItem interface
      const updatedService: ServiceItem = {
        id: data.id,
        name: data.name,
        type: data.type as any,
        description: data.description,
        price: data.price,
        price_type: data.price_type as PriceType,
        image: data.image,
        status: data.status as any,
        active: data.active,
        isManaged: data.is_managed,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        vendorName: data.vendor_name,
        vendor_id: data.vendor_id,
        location: data.location,
        reviews: data.reviews,
        rating: data.rating,
        adminFeedback: data.admin_feedback,
        serviceType: data.type,
        available: data.available,
        service_details: data.service_details
      };
      
      setServices((prevServices) => {
        return prevServices.map(service => 
          service.id === id ? updatedService : service
        );
      });
      
      return updatedService;
    } catch (error: any) {
      console.error('Error updating service:', error);
      toast({
        title: 'Error updating service',
        description: error.message,
        variant: 'destructive'
      });
      return null;
    }
  }, [setServices]);
}
