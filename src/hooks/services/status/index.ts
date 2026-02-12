
import { ServiceItem, ServiceStatus } from '@/types/service-types';
import { useSubmitForApproval } from './use-submit-for-approval';
import { useServiceFilters } from './use-service-filters';

export function useServiceStatus(services: ServiceItem[], updateService: (id: string, data: any) => Promise<any>) {
  const submitServiceForApproval = useSubmitForApproval(updateService);
  const serviceFilters = useServiceFilters(services);

  return {
    submitServiceForApproval,
    ...serviceFilters
  };
}
