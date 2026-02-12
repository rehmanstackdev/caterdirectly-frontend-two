
import { ServiceSelection } from "@/types/order";

/**
 * Returns the service name, taking into account different naming conventions
 * @param service The service selection object
 * @returns The appropriate service name
 */
export const getServiceName = (service: ServiceSelection): string => {
  return service.serviceName || service.name || 'Service';
};
