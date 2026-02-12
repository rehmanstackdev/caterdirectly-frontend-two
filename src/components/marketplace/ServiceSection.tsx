
import { useMemo, useEffect } from 'react';
import { useLocation } from '@/hooks/use-location';
import { ServiceItem } from '@/types/service-types';
import { ServiceSelection } from '@/types/order';
import { useServiceDetails } from '@/hooks/use-service-details';
import { useFilterContext } from '@/contexts/FilterContext';
import OptimizedServiceGrid from './grid/OptimizedServiceGrid';
import ServiceDetailsContainer from './details/ServiceDetailsContainer';
import { useServiceImagesPreloader } from '@/hooks/use-service-preloader';

interface ServiceSectionProps {
  services: ServiceItem[];
  serviceType?: string;
  isLoading?: boolean;
  error?: string | null;
  isTabLoaded?: boolean;
  existingServices?: ServiceSelection[];
  showingLocationFiltered?: boolean;
  enableFilterContext?: boolean;
  showAllServices?: boolean; // Skip status/active filtering when true
}

const ServiceSection = ({
  services,
  serviceType,
  isLoading = false,
  error = null,
  isTabLoaded = false,
  existingServices = [],
  showingLocationFiltered = false,
  enableFilterContext = false,
  showAllServices = false
}: ServiceSectionProps) => {
  const { address, locationSet } = useLocation();

  // Track when services prop changes
  useEffect(() => {
    // Services updated
  }, [services, isLoading, serviceType]);
  
  // Service details handling
  const {
    selectedService,
    handleOpenDetails,
    handleCloseDetails,
    handleBookService
  } = useServiceDetails();
  
  // Always get FilterContext but only use it when enabled
  const filterContext = useFilterContext();
  
  // Update FilterContext with service type immediately when enabled (before services load)
  useEffect(() => {
    if (enableFilterContext && serviceType) {
      filterContext.setServiceType(serviceType);
    }
  }, [enableFilterContext, serviceType, filterContext.setServiceType]);

  // Update FilterContext with services (including empty arrays for filtered results)
  useEffect(() => {
    if (enableFilterContext) {
      filterContext.setServices(services);
    }
  }, [enableFilterContext, services, filterContext.setServices]);
  
  // Filter services - when using API filters, always use the services prop (already filtered by API)
  // Only use FilterContext filteredServices for client-side filtering scenarios
  const displayServices = useMemo(() => {
    // Always use the services prop passed from the tab component
    // The tab component handles API filtering, so this data is already filtered
    const sourceServices = services;

    // Skip status/active filtering when showAllServices is true
    if (showAllServices) {
      return sourceServices;
    }

    // Filter by approved status and active state
    const filtered = sourceServices.filter(service =>
      service.status === 'approved' && service.active !== false
    );

    return filtered;
  }, [services, showAllServices]);
  
  // Only preload images if tab is loaded to avoid unnecessary requests
  useServiceImagesPreloader(
    isTabLoaded ? displayServices : [], 
    { priority: false }
  );
  
  return (
    <>
      <OptimizedServiceGrid
        services={displayServices}
        currentPage={1}
        totalPages={1}
        onPageChange={() => {}}
        onViewDetails={handleOpenDetails}
        serviceType={serviceType}
        address={address}
        locationSet={locationSet}
        isLoading={isLoading}
        error={error}
        isTabLoaded={isTabLoaded}
        existingServices={existingServices}
        showingLocationFiltered={showingLocationFiltered}
      />
      
      <ServiceDetailsContainer
        service={selectedService}
        isOpen={!!selectedService}
        onClose={handleCloseDetails}
        onBookService={handleBookService}
      />
    </>
  );
};

export default ServiceSection;
