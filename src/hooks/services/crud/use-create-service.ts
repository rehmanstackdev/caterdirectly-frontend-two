
import { useCallback } from 'react';
import { ServiceItem, PriceType } from '@/types/service-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useCreateService(setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>) {
  return useCallback(async (service: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceItem | null> => {
    try {
      console.log('Creating service in Supabase:', service);
      
      // Determine brand selection and compute effective vendor mapping
      const chosenBrandId = (service as any).brand_id || (service as any).brandId || null;
      let effectiveVendorId = service.vendor_id;
      let effectiveVendorName = service.vendorName;

      if (chosenBrandId) {
        const { data: brandData, error: brandError } = await supabase
          .from('vendor_brands')
          .select('id, brand_name, vendor_id')
          .eq('id', chosenBrandId)
          .single();
        if (!brandError && brandData) {
          effectiveVendorId = brandData.vendor_id;
          effectiveVendorName = brandData.brand_name;
        } else if (brandError) {
          console.warn('Brand lookup failed; proceeding with provided vendor_id', brandError);
        }
      }
      
      // Check if vendor exists and get their location
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id, city, state, full_address')
        .eq('id', effectiveVendorId)
        .single();
        
      if (vendorError || !vendorData) {
        throw new Error('Invalid vendor ID. Please specify a valid vendor.');
      }
      
      // Auto-populate location from vendor's business address if not provided
      // Prefer full_address over component-based assembly
      const defaultLocation = vendorData.full_address || 
        (vendorData.city && vendorData.state ? `${vendorData.city}, ${vendorData.state}` : '');
      
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: service.name,
          type: service.type,
          description: service.description || '',
          price: service.price,
          price_type: service.price_type || 'flat_rate' as PriceType,
          image: service.image || '',
          status: service.status,
          active: service.active,
          is_managed: service.isManaged,
          vendor_name: effectiveVendorName || service.vendorName,
          vendor_id: effectiveVendorId,
          brand_id: chosenBrandId,
          location: service.location || defaultLocation,
          service_details: service.service_details || {}
        })
        .select('*')
        .single();
        
      if (error) {
        throw error;
      }
      
      const newService = {
        id: data.id,
        name: data.name,
        type: data.type,
        description: data.description,
        price: data.price,
        price_type: data.price_type,
        image: data.image,
        status: data.status,
        active: data.active,
        isManaged: data.is_managed,
        vendorName: data.vendor_name,
        vendor_id: data.vendor_id,
        location: data.location,
        reviews: data.reviews,
        rating: data.rating,
        adminFeedback: data.admin_feedback,
        service_details: data.service_details,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as ServiceItem;
      
      setServices(prevServices => [...prevServices, newService]);
      
      return newService;
    } catch (error: any) {
      console.error('Error creating service:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create service',
        variant: 'destructive'
      });
      return null;
    }
  }, [setServices]);
}
