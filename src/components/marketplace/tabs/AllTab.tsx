
import { useState, useMemo, useEffect } from 'react';
import { useUnifiedMarketplace } from '@/hooks/use-unified-marketplace-service';
import { SERVICE_TYPES } from '@/utils/service-type-utils';
import { ServiceSelection } from '@/types/order';
import { useFilterContext } from '@/contexts/FilterContext';
import ServiceSection from '../ServiceSection';
import MarketplacePagination from '../MarketplacePagination';

interface AllTabProps {
  isTabLoaded: boolean;
  existingServices?: ServiceSelection[];
  isBookingMode?: boolean;
  vendorMode?: boolean;
}

const AllTab = ({
  isTabLoaded,
  existingServices = [],
  isBookingMode = false,
  vendorMode = false
}: AllTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { filters } = useFilterContext();

  const locationCoordinates = filters.global.locationCoordinates;

  const convertDietaryOptions = (options: string[]): string[] => {
    const conversionMap: Record<string, string> = {
      'Vegetarian': 'vegetarian',
      'Vegan': 'vegan',
      'Gluten Free': 'gluten_free',
      'Dairy Free': 'dairy_free',
      'Nut Free': 'nut_free',
      'Halal': 'halal',
      'Kosher': 'kosher'
    };
    const allowedValues = ['vegetarian', 'dairy_free', 'halal', 'vegan', 'nut_free', 'gluten_free', 'kosher'];
    return options
      .map(option => conversionMap[option] || option.toLowerCase().replace(/\s+/g, '_'))
      .filter(value => allowedValues.includes(value));
  };

  // Convert FilterContext catering filters to API filters
  const apiFilters = useMemo(() => {
    const cateringFilters = filters.catering;
    const globalFilters = filters.global;

    const convertedDietaryOptions = cateringFilters.dietaryRestrictions.length > 0
      ? convertDietaryOptions(cateringFilters.dietaryRestrictions)
      : undefined;

    return {

      lat: locationCoordinates?.lat,
      lng: locationCoordinates?.lng,
      location: (!locationCoordinates?.lat && !locationCoordinates?.lng && globalFilters.location)
        ? globalFilters.location
        : undefined,
      serviceName: globalFilters.searchQuery?.trim() || undefined,
      serviceStyle: cateringFilters.serviceStyles.length > 0
        ? cateringFilters.serviceStyles.join(',')
        : undefined,
      cuisineTypes: cateringFilters.cuisineTypes.length > 0
        ? cateringFilters.cuisineTypes
        : undefined,
      dietaryOptions: convertedDietaryOptions,
      minGuestCount: cateringFilters.guestCapacity[0] !== 1 ? cateringFilters.guestCapacity[0] : undefined,
      maxGuestCount: cateringFilters.guestCapacity[1] !== 1000 ? cateringFilters.guestCapacity[1] : undefined,
      minPrice: cateringFilters.priceRange[0] !== 0 ? cateringFilters.priceRange[0] : undefined,
      maxPrice: cateringFilters.priceRange[1] !== 500 ? cateringFilters.priceRange[1] : undefined,
    };
  }, [
    filters.global.location,
    filters.global.searchQuery,
    locationCoordinates?.lat,
    locationCoordinates?.lng,
    filters.catering.serviceStyles.join(','),
    filters.catering.cuisineTypes.join(','),
    filters.catering.dietaryRestrictions.join(','),
    filters.catering.guestCapacity[0],
    filters.catering.guestCapacity[1],
    filters.catering.priceRange[0],
    filters.catering.priceRange[1]
  ]);


  useEffect(() => {
    setCurrentPage(1);
  }, [JSON.stringify(apiFilters), locationCoordinates?.lat, locationCoordinates?.lng]);

  const {
    services,
    isLoading,
    error,
    pagination
  } = useUnifiedMarketplace({
    activeTab: SERVICE_TYPES.ALL,
    isTabVisible: isTabLoaded,
    vendorMode,
    showAllServices: false,
    enablePagination: true,
    page: currentPage,
    limit: itemsPerPage,
    filters: apiFilters
  });


  return (
    <div className="space-y-6">
      <ServiceSection
        services={services}
        serviceType="all"
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

export default AllTab;
