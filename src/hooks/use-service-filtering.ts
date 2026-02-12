
import { useState, useEffect } from 'react';
import { useLocation } from '@/hooks/use-location';
import { filterServicesByLocation } from '@/utils/location-utils';
import { ServiceItem, ServiceStatus, ServiceType } from '@/types/service-types';

interface UseServiceFilteringProps {
  services: ServiceItem[];
  serviceType?: string;
}

export const useServiceFiltering = ({ 
  services, 
  serviceType 
}: UseServiceFilteringProps) => {
  const [filteredServices, setFilteredServices] = useState<ServiceItem[]>([]);
  const { coordinates, locationSet } = useLocation();

  // Effect to filter services whenever the inputs change
  useEffect(() => {
    const filterServices = async () => {
      console.log(`[useServiceFiltering] Filtering ${services.length} services for type: ${serviceType}`);
      
      // Only show services that are approved and active
      let visibleServices = services.filter(service => {
        const isApproved = service.status === 'approved' || service.status === undefined;
        const isActive = service.active === true || service.active === undefined || service.available === true;
        
        // Log services that are being filtered out
        if (!isApproved || !isActive) {
          console.log(`[useServiceFiltering] Filtering out service ${service.id} - ${service.name}:`, {
            status: service.status,
            active: service.active,
            available: service.available
          });
        }
        
        return isApproved && isActive;
      });
      
      console.log(`[useServiceFiltering] After status/active filtering: ${visibleServices.length} services remain`);
      
      // Only filter by location if location is explicitly set
      if (locationSet && coordinates) {
        console.log(`[useServiceFiltering] Applying location filter for: lat=${coordinates.lat}, lng=${coordinates.lng}`);
        
        // Cast services to ensure type compatibility with filterServicesByLocation
        const servicesWithValidType = visibleServices.map(service => ({
          ...service,
          type: service.type as ServiceType,
          active: service.active ?? true,
          status: service.status || 'approved' as ServiceStatus,
          createdAt: service.createdAt || new Date().toISOString(),
          updatedAt: service.updatedAt || new Date().toISOString()
        }));
        
        // Handle the async nature of filterServicesByLocation
        visibleServices = await filterServicesByLocation(
          servicesWithValidType, 
          coordinates.lat, 
          coordinates.lng
        );
        
        console.log(`[useServiceFiltering] After location filtering: ${visibleServices.length} services remain`);
      }
      
      setFilteredServices(visibleServices);
    };

    filterServices();
  }, [services, serviceType, locationSet, coordinates]);

  return {
    filteredServices,
    isLoading: false,
    error: null
  };
};
