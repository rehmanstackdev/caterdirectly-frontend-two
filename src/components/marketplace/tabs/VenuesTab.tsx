
import { useState, useEffect, useMemo } from 'react';
import { useUnifiedMarketplace } from '@/hooks/use-unified-marketplace-service';
import { SERVICE_TYPES } from '@/utils/service-type-utils';
import { ServiceSelection } from '@/types/order';
import { useFilterContext } from '@/contexts/FilterContext';
import ServiceSection from '../ServiceSection';
import MarketplacePagination from '../MarketplacePagination';

interface VenuesTabProps {
  isTabLoaded: boolean;
  existingServices?: ServiceSelection[];
  isBookingMode?: boolean;
  vendorMode?: boolean;
}

const VenuesTab = ({
  isTabLoaded,
  existingServices = [],
  isBookingMode = false,
  vendorMode = false
}: VenuesTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { filters } = useFilterContext();

  // Convert FilterContext venue filters to API filters
  const apiFilters = useMemo(() => {
    const venueFilters = filters.venues;
    const globalFilters = filters.global;

    return {
      // Location filter - matches against vendor fullAddress using partial text matching
      location: globalFilters.location || undefined,
      // Search query - matches against service name, description, vendor name on backend
      serviceName: globalFilters.searchQuery?.trim() || undefined,
      // Always send venueMinPrice if it's not the default minimum (0)
      venueMinPrice: venueFilters.priceRange[0] !== 0 ? venueFilters.priceRange[0] : undefined,
      // Always send venueMaxPrice if it's not the default maximum (5000)
      venueMaxPrice: venueFilters.priceRange[1] !== 5000 ? venueFilters.priceRange[1] : undefined,
      // Always send seatedCapacityMin if it's not the default minimum (1)
      seatedCapacityMin: venueFilters.guestCapacity[0] !== 1 ? venueFilters.guestCapacity[0] : undefined,
      // Always send seatedCapacityMax if it's not the default maximum (1000)
      seatedCapacityMax: venueFilters.guestCapacity[1] !== 1000 ? venueFilters.guestCapacity[1] : undefined,
    };
  }, [
    filters.global.location,
    filters.global.searchQuery,
    filters.venues.priceRange[0],
    filters.venues.priceRange[1],
    filters.venues.guestCapacity[0],
    filters.venues.guestCapacity[1]
  ]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [JSON.stringify(apiFilters)]);

  const {
    services,
    isLoading,
    error,
    pagination
  } = useUnifiedMarketplace({
    activeTab: SERVICE_TYPES.VENUES,
    isTabVisible: isTabLoaded,
    vendorMode,
    showAllServices: false,
    enablePagination: true,
    page: currentPage,
    limit: itemsPerPage,
    filters: apiFilters
  });

  // Services are now filtered by backend - no need for client-side filtering

  return (
    <div className="space-y-6">
      <ServiceSection
        services={services}
        serviceType={SERVICE_TYPES.VENUES}
        isLoading={isLoading}
        error={error}
        isTabLoaded={isTabLoaded}
        existingServices={existingServices}
        enableFilterContext={true}
        showAllServices={false}
      />
      <MarketplacePagination
        currentPage={currentPage}
        totalPages={pagination?.totalPages || Math.ceil(services.length / itemsPerPage) || 1}
        totalItems={pagination?.totalItems || services.length}
        itemsPerPage={itemsPerPage}
        isLoading={isLoading}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default VenuesTab;
