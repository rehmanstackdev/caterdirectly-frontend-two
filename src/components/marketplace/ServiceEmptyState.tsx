

import { Button } from '@/components/ui/button';
import { MapPin, Search, Plus } from 'lucide-react';
import { useLocation } from '@/hooks/use-location';
import { getDisplayCity } from '@/utils/address-utils';

interface ServiceEmptyStateProps {
  serviceType: string | undefined;
  address?: string;
  locationSet: boolean;
  showingLocationFiltered?: boolean;
  onToggleLocationFilter?: () => void;
}

const ServiceEmptyState = ({ 
  serviceType, 
  address, 
  locationSet, 
  showingLocationFiltered = false,
  onToggleLocationFilter 
}: ServiceEmptyStateProps) => {
  const { explicitLocationFilter, disableLocationFiltering } = useLocation();
  
  const formatServiceType = (type: string) => {
    if (!type) return 'services';
    return type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ');
  };

  // If location filtering is active but no results, suggest expanding search
  if (explicitLocationFilter && locationSet && showingLocationFiltered) {
    return (
      <div className="w-full p-6 md:p-10 bg-blue-50 rounded-lg border border-blue-200 text-center">
        <div className="flex flex-col items-center max-w-lg mx-auto">
          <div className="bg-blue-100 p-3 rounded-full mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No {formatServiceType(serviceType)} services found in your area
          </h3>
          
          {address && (
            <p className="text-gray-600 mb-4">
              We couldn't find any services near <strong>{getDisplayCity(address)}</strong>
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={disableLocationFiltering}
              className="bg-[#F07712] hover:bg-[#F07712]/90"
            >
              <Search className="h-4 w-4 mr-2" />
              Show All Services
            </Button>
            
            {onToggleLocationFilter && (
              <Button 
                onClick={onToggleLocationFilter}
                variant="outline"
                className="border-blue-300 hover:bg-blue-50"
              >
                Try Different Location
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // True empty state - no services exist on the platform
  return (
    <div className="w-full p-6 md:p-10 bg-gray-50 rounded-lg border border-gray-200 text-center">
      <div className="flex flex-col items-center max-w-lg mx-auto">
        <div className="bg-gray-100 p-3 rounded-full mb-4">
          <Plus className="h-6 w-6 text-gray-600" />
        </div>
        
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          No {formatServiceType(serviceType)} services available yet
        </h3>
        
        <p className="text-gray-600 mb-4">
          We're working hard to bring amazing {formatServiceType(serviceType).toLowerCase()} services to the platform.
        </p>
        
        <p className="text-sm text-gray-500">
          Check back soon or explore other service categories!
        </p>
      </div>
    </div>
  );
};

export default ServiceEmptyState;
