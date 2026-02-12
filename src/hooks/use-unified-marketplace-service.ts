
/**
 * Unified Marketplace Hook
 * Consolidates all marketplace functionality into a single optimized hook
 * Fixes conflicts between multiple hooks and provides consistent service management
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceItem, ServiceStatus, PriceType } from '@/types/service-types';
import { useLocation } from './use-location';
import { useAuth } from '@/contexts/auth';
import { normalizeServiceType, SERVICE_TYPES, ServiceType } from '@/utils/service-type-utils';
import { filterServicesByLocation } from '@/utils/location-utils';
import { getCityStateDisplay } from '@/utils/address-utils';
import ServicesService, { ServiceFilters, PaginatedServicesResponse } from '@/services/api/services.Service';

interface UseUnifiedMarketplaceOptions {
  activeTab: ServiceType;
  searchQuery?: string;
  filters?: {
    price?: 'low' | 'medium' | 'high' | 'any';
    rating?: number;
    location?: string;
    // Coordinates for delivery range filtering (catering)
    lat?: number;
    lng?: number;
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity';
    // Search filter - matches against service name, description, vendor name
    serviceName?: string;
    // Advanced API filters
    serviceStyle?: string;
    cuisineTypes?: string[];
    dietaryOptions?: string[];
    minGuestCount?: number;
    maxGuestCount?: number;
    minPrice?: number;
    maxPrice?: number;
    // Advanced API filters - Venues
    venueMinPrice?: number;
    venueMaxPrice?: number;
    seatedCapacityMin?: number;
    seatedCapacityMax?: number;
    // Advanced API filters - Party Rentals
    minPartyPrice?: number;
    maxPartyPrice?: number;
    deliveryAvailable?: boolean;
    setupIncluded?: boolean;
    pickupAvailable?: boolean;
    // Advanced API filters - Event Staff
    eventStaffPricingType?: 'hourly_rate' | 'flat_rate';
    minEventHourlyPrice?: number;
    maxEventHourlyPrice?: number;
    eventStaffExperienceLevel?: string[];
  };
  isTabVisible?: boolean;
  enableSearch?: boolean;
  vendorMode?: boolean;
  showAllServices?: boolean; // Option to show all services regardless of status/active/available
  // Pagination options
  page?: number;
  limit?: number;
  enablePagination?: boolean;
}

interface MarketplaceState {
  services: ServiceItem[];
  searchResults: ServiceItem[];
  filteredServices: ServiceItem[];
  isLoading: boolean;
  isSearching: boolean;
  error: string | null;
  searchError: string | null;
  hasActiveSearch: boolean;
  showingLocationFiltered: boolean;
  // Pagination state
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes (extended for better performance)
const serviceCache = new Map<string, { data: ServiceItem[], timestamp: number }>();

// Cache invalidation functions
const clearServiceCacheForVendor = (vendorId: string) => {
  // Clear all cache entries that might contain services from this vendor
  for (const [key] of serviceCache.entries()) {
    serviceCache.delete(key);
  }
};

// Expose cache clearing function globally for vendor updates
if (typeof window !== 'undefined') {
  (window as any).clearServiceCaches = clearServiceCacheForVendor;
}

export const useUnifiedMarketplace = (options: UseUnifiedMarketplaceOptions) => {
  const { coordinates, locationSet, explicitLocationFilter } = useLocation();
  const { user } = useAuth();


  const [state, setState] = useState<MarketplaceState>({
    services: [],
    searchResults: [],
    filteredServices: [],
    isLoading: false,
    isSearching: false,
    error: null,
    searchError: null,
    hasActiveSearch: false,
    showingLocationFiltered: false,
    pagination: undefined
  });

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSearchQueryRef = useRef('');
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Listen for vendor address updates
    const handleVendorUpdate = (event: CustomEvent) => {
      clearServiceCacheForVendor(event.detail.vendorId);
      // Trigger a refresh of current services after a brief delay
      if (options.isTabVisible) {
        setTimeout(() => {
          // Clear all cache and trigger re-fetch by updating state
          serviceCache.clear();
          setState(prev => ({ ...prev, isLoading: true }));
        }, 100);
      }
    };
    
    window.addEventListener('vendor-address-updated', handleVendorUpdate as EventListener);
    
    return () => {
      isMountedRef.current = false;
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      window.removeEventListener('vendor-address-updated', handleVendorUpdate as EventListener);
    };
  }, [options.isTabVisible]);

  // Generate cache key for services - include filters to ensure proper cache invalidation
  const generateCacheKey = useCallback((serviceType: ServiceType, vendorMode: boolean, filters?: any) => {
    const vendorKey = vendorMode ? `vendor-${user?.id}` : 'all';
    const filterKey = filters ? JSON.stringify(filters) : 'no-filters';
    return `${serviceType}-${vendorKey}-${filterKey}`;
  }, [user?.id]);

  // Map marketplace service type to API service type format
  const mapServiceTypeToAPI = (serviceType: ServiceType): 'catering' | 'venues' | 'party_rentals' | 'events_staff' | undefined => {
    switch (serviceType) {
      case 'all':
        return undefined; // Don't send serviceType for 'all' - fetch all services
      case 'catering':
        return 'catering';
      case 'venues':
        return 'venues';
      case 'party_rentals':
      case 'party-rentals': // Handle both formats
        return 'party_rentals';
      case 'events_staff':
      case 'staff': // Handle both formats
        return 'events_staff';
      default:
        return undefined;
    }
  };

  // Fetch services from API
  const fetchServices = useCallback(async (serviceType: ServiceType, useCache = true): Promise<{ services: ServiceItem[], pagination?: MarketplaceState['pagination'] }> => {
    const cacheKey = generateCacheKey(serviceType, options.vendorMode || false, options.filters);

    // Check cache first (skip cache when pagination is enabled or filters are active)
    const hasActiveFilters = options.filters && Object.values(options.filters).some(v => v !== undefined && v !== null && v !== '');

    if (useCache && !options.enablePagination && !hasActiveFilters) {
      const cached = serviceCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
        return { services: cached.data, pagination: undefined };
      }
    }

    try {
      // Prepare API filters
      const apiFilters: ServiceFilters = {};

      // Map service type to API format
      const apiServiceType = mapServiceTypeToAPI(serviceType);
      if (apiServiceType) {
        apiFilters.serviceType = apiServiceType;
      }

      // Only apply status filter if showAllServices is false (default behavior)
      if (!options.showAllServices) {
        apiFilters.status = 'approved';
      }

      // Add pagination params if enabled
      if (options.enablePagination) {
        apiFilters.page = options.page || 1;
        apiFilters.limit = options.limit || 10;
      }

      // Add location filter - matches against vendor fullAddress using partial text matching
      if (options.filters?.location) {
        apiFilters.location = options.filters.location;
      }

      // Add serviceName search filter - matches against service name, description, vendor name
      if (options.filters?.serviceName) {
        apiFilters.serviceName = options.filters.serviceName;
      }

      // Add coordinate-based filtering from filter options (for delivery range filtering)
      if (options.filters?.lat !== undefined && options.filters?.lng !== undefined) {
        apiFilters.lat = options.filters.lat;
        apiFilters.lng = options.filters.lng;
        console.log('[UnifiedMarketplaceService] Applying coordinate filter from options:', { lat: apiFilters.lat, lng: apiFilters.lng });
      }

      // Add advanced filters from options - Catering
      if (options.filters?.serviceStyle) {
        apiFilters.serviceStyle = options.filters.serviceStyle;
      }
      if (options.filters?.cuisineTypes && options.filters.cuisineTypes.length > 0) {
        apiFilters.cuisineTypes = options.filters.cuisineTypes;
      }
      if (options.filters?.dietaryOptions && options.filters.dietaryOptions.length > 0) {
        apiFilters.dietaryOptions = options.filters.dietaryOptions;
      }
      if (options.filters?.minGuestCount !== undefined) {
        apiFilters.minGuestCount = options.filters.minGuestCount;
      }
      if (options.filters?.maxGuestCount !== undefined) {
        apiFilters.maxGuestCount = options.filters.maxGuestCount;
      }
      if (options.filters?.minPrice !== undefined) {
        apiFilters.minPrice = options.filters.minPrice;
      }
      if (options.filters?.maxPrice !== undefined) {
        apiFilters.maxPrice = options.filters.maxPrice;
      }

      // Add advanced filters from options - Venues
      if (options.filters?.venueMinPrice !== undefined) {
        apiFilters.venueMinPrice = options.filters.venueMinPrice;
      }
      if (options.filters?.venueMaxPrice !== undefined) {
        apiFilters.venueMaxPrice = options.filters.venueMaxPrice;
      }
      if (options.filters?.seatedCapacityMin !== undefined) {
        apiFilters.seatedCapacityMin = options.filters.seatedCapacityMin;
      }
      if (options.filters?.seatedCapacityMax !== undefined) {
        apiFilters.seatedCapacityMax = options.filters.seatedCapacityMax;
      }

      // Add advanced filters from options - Party Rentals
      if (options.filters?.minPartyPrice !== undefined) {
        apiFilters.minPartyPrice = options.filters.minPartyPrice;
      }
      if (options.filters?.maxPartyPrice !== undefined) {
        apiFilters.maxPartyPrice = options.filters.maxPartyPrice;
      }
      if (options.filters?.deliveryAvailable !== undefined) {
        apiFilters.deliveryAvailable = options.filters.deliveryAvailable;
      }
      if (options.filters?.setupIncluded !== undefined) {
        apiFilters.setupIncluded = options.filters.setupIncluded;
      }
      if (options.filters?.pickupAvailable !== undefined) {
        apiFilters.pickupAvailable = options.filters.pickupAvailable;
      }

      // Add advanced filters from options - Event Staff
      if (options.filters?.eventStaffPricingType) {
        apiFilters.eventStaffPricingType = options.filters.eventStaffPricingType;
      }
      if (options.filters?.minEventHourlyPrice !== undefined) {
        apiFilters.minEventHourlyPrice = options.filters.minEventHourlyPrice;
      }
      if (options.filters?.maxEventHourlyPrice !== undefined) {
        apiFilters.maxEventHourlyPrice = options.filters.maxEventHourlyPrice;
      }
      if (options.filters?.eventStaffExperienceLevel && options.filters.eventStaffExperienceLevel.length > 0) {
        apiFilters.eventStaffExperienceLevel = options.filters.eventStaffExperienceLevel;
      }

      // Fetch services from API
      // Use userId directly instead of vendorId
      const userId = user?.id;

      let services: any[] = [];
      let paginationData: MarketplaceState['pagination'] = undefined;

      // Use getServicesByVendorId when in vendor mode, otherwise use getServices
      if (options.vendorMode && userId) {
        if (options.enablePagination) {
          // Use paginated version for vendor mode with pagination support
          const paginatedResponse = await ServicesService.getServicesByVendorPaginated(userId, apiFilters);
          services = paginatedResponse.data || [];
          paginationData = paginatedResponse.pagination;
        } else {
          const apiResponse = await ServicesService.getServicesByVendorId(userId, apiFilters);
          services = Array.isArray(apiResponse) ? apiResponse : [];
        }
      } else if (options.enablePagination) {
        // Use paginated version for pagination support
        const paginatedResponse = await ServicesService.getServicesPaginated(apiFilters);
        services = paginatedResponse.data;
        paginationData = paginatedResponse.pagination;
      } else {
        const apiResponse = await ServicesService.getServices(apiFilters);
        services = Array.isArray(apiResponse) ? apiResponse : [];
      }

      // Transform API response to ServiceItem format
      const transformedData: ServiceItem[] = services
        .map((item: any) => {
          // Extract image based on service type from nested objects
          let serviceImage = item.image || item.serviceImage || '';

          // Check nested service objects for images based on service type
          const normalizedType = normalizeServiceType(item.serviceType || item.type) || serviceType;

          // Map tab format to database format for ServiceItem.type field
          const dbServiceType: 'catering' | 'venues' | 'party_rentals' | 'events_staff' = 
            normalizedType === 'party-rentals' ? 'party_rentals' :
            normalizedType === 'staff' ? 'events_staff' :
            normalizedType === 'party_rentals' ? 'party_rentals' :
            normalizedType === 'events_staff' ? 'events_staff' :
            normalizedType === 'catering' ? 'catering' :
            normalizedType === 'venues' ? 'venues' :
            'catering'; // fallback
          
          if (!serviceImage) {
            switch (normalizedType) {
              case 'party_rentals':
              case 'party-rentals':
                serviceImage = item.partyRental?.serviceImage || '';
                break;
              case 'events_staff':
              case 'staff':
                serviceImage = item.eventStaff?.serviceImage || '';
                break;
              case 'venues':
                serviceImage = item.venue?.serviceImage || '';
                break;
              case 'catering':
                // For catering, try menuPhoto first, then first menu item image
                serviceImage = item.catering?.menuPhoto || '';
                if (!serviceImage && item.catering?.menuItems?.length > 0) {
                  const firstMenuItemWithImage = item.catering.menuItems.find((mi: any) => mi.imageUrl);
                  serviceImage = firstMenuItemWithImage?.imageUrl || '';
                }
                break;
            }
          }
          
          // Extract price from nested objects if not at root level
          let servicePrice = item.price || item.servicePrice || '$0';
          if (!servicePrice || servicePrice === '$0') {
            let rawPrice = '';
            switch (normalizedType) {
              case 'party_rentals':
              case 'party-rentals':
                rawPrice = item.partyRental?.price || '';
                break;
              case 'events_staff':
              case 'staff':
                rawPrice = item.eventStaff?.price || '';
                break;
              case 'venues':
                rawPrice = item.venue?.price || '';
                break;
              case 'catering':
                // Catering doesn't have a single price, use minimum order amount
                rawPrice = item.catering?.minimumOrderAmount || '';
                break;
            }
            // Format price string (e.g., "150.00" -> "$150.00")
            if (rawPrice) {
              const numPrice = parseFloat(rawPrice);
              servicePrice = isNaN(numPrice) ? '$0' : `$${numPrice.toFixed(2)}`;
            } else {
              servicePrice = '$0';
            }
          } else if (typeof servicePrice === 'string' && !servicePrice.startsWith('$')) {
            // Format price if it's a number string without dollar sign
            const numPrice = parseFloat(servicePrice);
            servicePrice = isNaN(numPrice) ? '$0' : `$${numPrice.toFixed(2)}`;
          }
          
          // Extract price type from nested objects
          let priceType = item.price_type || item.priceType || 'flat_rate';
          if (!priceType || priceType === 'flat_rate') {
            switch (normalizedType) {
              case 'party_rentals':
              case 'party-rentals':
                priceType = item.partyRental?.pricingType || 'flat_rate';
                break;
              case 'events_staff':
              case 'staff':
                priceType = item.eventStaff?.pricingType || 'flat_rate';
                break;
              case 'venues':
                priceType = item.venue?.pricingType || 'flat_rate';
                break;
            }
          }
          
          return {
            id: item.id || item.serviceId || '',
            name: item.name || item.serviceName || 'Unnamed Service',
            type: dbServiceType,
            serviceType: normalizedType,
            description: item.description || '',
            price: servicePrice,
            price_type: priceType as PriceType,
            image: serviceImage,
            vendorName: item.vendorName || item.vendor_name || item.vendor?.businessName || item.vendor?.company_name || 'Unknown Vendor',
            vendor_id: item.vendor_id || item.vendorId || item.vendor?.id || '',
            location: (item.vendor?.city && item.vendor?.state) ? `${item.vendor.city}, ${item.vendor.state}` : getCityStateDisplay(item.vendor?.fullAddress || item.vendor?.full_address || item.location || ''),
            rating: item.rating?.toString() || item.vendor?.reviews?.averageRating?.toString() || (item.vendor?.reviews?.averageRating !== undefined ? item.vendor.reviews.averageRating.toFixed(1) : '0'),
            reviews: item.reviews?.toString() || item.vendor?.reviews?.totalReviews?.toString() || (item.vendor?.reviews?.totalReviews !== undefined ? item.vendor.reviews.totalReviews.toString() : '0'),
            service_details: {
              ...(item.service_details || item.serviceDetails || {}),
              ...(item.partyRental && { partyRental: item.partyRental }),
              ...(item.catering && { catering: item.catering }),
              ...(item.eventStaff && { eventStaff: item.eventStaff }),
              ...(item.venue && { venue: item.venue }),
              // Preserve createdBy and vendor details
              ...(item.createdBy && { createdBy: item.createdBy }),
              ...(item.vendor && { vendor: item.vendor })
            },
            status: (item.status || 'approved') as ServiceStatus,
            active: item.active !== undefined ? item.active : true,
            available: item.available !== undefined ? item.available : true,
            isManaged: item.is_managed || item.isManaged || false,
            createdAt: item.createdAt || item.created_at,
            updatedAt: item.updatedAt || item.updated_at,
            adminFeedback: item.adminFeedback || item.admin_feedback
          };
        })
        .sort((a, b) => {
          // Sort by created date descending
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

      // Cache the results (only when not using pagination)
      if (!options.enablePagination) {
        serviceCache.set(cacheKey, { data: transformedData, timestamp: Date.now() });
      }

      return { services: transformedData, pagination: paginationData };
    } catch (error: any) {
      console.error('[UnifiedMarketplace] Error fetching services from API:', error);
      throw error;
    }
  }, [generateCacheKey, options.vendorMode, options.showAllServices, options.enablePagination, options.page, options.limit, options.filters, user]);

  // Apply location filtering when explicitly requested
  const applyLocationFiltering = useCallback(async (services: ServiceItem[]) => {
    if (!explicitLocationFilter || !locationSet || !coordinates) {
      return { services, isFiltered: false };
    }

    try {
      const filteredServices = await filterServicesByLocation(services, coordinates.lat, coordinates.lng);

      // If location filtering returns no results, fall back to all services
      if (filteredServices.length === 0) {
        return { services, isFiltered: false };
      }

      return { services: filteredServices, isFiltered: true };
    } catch (error) {
      console.error('[UnifiedMarketplace] Error applying location filter:', error);
      return { services, isFiltered: false };
    }
  }, [explicitLocationFilter, locationSet, coordinates]);

  // Perform search using database function
  const performSearch = useCallback(async (query: string, serviceType: ServiceType) => {
    if (!query.trim()) return [];

    try {
      // Convert tab service type to database service type for search
      const dbServiceType = mapServiceTypeToAPI(serviceType) || serviceType;
      
      const { data, error } = await supabase.rpc('search_services', {
        search_query: query,
        service_type_filter: dbServiceType,
        location_filter: null,
        limit_count: 50,
        offset_count: 0
      });

      if (error) throw error;

      let results = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        type: normalizeServiceType(item.type) || 'catering',
        serviceType: normalizeServiceType(item.service_type || item.type) || 'catering',
        description: item.description || '',
        price: item.price || '$0',
        price_type: (item.price_type || 'flat_rate') as PriceType,
        image: item.image || '',
        vendorName: item.vendor_name || item.vendors?.businessName || item.vendors?.company_name || 'Unknown Vendor',
        vendor_id: item.vendor_id || item.vendors?.id || '',
        location: (item.vendors?.city && item.vendors?.state) ? `${item.vendors.city}, ${item.vendors.state}` : getCityStateDisplay(item.vendors?.full_address || item.vendors?.fullAddress || ''),
        rating: item.rating || '0',
        reviews: item.reviews || '0',
        service_details: {
          ...(item.service_details || {}),
          // Preserve createdBy and vendor details if available
          ...(item.createdBy && { createdBy: item.createdBy }),
          ...(item.vendor && { vendor: item.vendor }),
          ...(item.vendors && { vendor: item.vendors })
        },
        status: (item.status || 'approved') as ServiceStatus,
        active: item.active,
        available: item.available,
        isManaged: item.is_managed,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        adminFeedback: item.admin_feedback
      }));

      // Apply vendor filtering to search results if in vendor mode
      if (options.vendorMode && user) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (vendorData) {
          results = results.filter(service => service.vendor_id === vendorData.id);
        } else {
          results = [];
        }
      }

      return results;
    } catch (error: any) {
      console.error('[UnifiedMarketplace] Search error:', error);
      throw error;
    }
  }, [options.vendorMode, user]);

  // Apply filters and sorting to services - properly memoized
  const processServices = useCallback((services: ServiceItem[], filters: any) => {
    let processed = [...services];

    // Apply price filter
    if (filters?.price && filters.price !== 'any') {
      processed = processed.filter(service => {
        const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
        switch (filters.price) {
          case 'low': return price < 50;
          case 'medium': return price >= 50 && price < 200;
          case 'high': return price >= 200;
          default: return true;
        }
      });
    }

    // Apply rating filter
    if (filters?.rating) {
      processed = processed.filter(service => {
        const rating = parseFloat(service.rating || '0');
        return rating >= filters.rating!;
      });
    }

    // Apply sorting
    if (filters?.sortBy) {
      processed.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc':
            return parseFloat(a.price.replace(/[^0-9.]/g, '')) - parseFloat(b.price.replace(/[^0-9.]/g, ''));
          case 'price_desc':
            return parseFloat(b.price.replace(/[^0-9.]/g, '')) - parseFloat(a.price.replace(/[^0-9.]/g, ''));
          case 'rating':
            return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
          case 'popularity':
            return parseInt(b.reviews || '0') - parseInt(a.reviews || '0');
          default:
            return 0;
        }
      });
    }

    return processed;
  }, []); // Pure function - no external dependencies needed

  // Load services effect
  useEffect(() => {
    if (!options.isTabVisible) return;

    const loadServices = async () => {
      if (!isMountedRef.current) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const { services: rawServices, pagination } = await fetchServices(options.activeTab);

        // Check if we have API filters (location, minGuestCount, maxGuestCount, etc.) or client-side filters (price: 'low', rating, sortBy)
        const hasApiFilters = options.filters && (
          options.filters.location !== undefined ||
          options.filters.minGuestCount !== undefined ||
          options.filters.maxGuestCount !== undefined ||
          options.filters.minPrice !== undefined ||
          options.filters.maxPrice !== undefined ||
          options.filters.serviceStyle !== undefined ||
          options.filters.dietaryOptions !== undefined
        );

        // Only apply client-side processing if we're NOT using API filters
        // API filters are handled server-side, so the data is already filtered
        const processedServices = hasApiFilters ? rawServices : processServices(rawServices, options.filters);

        // Apply location filtering if explicitly requested
        const { services: finalServices, isFiltered } = await applyLocationFiltering(processedServices);

        if (isMountedRef.current) {
          console.log('[useUnifiedMarketplace] 🔄 Updating state with filtered results:', {
            rawServicesCount: rawServices.length,
            finalServicesCount: finalServices.length,
            pagination,
            hasApiFilters
          });

          setState(prev => ({
            ...prev,
            services: rawServices,
            filteredServices: finalServices,
            isLoading: false,
            error: null,
            showingLocationFiltered: isFiltered,
            pagination
          }));
        }
      } catch (error: any) {
        console.error('[UnifiedMarketplace.useEffect] ❌ Error loading services:', error);
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error.message || 'Failed to load services'
          }));
        }
      }
    };

    loadServices();
  }, [
    options.activeTab,
    options.isTabVisible,
    JSON.stringify(options.filters), // Use JSON.stringify to detect filter changes
    options.vendorMode,
    options.showAllServices,
    options.enablePagination,
    options.page,
    options.limit,
    explicitLocationFilter,
    fetchServices,
    processServices,
    applyLocationFiltering
  ]);

  // Search effect with debouncing
  useEffect(() => {
    const query = options.searchQuery?.trim() || '';
    const hasActiveSearch = query.length > 0;

    setState(prev => ({ ...prev, hasActiveSearch }));

    if (!options.enableSearch || !hasActiveSearch) {
      setState(prev => ({ ...prev, searchResults: [], isSearching: false, searchError: null }));
      return;
    }

    if (query === lastSearchQueryRef.current) return;
    lastSearchQueryRef.current = query;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;

      setState(prev => ({ ...prev, isSearching: true, searchError: null }));

      try {
        const rawResults = await performSearch(query, options.activeTab);
        const processedResults = processServices(rawResults, options.filters);

        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            searchResults: processedResults,
            isSearching: false,
            searchError: null
          }));
        }
      } catch (error: any) {
        if (isMountedRef.current) {
          setState(prev => ({
            ...prev,
            isSearching: false,
            searchError: error.message || 'Search failed'
          }));
        }
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [options.searchQuery, options.enableSearch, options.activeTab, options.filters, performSearch, processServices]);

  // Refresh function
  const refreshServices = useCallback(() => {
    const cacheKey = generateCacheKey(options.activeTab, options.vendorMode || false, options.filters);
    serviceCache.delete(cacheKey);

    if (options.isTabVisible) {
      fetchServices(options.activeTab, false).then(({ services: rawServices, pagination }) => {
        if (isMountedRef.current) {
          // Check if we have API filters
          const hasApiFilters = options.filters && (
            options.filters.location !== undefined ||
            options.filters.minGuestCount !== undefined ||
            options.filters.maxGuestCount !== undefined ||
            options.filters.minPrice !== undefined ||
            options.filters.maxPrice !== undefined ||
            options.filters.serviceStyle !== undefined ||
            options.filters.dietaryOptions !== undefined
          );

          // Only apply client-side processing if we're NOT using API filters
          const processedServices = hasApiFilters ? rawServices : processServices(rawServices, options.filters);

          applyLocationFiltering(processedServices).then(({ services: finalServices, isFiltered }) => {
            setState(prev => ({
              ...prev,
              services: rawServices,
              filteredServices: finalServices,
              showingLocationFiltered: isFiltered,
              pagination
            }));
          });
        }
      }).catch(error => {
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, error: error.message }));
        }
      });
    }
  }, [options.activeTab, options.isTabVisible, options.filters, fetchServices, processServices, generateCacheKey, applyLocationFiltering]);

  // Calculate stats
  const stats = useMemo(() => {
    const currentServices = state.hasActiveSearch ? state.searchResults : state.filteredServices;
    
    if (!currentServices.length) {
      return { count: 0, avgPrice: 0, avgRating: 0 };
    }

    let totalPrice = 0;
    let totalRating = 0;
    let priceCount = 0;
    let ratingCount = 0;

    currentServices.forEach(service => {
      const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
      if (!isNaN(price)) {
        totalPrice += price;
        priceCount++;
      }

      const rating = parseFloat(service.rating || '0');
      if (!isNaN(rating) && rating > 0) {
        totalRating += rating;
        ratingCount++;
      }
    });

    return {
      count: currentServices.length,
      avgPrice: priceCount > 0 ? totalPrice / priceCount : 0,
      avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
    };
  }, [state.filteredServices, state.searchResults, state.hasActiveSearch]);

  return {
    // Services data
    services: state.hasActiveSearch ? state.searchResults : state.filteredServices,
    allServices: state.services,
    searchResults: state.searchResults,

    // Loading states
    isLoading: state.isLoading,
    isSearching: state.isSearching,

    // Error states
    error: state.error,
    searchError: state.searchError,

    // Search state
    hasActiveSearch: state.hasActiveSearch,
    showingLocationFiltered: state.showingLocationFiltered,

    // Pagination
    pagination: state.pagination,

    // Actions
    refreshServices,
    clearSearch: () => {
      setState(prev => ({
        ...prev,
        searchResults: [],
        searchError: null,
        hasActiveSearch: false
      }));
      lastSearchQueryRef.current = '';
    },

    // Stats
    stats,
    totalCount: state.pagination?.totalItems || state.services.length,
    filteredCount: state.hasActiveSearch ? state.searchResults.length : state.filteredServices.length
  };
};
