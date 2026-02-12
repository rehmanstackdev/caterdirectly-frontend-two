import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ServicesService, { ServiceFilters } from '@/services/api/services.Service';
import { ServiceItem } from '@/types/service-types';
import { toast } from 'sonner';

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// Transform backend service data to match frontend ServiceItem interface
const transformBackendService = (service: any): ServiceItem => {
  // Extract vendor name from various possible locations
  let vendorName = 'Unknown Vendor';
  if (service.vendor?.businessName) {
    vendorName = service.vendor.businessName;
  } else if (service.createdBy) {
    const { firstName, lastName } = service.createdBy;
    if (firstName && lastName) {
      vendorName = `${firstName} ${lastName}`;
    } else if (firstName || lastName) {
      vendorName = firstName || lastName;
    }
  }
  
  // Map backend status to frontend status
  const mapStatus = (backendStatus: string) => {
    switch (backendStatus) {
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      case 'drafted': return 'draft';
      case 'pending': return 'pending_approval';
      default: return 'pending_approval';
    }
  };
  
  // Determine if service is active based on status and visibleStatus
  const isActive = service.status === 'approved' && service.visibleStatus === 'active';
  
  return {
    id: service.id,
    name: service.serviceName,
    type: service.serviceType,
    serviceType: service.serviceType,
    status: mapStatus(service.status),
    active: isActive,
    vendorName,
    vendor_id: service.vendor?.id || service.vendorId,
    price: service.catering?.minimumOrderAmount ? `$${service.catering.minimumOrderAmount}` :
           service.venue?.price ? `$${service.venue.price}` :
           service.partyRental?.price ? `$${service.partyRental.price}` :
           service.eventStaff?.price ? `$${service.eventStaff.price}` : 'Contact for pricing',
    image: service.catering?.menuPhoto || 
           service.venue?.serviceImage || 
           service.partyRental?.serviceImage || 
           service.eventStaff?.serviceImage || 
           (service.catering?.menuItems?.[0]?.imageUrl) || '',
    description: service.description || '',
    isManaged: service.manage || 
               service.catering?.manage || 
               service.venue?.manage || 
               service.partyRental?.manage || 
               service.eventStaff?.manage || 
               false,
    service_details: {
      ...service.catering,
      ...service.venue,
      ...service.partyRental,
      ...service.eventStaff,
      // Preserve createdBy and vendor details
      ...(service.createdBy && { createdBy: service.createdBy }),
      ...(service.vendor && { vendor: service.vendor })
    },
    createdAt: service.createdAt,
    updatedAt: service.updatedAt
  };
};

interface UseServicesOptions {
  page?: number;
  limit?: number;
  enablePagination?: boolean;
}

export function useServices(vendorId?: string, statusFilter?: string, options?: UseServicesOptions) {
  const queryClient = useQueryClient();
  const { page = 1, limit = 10, enablePagination = false } = options || {};

  // Map frontend status to backend status
  const mapStatusToBackend = (status?: string): string | undefined => {
    if (!status) return undefined;
    switch (status) {
      case 'pending':
        return 'pending';
      case 'drafts':
        return 'drafted';
      case 'rejected':
        return 'rejected';
      case 'active':
      case 'inactive':
        return undefined; // Active and inactive tabs use visibleStatus instead
      default:
        return undefined;
    }
  };

  const backendStatus = mapStatusToBackend(statusFilter);
  const useVisibleStatus = statusFilter === 'active' || statusFilter === 'inactive';
  const visibleStatusValue = statusFilter === 'active'
    ? 'active'
    : statusFilter === 'inactive'
    ? 'inactive'
    : undefined;

  // Fetch services using React Query
  const { data: queryData, isLoading: loading, error } = useQuery({
    queryKey: vendorId
      ? ['vendor-services', vendorId, statusFilter, useVisibleStatus ? `visibleStatus-${visibleStatusValue}` : `status-${backendStatus}`, enablePagination ? `page-${page}-limit-${limit}` : 'no-pagination']
      : ['admin-services', statusFilter, useVisibleStatus ? `visibleStatus-${visibleStatusValue}` : `status-${backendStatus}`, enablePagination ? `page-${page}-limit-${limit}` : 'no-pagination'],
    queryFn: async () => {
      console.log('useServices API call:', { vendorId, hasVendorId: !!vendorId, statusFilter, backendStatus, useVisibleStatus, page, limit, enablePagination });
      try {
        if (vendorId) {
          // Build filters
          const filters: ServiceFilters = {};

          if (useVisibleStatus && visibleStatusValue) {
            filters.visibleStatus = visibleStatusValue as 'active' | 'inactive';
          } else if (backendStatus) {
            filters.status = backendStatus as 'pending' | 'drafted' | 'approved' | 'rejected';
          }

          // Add pagination params if enabled
          if (enablePagination) {
            filters.page = page;
            filters.limit = limit;
          }

          console.log('Calling getServicesByVendorPaginated with vendorId:', vendorId, 'filters:', filters);

          // Use paginated version for pagination support
          if (enablePagination) {
            const paginatedResponse = await ServicesService.getServicesByVendorPaginated(vendorId, filters);
            console.log('Vendor services paginated response:', paginatedResponse);
            return {
              services: paginatedResponse.data || [],
              pagination: paginatedResponse.pagination
            };
          } else {
            const services = await ServicesService.getServicesByVendor(vendorId, filters);
            console.log('Vendor services response:', services);
            return { services: services || [], pagination: undefined };
          }
        } else {
          // Use general services endpoint for admin
          console.log('Calling getServices (admin)');
          let services = await ServicesService.getServices();

          // For admin, fetch individual service details to get vendor info
          if (services && services.length > 0) {
            services = await Promise.all(
              services.map(async (service: any) => {
                try {
                  return await ServicesService.getServiceById(service.id);
                } catch (error) {
                  console.error(`Error fetching details for service ${service.id}:`, error);
                  return service;
                }
              })
            );
          }

          return { services: services || [], pagination: undefined };
        }
      } catch (error) {
        console.error('useServices: Error fetching services:', error);
        return { services: [], pagination: undefined };
      }
    },
    staleTime: 0, // Always refetch when query key changes (tab change)
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Extract services and pagination from query data
  const servicesData = queryData?.services || [];
  const paginationData = queryData?.pagination;

  // Transform services data
  const services = servicesData ? servicesData.map(transformBackendService) : [];

  // Build pagination state
  const pagination: PaginationState | undefined = paginationData ? {
    currentPage: paginationData.currentPage || page,
    totalPages: paginationData.totalPages || 1,
    totalItems: paginationData.totalItems || services.length,
    itemsPerPage: paginationData.itemsPerPage || paginationData.limit || limit,
    hasNextPage: paginationData.hasNextPage,
    hasPreviousPage: paginationData.hasPreviousPage
  } : undefined;

  const invalidateQueries = () => {
    if (vendorId) {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-services-all', vendorId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['admin-services-all'] });
    }
  };

  // Approve service mutation
  const approveServiceMutation = useMutation({
    mutationFn: (serviceId: string) => ServicesService.updateServiceStatus(serviceId, 'approved'),
    onSuccess: () => {
      invalidateQueries();
      toast.success('Service approved successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to approve service';
      toast.error(message);
    }
  });

  // Reject service mutation
  const rejectServiceMutation = useMutation({
    mutationFn: (serviceId: string) => ServicesService.updateServiceStatus(serviceId, 'rejected'),
    onSuccess: () => {
      invalidateQueries();
      toast.success('Service rejected successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to reject service';
      toast.error(message);
    }
  });

  // Toggle managed status mutation
  const toggleManagedMutation = useMutation({
    mutationFn: ({ serviceId, manage }: { serviceId: string; manage: boolean }) => 
      ServicesService.updateServiceManage(serviceId, manage),
    onSuccess: () => {
      invalidateQueries();
      toast.success('Managed status updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to update managed status';
      toast.error(message);
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: string) => ServicesService.deleteService(serviceId),
    onSuccess: () => {
      invalidateQueries();
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'Failed to delete service';
      toast.error(message);
    }
  });

  // Helper functions
  const approveService = (id: string) => {
    approveServiceMutation.mutate(id);
  };

  const rejectService = (id: string, reason?: string) => {
    rejectServiceMutation.mutate(id);
  };

  const toggleManagedStatus = (id: string) => {
    const service = services.find(s => s.id === id);
    if (service) {
      toggleManagedMutation.mutate({ serviceId: id, manage: !service.isManaged });
    }
  };

  const deleteService = async (id: string): Promise<boolean> => {
    try {
      await deleteServiceMutation.mutateAsync(id);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Filter functions
  const getServicesByStatus = (status: string) => {
    return services.filter(service => service.status === status);
  };

  const getActiveServices = () => getServicesByStatus('approved');
  const getManagedServices = () => services.filter(service => service.isManaged);
  const getDraftServices = () => getServicesByStatus('draft');
  const getPendingServices = () => getServicesByStatus('pending_approval');
  const getRejectedServices = () => getServicesByStatus('rejected');

  const refreshServices = useCallback(() => {
    // Invalidate all status variations to ensure data consistency across tabs
    if (vendorId) {
      queryClient.invalidateQueries({ queryKey: ['vendor-services', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-services-all', vendorId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['admin-services-all'] });
    }
  }, [queryClient, vendorId]);

  // Update service (for activate/deactivate)
  const updateService = async (id: string, updates: { active?: boolean }) => {
    if (updates.active !== undefined) {
      try {
        const visibleStatus = updates.active ? 'active' : 'inactive';
        await ServicesService.updateServiceVisibleStatus(id, visibleStatus);
        invalidateQueries();
      } catch (error: any) {
        if (error?.response?.status === 403) {
          throw new Error('You do not have permission to activate/deactivate services. Please contact an administrator.');
        }
        throw error;
      }
    }
  };

  return {
    services,
    loading,
    pagination,
    approveService,
    rejectService,
    toggleManagedStatus,
    deleteService,
    updateService,
    getServicesByStatus,
    getActiveServices,
    getManagedServices,
    getDraftServices,
    getPendingServices,
    getRejectedServices,
    refreshServices,
    // Legacy compatibility
    createService: () => Promise.resolve(),
    submitServiceForApproval: { submitService: () => Promise.resolve() },
    updateManagedStatusByVendor: () => Promise.resolve()
  };
}
