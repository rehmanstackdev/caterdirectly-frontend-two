
import { memo } from 'react';
import { ServiceItem } from '@/types/service-types';
import { ServiceSelection } from '@/types/order';
import ServiceCard from '../service-card/ServiceCard';
import ServiceEmptyState from '../ServiceEmptyState';
import ServiceCardSkeleton from '@/components/shared/ServiceCardSkeleton';
import { SERVICE_GRID_TEMPLATE } from '@/components/shared/grid';

interface OptimizedServiceGridProps {
  services: ServiceItem[];
  onViewDetails: (service: ServiceItem) => void;
  serviceType?: string;
  address?: string;
  locationSet: boolean;
  isLoading?: boolean;
  error?: string | null;
  isTabLoaded?: boolean;
  existingServices?: ServiceSelection[];
  showingLocationFiltered?: boolean;
  // Keep these for compatibility but they're not used
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const OptimizedServiceGrid = ({
  services,
  onViewDetails,
  serviceType,
  address,
  locationSet,
  isLoading = false,
  error = null,
  isTabLoaded = false,
  existingServices = []
}: OptimizedServiceGridProps) => {
  // Show skeletons during initial load or when tab hasn't been loaded
  if (isLoading || !isTabLoaded) {
    return (
      <div className="w-full">
        <div className="grid gap-4 sm:gap-6 lg:gap-8" style={{ gridTemplateColumns: SERVICE_GRID_TEMPLATE }}>
          {Array(10).fill(0).map((_, index) => (
            <ServiceCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="bg-red-50 p-6 rounded-lg max-w-md text-center">
          <h3 className="text-red-700 font-medium mb-2">Error Loading Services</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // Render empty state
  if (services.length === 0) {
    return <ServiceEmptyState serviceType={serviceType} address={address} locationSet={locationSet} />;
  }

  return (
    <div className="w-full">
      <div className="grid gap-4 sm:gap-6 lg:gap-8" style={{ gridTemplateColumns: SERVICE_GRID_TEMPLATE }}>
        {services.map((service, index) => (
          <ServiceCard 
            key={service.id}
            service={service}
            onViewDetails={() => onViewDetails(service)}
            vendorType={serviceType}
            priority={index < 3}
            existingServices={existingServices}
          />
        ))}
      </div>

    </div>
  );
};

export default memo(OptimizedServiceGrid);
