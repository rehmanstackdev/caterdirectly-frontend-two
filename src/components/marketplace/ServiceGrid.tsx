
import { ServiceItem } from '@/types/service-types';
import ServiceCard from './service-card/ServiceCard';
import ServicePagination from './ServicePagination';
import ServiceEmptyState from './ServiceEmptyState';
import { getDisplayCity } from '@/utils/address-utils';
import { SERVICE_GRID_TEMPLATE } from '@/components/shared/grid';

interface ServiceGridProps {
  services: ServiceItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetails: (service: ServiceItem) => void;
  serviceType?: string;
  address?: string;
  locationSet: boolean;
  isLoading?: boolean;
  error?: string | null;
  showingLocationFiltered?: boolean;
}

function ServiceGrid({
  services,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetails,
  serviceType,
  address,
  locationSet,
  isLoading = false,
  error = null,
  showingLocationFiltered = false
}: ServiceGridProps) {
  // Render loading state
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F07712]"></div>
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
    return (
      <ServiceEmptyState 
        serviceType={serviceType} 
        address={address} 
        locationSet={locationSet}
        showingLocationFiltered={showingLocationFiltered}
      />
    );
  }

  return (
    <div className="w-full">
      {/* Show location filter status */}
      {showingLocationFiltered && address && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            Showing services near <strong>{getDisplayCity(address)}</strong>
          </p>
        </div>
      )}
      
      <div className="grid gap-4 sm:gap-6 lg:gap-8" style={{ gridTemplateColumns: SERVICE_GRID_TEMPLATE }}>
        {services.map((service) => (
          <ServiceCard 
            key={service.id}
            service={service}
            onViewDetails={() => onViewDetails(service)}
            vendorType={serviceType}
          />
        ))}
      </div>

      <ServicePagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        onPageChange={onPageChange} 
      />
    </div>
  );
};

export default ServiceGrid;
