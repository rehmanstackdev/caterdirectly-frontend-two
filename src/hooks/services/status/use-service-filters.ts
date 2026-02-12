
import { ServiceItem, ServiceStatus } from '@/types/service-types';

export function useServiceFilters(services: ServiceItem[]) {
  // Filter services by status
  const getServicesByStatus = (status: ServiceStatus | ServiceStatus[]): ServiceItem[] => {
    const statusArray = Array.isArray(status) ? status : [status];
    return services.filter((s) => statusArray.includes(s.status));
  };

  // Get active services
  const getActiveServices = (): ServiceItem[] => {
    return services.filter((s) => s.status === 'approved' && s.active);
  };

  // Get managed services
  const getManagedServices = (): ServiceItem[] => {
    return services.filter((s) => s.isManaged === true);
  };

  // Get draft services
  const getDraftServices = (): ServiceItem[] => {
    return getServicesByStatus('draft');
  };

  // Get pending approval services
  const getPendingServices = (): ServiceItem[] => {
    return getServicesByStatus('pending_approval');
  };

  // Get rejected services
  const getRejectedServices = (): ServiceItem[] => {
    return getServicesByStatus('rejected');
  };

  return {
    getServicesByStatus,
    getActiveServices,
    getManagedServices,
    getDraftServices,
    getPendingServices,
    getRejectedServices
  };
}
