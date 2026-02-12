
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceItem } from '@/types/service-types';
import { useFilterContext } from '@/contexts/FilterContext';
import { useLocation } from '@/hooks/use-location';

interface UseEnhancedMarketplaceSearchOptions {
  serviceType: string;
  limit?: number;
  enabled?: boolean;
}

export const useEnhancedMarketplaceSearch = (options: UseEnhancedMarketplaceSearchOptions) => {
  const { filters } = useFilterContext();
  const { coordinates, locationSet } = useLocation();
  const [searchResults, setSearchResults] = useState<ServiceItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastSearchQueryRef = useRef<string>('');

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setSearchError(null);

      // Prepare location filter if available
      let locationFilter: string | null = null;
      if (filters.global.location) {
        locationFilter = filters.global.location;
      } else if (locationSet && coordinates) {
        // Use a basic location string if coordinates are available
        locationFilter = `${coordinates.lat},${coordinates.lng}`;
      }

      console.log(`[EnhancedMarketplaceSearch] Searching for "${query}" in ${options.serviceType}`);

      const { data, error } = await supabase.rpc('search_services', {
        search_query: query,
        service_type_filter: options.serviceType,
        location_filter: locationFilter,
        limit_count: options.limit || 50,
        offset_count: 0
      });

      if (error) {
        console.error('[EnhancedMarketplaceSearch] Search error:', error);
        setSearchError(error.message);
        return;
      }

      // Transform the results to match ServiceItem interface
      const transformedResults: ServiceItem[] = (data || []).map((item: any) => ({
        
        id: item.id,
        name: item.name,
        type: item.type,
        serviceType: item.service_type || item.type,
        description: item.description || '',
        price: item.price || '$0',
        price_type: item.price_type || 'flat_rate',
        image: item.image || '',
        vendorName: item.vendor_name || item.vendor?.businessName || item.vendor?.company_name || 'Unknown Vendor',
        vendor_id: item.vendor_id || item.vendor?.id || '',
        location: item.location || item.vendor?.fullAddress || item.vendor?.full_address || '',
        rating: item.rating || '0',
        reviews: item.reviews || '0',
        service_details: {
          ...(item.service_details || {}),
          // Preserve createdBy and vendor details if available
          ...(item.createdBy && { createdBy: item.createdBy }),
          ...(item.vendor && { vendor: item.vendor })
        },
        status: item.status || 'approved',
        active: item.active !== false,
        available: item.available !== false,
        isManaged: item.is_managed || false,
        createdAt: item.created_at || item.createdAt,
        updatedAt: item.updated_at || item.updatedAt,
        adminFeedback: item.admin_feedback || item.adminFeedback
      }));

      console.log(`[EnhancedMarketplaceSearch] Found ${transformedResults.length} results`);
      setSearchResults(transformedResults);

    } catch (error: any) {
      console.error('[EnhancedMarketplaceSearch] Search error:', error);
      setSearchError(error.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  }, [options.serviceType, options.limit, filters.global.location, coordinates, locationSet]);

  // Debounced search effect
  useEffect(() => {
    const query = filters.global.searchQuery;
    
    // Only search if enabled and query has changed
    if (!options.enabled || query === lastSearchQueryRef.current) {
      return;
    }

    lastSearchQueryRef.current = query;

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [filters.global.searchQuery, options.enabled, performSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const hasActiveSearch = filters.global.searchQuery.trim().length > 0;

  return {
    searchResults,
    isSearching,
    searchError,
    hasActiveSearch,
    clearSearch: () => {
      setSearchResults([]);
      setSearchError(null);
      lastSearchQueryRef.current = '';
    }
  };
};
