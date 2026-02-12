import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ServicesService from '@/services/api/services.Service';
import { toast } from 'sonner';

export function useVendorServices() {
  const queryClient = useQueryClient();
  
  // Fetch vendor's services
  const { data: services = [], isLoading: loading, error } = useQuery({
    queryKey: ['vendor-services'],
    queryFn: async () => {
      try {
        const response = await ServicesService.getServices();
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error('Error fetching vendor services:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get services by status
  const getServicesByStatus = (status: string) => {
    return services.filter((service: any) => service.status === status);
  };

  const getActiveServices = () => getServicesByStatus('approved');
  const getPendingServices = () => getServicesByStatus('pending');
  const getDraftServices = () => getServicesByStatus('drafted');
  const getRejectedServices = () => getServicesByStatus('rejected');

  // Get services by type
  const getServicesByType = (type: string) => {
    return services.filter((service: any) => service.serviceType === type);
  };

  const getCateringServices = () => getServicesByType('catering');
  const getVenueServices = () => getServicesByType('venues');
  const getPartyRentalServices = () => getServicesByType('party_rentals');
  const getEventStaffServices = () => getServicesByType('events_staff');

  // Refresh services
  const refreshServices = () => {
    queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
  };

  return {
    services,
    loading,
    error,
    getServicesByStatus,
    getActiveServices,
    getPendingServices,
    getDraftServices,
    getRejectedServices,
    getServicesByType,
    getCateringServices,
    getVenueServices,
    getPartyRentalServices,
    getEventStaffServices,
    refreshServices,
  };
}