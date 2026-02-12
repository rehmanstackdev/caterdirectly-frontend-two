import { createContext, useContext, useState, ReactNode, useMemo, useCallback, FC } from 'react';
import { ServiceItem } from '@/types/service-types';
import { ServiceSelection } from '@/types/order';
import { calculateDistance } from '@/utils/location-utils';

interface GlobalFilters {
  searchQuery: string;
  location: string;
  locationCoordinates?: { lat: number; lng: number };
  timeSlot: string;
}

interface CateringFilters {
  priceRange: [number, number];
  guestCapacity: [number, number];
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  serviceStyles: string[];
}

interface VenueFilters {
  priceRange: [number, number];
  guestCapacity: [number, number];
  amenities: string[];
}

interface RentalFilters {
  priceRange: [number, number];
  categories: string[];
  deliveryOptions: string[];
}

interface StaffingFilters {
  hourlyRate: [number, number];
  roles: string[];
  experience: string[];
  availability: string[];
}

interface FilterState {
  global: GlobalFilters;
  catering: CateringFilters;
  venues: VenueFilters;
  rentals: RentalFilters;
  staffing: StaffingFilters;
}

interface FilterContextType {
  filters: FilterState;
  updateGlobalFilter: <K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => void;
  updateLocationFilter: (location: string, coordinates?: { lat: number; lng: number }) => void;
  updateCateringFilter: <K extends keyof CateringFilters>(key: K, value: CateringFilters[K]) => void;
  updateVenueFilter: <K extends keyof VenueFilters>(key: K, value: VenueFilters[K]) => void;
  updateRentalFilter: <K extends keyof RentalFilters>(key: K, value: RentalFilters[K]) => void;
  updateStaffingFilter: <K extends keyof StaffingFilters>(key: K, value: StaffingFilters[K]) => void;
  clearFilters: (serviceType?: string) => void;
  clearAllServiceFilters: () => void;
  filteredServices: ServiceItem[];
  setServices: (services: ServiceItem[]) => void;
  serviceType: string;
  setServiceType: (type: string) => void;
  existingServices: ServiceSelection[];
  setExistingServices: (services: ServiceSelection[]) => void;
}

const defaultFilters: FilterState = {
  global: {
    searchQuery: '',
    location: '',
    locationCoordinates: undefined,
    timeSlot: 'anytime'
  },
  catering: {
    priceRange: [0, 500],
    guestCapacity: [1, 1000],
    cuisineTypes: [],
    dietaryRestrictions: [],
    serviceStyles: []
  },
  venues: {
    priceRange: [0, 5000],
    guestCapacity: [1, 1000],
    amenities: []
  },
  rentals: {
    priceRange: [0, 1000],
    categories: [],
    deliveryOptions: []
  },
  staffing: {
    hourlyRate: [15, 100],
    roles: [],
    experience: [],
    availability: []
  }
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }
  return context;
};

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceType, setServiceType] = useState<string>('');
  const [existingServices, setExistingServices] = useState<ServiceSelection[]>([]);

  // Enhanced setServiceType that clears services when switching tabs
  const setServiceTypeWithClear = useCallback((type: string) => {
    // Clear services when switching to a different service type to prevent cross-contamination
    if (type !== serviceType) {
      setServices([]);
    }
    setServiceType(type);
  }, [serviceType]);

  const updateGlobalFilter = useCallback(<K extends keyof GlobalFilters>(key: K, value: GlobalFilters[K]) => {
    setFilters(prev => ({ 
      ...prev, 
      global: { ...prev.global, [key]: value }
    }));
  }, []);

  const updateLocationFilter = useCallback((location: string, coordinates?: { lat: number; lng: number }) => {
    setFilters(prev => ({ 
      ...prev, 
      global: { 
        ...prev.global, 
        location,
        locationCoordinates: coordinates
      }
    }));
  }, []);

  const updateCateringFilter = useCallback(<K extends keyof CateringFilters>(key: K, value: CateringFilters[K]) => {
    setFilters(prev => ({ 
      ...prev, 
      catering: { ...prev.catering, [key]: value }
    }));
  }, []);

  const updateVenueFilter = useCallback(<K extends keyof VenueFilters>(key: K, value: VenueFilters[K]) => {
    setFilters(prev => ({ 
      ...prev, 
      venues: { ...prev.venues, [key]: value }
    }));
  }, []);

  const updateRentalFilter = useCallback(<K extends keyof RentalFilters>(key: K, value: RentalFilters[K]) => {
    setFilters(prev => ({ 
      ...prev, 
      rentals: { ...prev.rentals, [key]: value }
    }));
  }, []);

  const updateStaffingFilter = useCallback(<K extends keyof StaffingFilters>(key: K, value: StaffingFilters[K]) => {
    setFilters(prev => ({ 
      ...prev, 
      staffing: { ...prev.staffing, [key]: value }
    }));
  }, []);

  const clearFilters = useCallback((serviceType?: string) => {
    if (serviceType) {
      // Clear only specific service filters
      setFilters(prev => ({
        ...prev,
        [serviceType]: defaultFilters[serviceType as keyof FilterState]
      }));
    } else {
      // Clear all filters
      setFilters(defaultFilters);
    }
  }, []);

  // Clear all filters when switching tabs (service-specific + global location)
  const clearAllServiceFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      global: {
        ...prev.global,
        location: '',
        locationCoordinates: undefined
      },
      catering: defaultFilters.catering,
      venues: defaultFilters.venues,
      rentals: defaultFilters.rentals,
      staffing: defaultFilters.staffing
    }));
  }, []);

  // Normalize tags for consistent comparison
  const normalizeTag = (tag: string): string => {
    return tag.toLowerCase().replace(/[_\s]+/g, '_');
  };

  // Parse delivery range string (e.g., "0-5 miles", "5-25 miles") and return max miles
  const parseDeliveryRange = (rangeStr: string): { min: number; max: number } | null => {
    if (!rangeStr) return null;
    // Match patterns like "0-5 miles", "5-25 miles", "75-100 miles"
    const match = rangeStr.match(/(\d+)\s*-\s*(\d+)\s*miles?/i);
    if (match) {
      return { min: parseFloat(match[1]), max: parseFloat(match[2]) };
    }
    return null;
  };

  // Check if a catering service can deliver to the user's location
  const canDeliverToLocation = (service: ServiceItem, userLat: number, userLng: number): boolean => {
    // Get vendor coordinates from the service
    const vendorCoords = service.service_details?.vendor?.coordinates ||
                         service.service_details?.catering?.vendor?.coordinates;

    if (!vendorCoords?.lat || !vendorCoords?.lng) {
      console.log(`[DeliveryFilter] No vendor coordinates for service: ${service.name}`);
      return true; // Include services without coordinates (can't filter them)
    }

    // Get delivery ranges from the catering service - ensure it's an array
    const rawDeliveryRanges = service.service_details?.catering?.deliveryRanges ||
                              service.service_details?.deliveryRanges;
    const deliveryRanges = Array.isArray(rawDeliveryRanges) ? rawDeliveryRanges : [];

    if (deliveryRanges.length === 0) {
      console.log(`[DeliveryFilter] No delivery ranges for service: ${service.name}`);
      return true; // Include services without delivery ranges (can't filter them)
    }

    // Calculate distance from vendor to user's event location
    const distance = calculateDistance(vendorCoords.lat, vendorCoords.lng, userLat, userLng);
    console.log(`[DeliveryFilter] Service: ${service.name}, Vendor: [${vendorCoords.lat}, ${vendorCoords.lng}], User: [${userLat}, ${userLng}], Distance: ${distance.toFixed(2)} miles`);

    // Check if distance falls within any delivery range
    for (const range of deliveryRanges) {
      if (!range || !range.range) continue;
      const parsed = parseDeliveryRange(range.range);
      if (parsed && distance >= parsed.min && distance <= parsed.max) {
        console.log(`[DeliveryFilter] Service ${service.name} CAN deliver - distance ${distance.toFixed(2)} miles within range ${range.range}`);
        return true;
      }
    }

    // Find the maximum delivery range
    let maxRange = 0;
    for (const range of deliveryRanges) {
      if (!range || !range.range) continue;
      const parsed = parseDeliveryRange(range.range);
      if (parsed && parsed.max > maxRange) {
        maxRange = parsed.max;
      }
    }

    console.log(`[DeliveryFilter] Service ${service.name} CANNOT deliver - distance ${distance.toFixed(2)} miles exceeds max range ${maxRange} miles`);
    return false;
  };

  // Deep search helper functions
  const searchInMenuItems = (service: ServiceItem, query: string): boolean => {
    const menuItems = service.service_details?.menuItems || service.service_details?.catering?.menuItems || [];
    return menuItems.some(item => 
      item.name?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      // Check both camelCase and snake_case fields with normalization
      item.dietaryFlags?.some((flag: string) => normalizeTag(flag).includes(normalizeTag(query))) ||
      item.dietary_flags?.some((flag: string) => normalizeTag(flag).includes(normalizeTag(query))) ||
      item.allergenFlags?.some((flag: string) => normalizeTag(flag).includes(normalizeTag(query))) ||
      item.allergen_flags?.some((flag: string) => normalizeTag(flag).includes(normalizeTag(query)))
    );
  };

  // Helper function to get all dietary flags from menu items
  const getMenuItemDietaryFlags = (service: ServiceItem): string[] => {
    const menuItems = service.service_details?.menuItems || service.service_details?.catering?.menuItems || [];
    const allFlags: string[] = [];
    
    menuItems.forEach(item => {
      if (item.dietary_flags) {
        allFlags.push(...item.dietary_flags);
      }
    });
    
    return [...new Set(allFlags)]; // Remove duplicates
  };

  const searchInComboItems = (service: ServiceItem, query: string): boolean => {
    const comboCategories = service.service_details?.combo_categories || service.service_details?.catering?.combo_categories || [];
    return comboCategories.some(category =>
      category.name?.toLowerCase().includes(query) ||
      category.items?.some(item =>
        item.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
    );
  };

  const searchInServiceDetails = (service: ServiceItem, query: string): boolean => {
    const details = service.service_details;
    if (!details) return false;

    // Search in venue amenities
    if (details.venue_details?.amenities?.some(amenity => amenity.toLowerCase().includes(query))) {
      return true;
    }

    // Search in staff qualifications and specialties
    if (details.staff_details?.qualifications?.some(qual => qual.toLowerCase().includes(query)) ||
        details.staff_details?.specialties?.some(spec => spec.toLowerCase().includes(query))) {
      return true;
    }

    // Search in dietary options
    if (details.catering_details?.dietary_options?.some(option => option.toLowerCase().includes(query))) {
      return true;
    }

    return false;
  };

  // Apply filters to services based on service type - optimized with useMemo
  const filteredServices = useMemo(() => {
    if (!services.length) return [];
    
    let filtered = [...services];

    // Apply global filters to all services
    if (filters.global.searchQuery) {
      const query = filters.global.searchQuery.toLowerCase();
      
      // Only do deep search for queries longer than 2 characters for performance
      const useDeepSearch = query.length > 2;
      
      filtered = filtered.filter(service => {
        // Existing basic search (preserved for backward compatibility)
        const basicMatch = service.name?.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query) ||
          service.vendorName?.toLowerCase().includes(query) ||
          service.service_details?.cuisine?.toLowerCase().includes(query);

        // Deep search for detailed content
        const deepMatch = useDeepSearch && (
          searchInMenuItems(service, query) ||
          searchInComboItems(service, query) ||
          searchInServiceDetails(service, query)
        );

        return basicMatch || deepMatch;
      });
    }

    // Location-based filtering - different logic for catering (delivery range) vs other services (text match)
    if (filters.global.location) {
      const userCoords = filters.global.locationCoordinates;

      if (serviceType === 'catering' && userCoords?.lat && userCoords?.lng) {
        // For catering services with coordinates, filter by delivery range
        console.log('[FilterContext] Filtering catering services by delivery range to:', userCoords);
        filtered = filtered.filter(service => canDeliverToLocation(service, userCoords.lat, userCoords.lng));
      } else {
        // For other services or when no coordinates, use text-based location filter
        const location = filters.global.location.toLowerCase();
        filtered = filtered.filter(service =>
          service.location?.toLowerCase().includes(location)
        );
      }
    }

    // Apply service-specific filters based on service type
    if (serviceType === 'catering') {
      const cateringFilters = filters.catering;
      
      // Price filter (per person)
      if (cateringFilters.priceRange[0] > 0 || cateringFilters.priceRange[1] < 500) {
        filtered = filtered.filter(service => {
          const price = parseFloat(service.price.replace(/[^0-9.-]/g, '')) || 0;
          return price >= cateringFilters.priceRange[0] && price <= cateringFilters.priceRange[1];
        });
      }

      // Guest capacity filter
      if (cateringFilters.guestCapacity[0] > 1 || cateringFilters.guestCapacity[1] < 1000) {
        filtered = filtered.filter(service => {
          const capacity = service.service_details?.capacity;
          if (!capacity) return true;
          return capacity.min <= cateringFilters.guestCapacity[1] && capacity.max >= cateringFilters.guestCapacity[0];
        });
      }

      // Cuisine types filter
      if (cateringFilters.cuisineTypes.length > 0) {
        filtered = filtered.filter(service => {
          const cuisine = service.service_details?.cuisine || service.service_details?.catering_details?.cuisine;
          return cuisine && cateringFilters.cuisineTypes.some(type => 
            cuisine.toLowerCase().includes(type.toLowerCase())
          );
        });
      }

      // Dietary restrictions filter
      if (cateringFilters.dietaryRestrictions.length > 0) {
        filtered = filtered.filter(service => {
          // Check service-level dietary options (existing logic for backward compatibility)
          const serviceDietaryOptions = service.service_details?.catering_details?.dietary_options || [];
          const hasServiceLevelMatch = cateringFilters.dietaryRestrictions.every(restriction =>
            serviceDietaryOptions.some(option => normalizeTag(option) === normalizeTag(restriction))
          );
          
          // Check menu item dietary flags (new logic with both field variants)
          const menuItems = service.service_details?.menuItems || service.service_details?.catering?.menuItems || [];
          const hasMenuItemMatch = cateringFilters.dietaryRestrictions.every(restriction =>
            menuItems.some(item => {
              // Check both camelCase and snake_case fields
              const dietaryFlags = [
                ...(item.dietaryFlags || []),
                ...(item.dietary_flags || [])
              ];
              return dietaryFlags.some(flag => normalizeTag(flag) === normalizeTag(restriction));
            })
          );
          
          // Include service if it matches either service-level dietary options OR menu item dietary flags
          return hasServiceLevelMatch || hasMenuItemMatch;
        });
      }

      // Service styles filter - check both current and legacy storage locations
      if (cateringFilters.serviceStyles.length > 0) {
        filtered = filtered.filter(service => {
          // Check nested catering structure (new format)
          const serviceStyles = service.service_details?.catering?.serviceStyles || [];
          // Check legacy format
          const legacyServiceStyles = service.service_details?.serviceStyles || [];
          
          // Combine both possible locations
          const allServiceStyles = [...serviceStyles, ...legacyServiceStyles];
          
          // Check if any of the filter values match any of the service styles
          return cateringFilters.serviceStyles.some(filterStyle => 
            allServiceStyles.includes(filterStyle)
          );
        });
      }
    } else if (serviceType === 'venues' || serviceType === 'venue') {
      const venueFilters = filters.venues;
      
      // Price filter (total venue cost)
      if (venueFilters.priceRange[0] > 0 || venueFilters.priceRange[1] < 5000) {
        filtered = filtered.filter(service => {
          const price = parseFloat(service.price.replace(/[^0-9.-]/g, '')) || 0;
          return price >= venueFilters.priceRange[0] && price <= venueFilters.priceRange[1];
        });
      }

      // Guest capacity filter
      if (venueFilters.guestCapacity[0] > 1 || venueFilters.guestCapacity[1] < 1000) {
        filtered = filtered.filter(service => {
          const capacity = service.service_details?.capacity;
          if (!capacity) return true;
          return capacity.min <= venueFilters.guestCapacity[1] && capacity.max >= venueFilters.guestCapacity[0];
        });
      }

      // Amenities filter
      if (venueFilters.amenities.length > 0) {
        filtered = filtered.filter(service => {
          const amenities = service.service_details?.venue_details?.amenities || [];
          return venueFilters.amenities.every(amenity => amenities.includes(amenity));
        });
      }
    } else if (serviceType === 'party-rentals' || serviceType === 'party-rental') {
      const rentalFilters = filters.rentals;
      
      // Price filter (per item/day)
      if (rentalFilters.priceRange[0] > 0 || rentalFilters.priceRange[1] < 1000) {
        filtered = filtered.filter(service => {
          const price = parseFloat(service.price.replace(/[^0-9.-]/g, '')) || 0;
          return price >= rentalFilters.priceRange[0] && price <= rentalFilters.priceRange[1];
        });
      }
    } else if (serviceType === 'staff') {
      const staffFilters = filters.staffing;
      
      // Hourly rate filter
      if (staffFilters.hourlyRate[0] > 15 || staffFilters.hourlyRate[1] < 100) {
        filtered = filtered.filter(service => {
          const rate = parseFloat(service.price.replace(/[^0-9.-]/g, '')) || 0;
          return rate >= staffFilters.hourlyRate[0] && rate <= staffFilters.hourlyRate[1];
        });
      }
    }

    return filtered;
  }, [services, filters, serviceType]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    filters,
    updateGlobalFilter,
    updateLocationFilter,
    updateCateringFilter,
    updateVenueFilter,
    updateRentalFilter,
    updateStaffingFilter,
    clearFilters,
    clearAllServiceFilters,
    filteredServices,
    setServices,
    serviceType,
    setServiceType: setServiceTypeWithClear,
    existingServices,
    setExistingServices
  }), [
    filters,
    updateGlobalFilter,
    updateLocationFilter,
    updateCateringFilter,
    updateVenueFilter,
    updateRentalFilter,
    updateStaffingFilter,
    clearFilters,
    clearAllServiceFilters,
    filteredServices,
    setServiceTypeWithClear,
    serviceType,
    existingServices
  ]);

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
