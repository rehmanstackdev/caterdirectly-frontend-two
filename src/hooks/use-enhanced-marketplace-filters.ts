
import { useState, useEffect, useMemo } from 'react';
import { ServiceItem } from '@/types/service-types';
import { ServiceSelection } from '@/types/order';
import { useServiceCompatibility } from './use-service-compatibility';

interface FilterOptions {
  priceRange?: [number, number];
  guestCapacity?: [number, number];
  location?: string;
  eventDate?: string;
  eventStyle?: string;
  dietaryRestrictions?: string[];
  amenities?: string[];
  timeSlot?: string;
  searchQuery?: string;
  serviceSpecific?: Record<string, any>;
}

interface EnhancedFilterState {
  activeFilters: FilterOptions;
  contextualFilters: FilterOptions;
  compatibilityMode: boolean;
}

export const useEnhancedMarketplaceFilters = (
  services: ServiceItem[],
  serviceType: string,
  existingServices: ServiceSelection[] = []
) => {
  const [filterState, setFilterState] = useState<EnhancedFilterState>({
    activeFilters: {},
    contextualFilters: {},
    compatibilityMode: existingServices.length > 0,
  });

  const {
    compatibilityRules,
    checkServiceCompatibility,
    getCompatibleServices,
    getMissingServiceRecommendations
  } = useServiceCompatibility(existingServices);

  // Generate contextual filters based on existing services
  const contextualFilters = useMemo(() => {
    const filters: FilterOptions = {};

    if (compatibilityRules.location) {
      filters.location = compatibilityRules.location.address;
    }

    if (compatibilityRules.guestCount) {
      filters.guestCapacity = [compatibilityRules.guestCount * 0.8, compatibilityRules.guestCount * 1.2];
    }

    if (compatibilityRules.eventStyle) {
      filters.eventStyle = compatibilityRules.eventStyle;
    }

    // Service-specific contextual filters
    if (serviceType === 'venues') {
      const hasCatering = existingServices.some(s => s.serviceType === 'catering');
      if (hasCatering) {
        filters.serviceSpecific = {
          ...filters.serviceSpecific,
          cateringPolicy: ['allowed', 'preferred'],
        };
      }
    }

    if (serviceType === 'catering') {
      const venue = existingServices.find(s => s.serviceType === 'venues');
      if (venue) {
        filters.serviceSpecific = {
          ...filters.serviceSpecific,
          venueCompatible: true,
        };
      }
    }

    if (serviceType === 'staff') {
      if (compatibilityRules.eventStyle === 'formal') {
        filters.serviceSpecific = {
          ...filters.serviceSpecific,
          experienceLevel: ['senior', 'expert'],
          dresscode: 'formal',
        };
      }
    }

    if (serviceType === 'party-rentals') {
      const venue = existingServices.find(s => s.serviceType === 'venues');
      if (venue?.service_details?.venue_details?.amenities?.includes('outdoor_space')) {
        filters.serviceSpecific = {
          ...filters.serviceSpecific,
          outdoorSuitable: true,
        };
      }
    }

    return filters;
  }, [compatibilityRules, existingServices, serviceType]);

  // Update contextual filters when they change
  useEffect(() => {
    setFilterState(prev => ({
      ...prev,
      contextualFilters,
      compatibilityMode: existingServices.length > 0,
    }));
  }, [contextualFilters, existingServices.length]);

  // Apply all filters to services
  const filteredServices = useMemo(() => {
    let filtered = [...services];

    // Apply compatibility filtering first if in compatibility mode
    if (filterState.compatibilityMode) {
      filtered = getCompatibleServices(filtered);
    }

    // Apply contextual filters
    filtered = applyFilters(filtered, filterState.contextualFilters);

    // Apply user-defined filters
    filtered = applyFilters(filtered, filterState.activeFilters);

    return filtered;
  }, [services, filterState, getCompatibleServices]);

  // Update active filters
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: {
        ...prev.activeFilters,
        [key]: value,
      },
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterState(prev => ({
      ...prev,
      activeFilters: {},
    }));
  };

  // Toggle compatibility mode
  const toggleCompatibilityMode = () => {
    setFilterState(prev => ({
      ...prev,
      compatibilityMode: !prev.compatibilityMode,
    }));
  };

  // Get filter suggestions based on cart context
  const getFilterSuggestions = () => {
    const suggestions: Array<{ key: string; label: string; value: any }> = [];

    if (compatibilityRules.guestCount && !filterState.activeFilters.guestCapacity) {
      suggestions.push({
        key: 'guestCapacity',
        label: `Guest capacity around ${compatibilityRules.guestCount}`,
        value: [compatibilityRules.guestCount * 0.8, compatibilityRules.guestCount * 1.2],
      });
    }

    if (compatibilityRules.eventStyle && !filterState.activeFilters.eventStyle) {
      suggestions.push({
        key: 'eventStyle',
        label: `${compatibilityRules.eventStyle} style`,
        value: compatibilityRules.eventStyle,
      });
    }

    return suggestions;
  };

  // Get context-aware filter labels
  const getFilterLabels = () => {
    const labels: Record<string, string> = {};

    if (filterState.compatibilityMode) {
      labels.title = `${serviceType} compatible with your selections`;
      labels.subtitle = `Showing services that work with your existing bookings`;
    } else {
      labels.title = `All ${serviceType}`;
      labels.subtitle = `Browse all available services`;
    }

    return labels;
  };

  return {
    filteredServices,
    filterState,
    updateFilter,
    clearFilters,
    toggleCompatibilityMode,
    getFilterSuggestions,
    getFilterLabels,
    getMissingServiceRecommendations,
    checkServiceCompatibility,
    compatibilityRules,
  };
};

// Helper function to apply filters to services
function applyFilters(services: ServiceItem[], filters: FilterOptions): ServiceItem[] {
  return services.filter(service => {
    // Price range filter
    if (filters.priceRange) {
      const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false;
      }
    }

    // Guest capacity filter
    if (filters.guestCapacity && service.service_details?.capacity) {
      const capacity = service.service_details.capacity;
      if (capacity.max < filters.guestCapacity[0] || capacity.min > filters.guestCapacity[1]) {
        return false;
      }
    }

    // Location filter
    if (filters.location && service.location) {
      if (!service.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }

    // Event style filter
    if (filters.eventStyle && service.service_details?.suitable_styles) {
      if (!service.service_details.suitable_styles.includes(filters.eventStyle)) {
        return false;
      }
    }

    // Dietary restrictions filter
    if (filters.dietaryRestrictions && service.service_details?.catering_details?.dietary_options) {
      const hasAllRestrictions = filters.dietaryRestrictions.every(restriction =>
        service.service_details.catering_details.dietary_options.includes(restriction)
      );
      if (!hasAllRestrictions) {
        return false;
      }
    }

    // Amenities filter
    if (filters.amenities && service.service_details?.venue_details?.amenities) {
      const hasAllAmenities = filters.amenities.every(amenity =>
        service.service_details.venue_details.amenities.includes(amenity)
      );
      if (!hasAllAmenities) {
        return false;
      }
    }

    // Service-specific filters
    if (filters.serviceSpecific) {
      const specific = filters.serviceSpecific;
      
      // Venue catering policy filter
      if (specific.cateringPolicy && service.service_details?.venue_details?.catering_policy) {
        if (!specific.cateringPolicy.includes(service.service_details.venue_details.catering_policy)) {
          return false;
        }
      }

      // Staff experience level filter
      if (specific.experienceLevel && service.service_details?.staff_details?.experience_level) {
        if (!specific.experienceLevel.includes(service.service_details.staff_details.experience_level)) {
          return false;
        }
      }

      // Outdoor suitable filter for rentals
      if (specific.outdoorSuitable && service.service_details?.rental_details) {
        if (!service.service_details.rental_details.outdoor_suitable) {
          return false;
        }
      }
    }

    return true;
  });
}
