import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ServicesService, { ServiceFilters } from '@/services/api/services.Service';
import { ServiceWithDetails, ServiceStatus } from '@/types/services';
import { toast } from 'sonner';

// Hook for fetching services
export const useServices = (filters?: ServiceFilters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      try {
        const services = await ServicesService.getServices(filters);
        console.log('Services from backend:', services);
        
        // Backend getAllServices doesn't include vendor relations
        // Return services as-is for now, vendor details can be fetched individually if needed
        return Array.isArray(services) ? services : [];
      } catch (error) {
        console.error('Error fetching services:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching single service
export const useService = (serviceId: string) => {
  return useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      try {
        const response = await ServicesService.getServiceById(serviceId);
        return response;
      } catch (error) {
        console.error('Error fetching service:', error);
        return null;
      }
    },
    enabled: !!serviceId,
  });
};

// Hook for creating catering service
export const useCreateCateringService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => ServicesService.createCateringService(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Catering service created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create catering service';
      toast.error(message);
    },
  });
};

// Hook for creating venue service
export const useCreateVenueService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => ServicesService.createVenueService(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Venue service created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create venue service';
      toast.error(message);
    },
  });
};

// Hook for creating party rental service
export const useCreatePartyRentalService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => ServicesService.createPartyRentalService(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Party rental service created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create party rental service';
      toast.error(message);
    },
  });
};

// Hook for creating event staff service
export const useCreateEventStaffService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (formData: FormData) => ServicesService.createEventStaffService(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Event staff service created successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to create event staff service';
      toast.error(message);
    },
  });
};

// Hook for updating service status
export const useUpdateServiceStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ serviceId, status }: { serviceId: string; status: ServiceStatus }) =>
      ServicesService.updateServiceStatus(serviceId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service status updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update service status';
      toast.error(message);
    },
  });
};

// Hook for updating service manage field
export const useUpdateServiceManage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ serviceId, manage }: { serviceId: string; manage: boolean }) =>
      ServicesService.updateServiceManage(serviceId, manage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service manage field updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update service manage field';
      toast.error(message);
    },
  });
};

// Hook for deleting service
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (serviceId: string) => ServicesService.deleteService(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete service';
      toast.error(message);
    },
  });
};

// Hook for service filters state management
export const useServiceFilters = () => {
  const [filters, setFilters] = useState<ServiceFilters>({});
  
  const updateFilter = (key: keyof ServiceFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const clearFilters = () => {
    setFilters({});
  };
  
  return {
    filters,
    updateFilter,
    clearFilters,
    setFilters
  };
};