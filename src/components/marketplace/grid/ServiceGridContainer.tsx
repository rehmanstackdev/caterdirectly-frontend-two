

import { ServiceItem } from '@/types/service-types';
import OptimizedServiceGrid from './OptimizedServiceGrid';

interface ServiceGridContainerProps {
  services: ServiceItem[];
  onViewDetails: (service: ServiceItem) => void;
  serviceType?: string;
  address?: string;
  locationSet: boolean;
  isLoading?: boolean;
  error?: string | null;
  existingServices?: any[];
}

const ServiceGridContainer = ({
  services,
  onViewDetails,
  serviceType,
  address,
  locationSet,
  isLoading = false,
  error = null,
  existingServices = []
}: ServiceGridContainerProps) => {
  return (
    <OptimizedServiceGrid
      services={services}
      currentPage={1}
      totalPages={1}
      onPageChange={() => {}}
      onViewDetails={onViewDetails}
      serviceType={serviceType}
      address={address}
      locationSet={locationSet}
      isLoading={isLoading}
      error={error}
      isTabLoaded={true}
      existingServices={existingServices}
    />
  );
};

export default ServiceGridContainer;
