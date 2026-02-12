
import { useState, useMemo, useEffect } from 'react';
import { useUnifiedMarketplace } from '@/hooks/use-unified-marketplace-service';
import { SERVICE_TYPES } from '@/utils/service-type-utils';
import { ServiceSelection } from '@/types/order';
import { useFilterContext } from '@/contexts/FilterContext';
import ServiceSection from '../ServiceSection';
import MarketplacePagination from '../MarketplacePagination';

interface StaffTabProps {
  isTabLoaded: boolean;
  existingServices?: ServiceSelection[];
  isBookingMode?: boolean;
  vendorMode?: boolean;
}

const StaffTab = ({
  isTabLoaded,
  existingServices = [],
  isBookingMode = false,
  vendorMode = false
}: StaffTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { filters } = useFilterContext();

  // Map UI experience labels to API values
  const mapExperienceToApi = (experience: string): string => {
    const mapping: Record<string, string> = {
      'Entry Level (0-1 years)': 'entry_level',
      'Experienced (2-5 years)': 'experienced',
      'Senior (5+ years)': 'senior',
      'Expert (10+ years)': 'expert'
    };
    return mapping[experience] || experience.toLowerCase().replace(/\s+/g, '_');
  };

  // Convert FilterContext filters to API filters
  const apiFilters = useMemo(() => {
    const globalFilters = filters.global;
    const staffingFilters = filters.staffing;

    // Check if min or max hourly price differs from defaults (15, 100)
    const hasMinPriceFilter = staffingFilters.hourlyRate[0] !== 15;
    const hasMaxPriceFilter = staffingFilters.hourlyRate[1] !== 100;
    const hasPriceFilter = hasMinPriceFilter || hasMaxPriceFilter;

    // Map experience levels to API format
    const experienceLevels = staffingFilters.experience.length > 0
      ? staffingFilters.experience.map(mapExperienceToApi)
      : undefined;

    return {
      // Location filter - matches against vendor fullAddress using partial text matching
      location: globalFilters.location || undefined,
      // Search query - matches against service name, description, vendor name on backend
      serviceName: globalFilters.searchQuery?.trim() || undefined,
      // Event staff pricing type - send hourly_rate when any price filter is applied
      eventStaffPricingType: hasPriceFilter ? 'hourly_rate' as const : undefined,
      // Hourly rate range filters - send individually when they differ from defaults
      minEventHourlyPrice: hasMinPriceFilter ? staffingFilters.hourlyRate[0] : undefined,
      maxEventHourlyPrice: hasMaxPriceFilter ? staffingFilters.hourlyRate[1] : undefined,
      // Experience level filter - comma-separated values
      eventStaffExperienceLevel: experienceLevels,
    };
  }, [
    filters.global.location,
    filters.global.searchQuery,
    filters.staffing.hourlyRate[0],
    filters.staffing.hourlyRate[1],
    filters.staffing.experience.join(',')
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
    activeTab: SERVICE_TYPES.STAFF_TAB,
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
        serviceType={SERVICE_TYPES.STAFF}
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

export default StaffTab;
