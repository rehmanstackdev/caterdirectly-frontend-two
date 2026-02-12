
import { useState, useMemo, useEffect } from 'react';
import { useUnifiedMarketplace } from '@/hooks/use-unified-marketplace-service';
import { SERVICE_TYPES } from '@/utils/service-type-utils';
import { ServiceSelection } from '@/types/order';
import { useFilterContext } from '@/contexts/FilterContext';
import ServiceSection from '../ServiceSection';
import MarketplacePagination from '../MarketplacePagination';

interface PartyRentalsTabProps {
  isTabLoaded: boolean;
  existingServices?: ServiceSelection[];
  isBookingMode?: boolean;
  vendorMode?: boolean;
}

const PartyRentalsTab = ({
  isTabLoaded,
  existingServices = [],
  isBookingMode = false,
  vendorMode = false
}: PartyRentalsTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { filters } = useFilterContext();

  // Convert FilterContext filters to API filters
  const apiFilters = useMemo(() => {
    const globalFilters = filters.global;
    const rentalFilters = filters.rentals;

    // Check if delivery options are selected
    const deliveryAvailable = rentalFilters.deliveryOptions.includes('Delivery Available') || undefined;
    const setupIncluded = rentalFilters.deliveryOptions.includes('Setup Included') || undefined;
    const pickupAvailable = rentalFilters.deliveryOptions.includes('Pickup Available') || undefined;

    return {
      // Location filter - matches against vendor fullAddress using partial text matching
      location: globalFilters.location || undefined,
      // Search query - matches against service name, description, vendor name on backend
      serviceName: globalFilters.searchQuery?.trim() || undefined,
      // Price range filters
      minPartyPrice: rentalFilters.priceRange[0] !== 0 ? rentalFilters.priceRange[0] : undefined,
      maxPartyPrice: rentalFilters.priceRange[1] !== 1000 ? rentalFilters.priceRange[1] : undefined,
      // Delivery options
      deliveryAvailable,
      setupIncluded,
      pickupAvailable,
    };
  }, [
    filters.global.location,
    filters.global.searchQuery,
    filters.rentals.priceRange[0],
    filters.rentals.priceRange[1],
    filters.rentals.deliveryOptions.join(',')
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
    activeTab: SERVICE_TYPES.PARTY_RENTALS_TAB,
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
        serviceType={SERVICE_TYPES.PARTY_RENTALS}
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

export default PartyRentalsTab;
