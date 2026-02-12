
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceItem } from '@/types/service-types';
import { transformServiceData } from '@/hooks/services/crud/use-transform-service';
import { usePerformanceCache } from './use-performance-cache';

interface ServiceQuery {
  serviceType: string;
  lat?: number | null;
  lng?: number | null;
  limit?: number;
  offset?: number;
  useLocationFilter?: boolean;
  sortBy?: string;
}

interface UseOptimizedServicesOptions extends ServiceQuery {
  enablePrefetch?: boolean;
  staleWhileRevalidate?: boolean;
}

// Request deduplication map
const pendingRequests = new Map<string, Promise<ServiceItem[]>>();

const useOptimizedServices = (options: UseOptimizedServicesOptions) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const { get, set, invalidate } = usePerformanceCache<ServiceItem[]>();
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastQueryRef = useRef<string>('');

  // Generate cache key from query parameters
  const generateCacheKey = useCallback((query: ServiceQuery): string => {
    const { serviceType, lat, lng, limit = 50, offset = 0, useLocationFilter, sortBy } = query;
    const locationKey = useLocationFilter && lat && lng ? `${lat}_${lng}` : 'no_location';
    return `services_${serviceType}_${locationKey}_${limit}_${offset}_${sortBy || 'default'}`;
  }, []);

  // Optimized database query with server-side filtering and ranking
  const fetchServicesFromDB = useCallback(async (query: ServiceQuery, signal?: AbortSignal): Promise<ServiceItem[]> => {
    // Update performance rankings first
    await supabase.rpc('update_all_service_rankings');

    let supabaseQuery = supabase
      .from('services')
      .select(`
        *,
        vendors!inner(
          performance_score,
          boost_commission_rate,
          is_managed,
          commission_rate
        )
      `)
      .eq('type', query.serviceType)
      .eq('status', 'approved')
      .eq('active', true);

    // Server-side location filtering if coordinates provided
    if (query.useLocationFilter && query.lat && query.lng) {
      // For now, we'll implement client-side location filtering
      // In production, you'd want to use PostGIS for proper geospatial queries
    }

    // Get initial data without complex sorting (we'll sort by ranking algorithm)
    const { data, error } = await supabaseQuery.abortSignal(signal);

    if (error) throw error;
    if (!data) return [];

    // Calculate ranking scores for each service
    const servicesWithRanking = await Promise.all(
      data.map(async (service) => {
        const { data: score } = await supabase.rpc(
          'calculate_service_ranking_score',
          { 
            service_id_param: service.id,
            user_location: query.lat && query.lng ? `${query.lat},${query.lng}` : null
          }
        );

        const transformed = transformServiceData(service);
        return {
          ...transformed,
          ranking_score: score || 0,
          performance_score: service.vendors?.performance_score || 0,
          boost_commission_rate: service.vendors?.boost_commission_rate || 0,
          vendorName: service.vendor_name // Ensure vendorName is set
        };
      })
    );

    // Sort by ranking algorithm or requested sort
    let sortedServices = servicesWithRanking;
    
    if (query.sortBy === 'rating') {
      sortedServices = servicesWithRanking.sort((a, b) => (parseFloat(b.rating || '0') - parseFloat(a.rating || '0')));
    } else if (query.sortBy === 'price') {
      sortedServices = servicesWithRanking.sort((a, b) => {
        const priceA = parseFloat(a.price?.replace(/[^0-9.]/g, '') || '0');
        const priceB = parseFloat(b.price?.replace(/[^0-9.]/g, '') || '0');
        return priceA - priceB;
      });
    } else {
      // Default: sort by ranking score (highest first)
      sortedServices = servicesWithRanking.sort((a, b) => (b.ranking_score || 0) - (a.ranking_score || 0));
    }

    // Apply pagination after sorting
    const startIndex = query.offset || 0;
    const endIndex = startIndex + (query.limit || 50);
    
    return sortedServices.slice(startIndex, endIndex);
  }, []);

  // Main fetch function with caching and deduplication
  const fetchServices = useCallback(async (query: ServiceQuery, forceRefresh = false): Promise<ServiceItem[]> => {
    const cacheKey = generateCacheKey(query);
    
    // Check for pending request to avoid duplicates
    if (pendingRequests.has(cacheKey) && !forceRefresh) {
      return await pendingRequests.get(cacheKey)!;
    }

    // Try cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = await get(cacheKey);
      if (cachedData) {
        console.log(`[OptimizedServices] Cache hit for ${cacheKey}`);
        return cachedData;
      }
    }

    // Create abort controller for this request
    const controller = new AbortController();
    
    // Create and store the request promise
    const requestPromise = fetchServicesFromDB(query, controller.signal);
    pendingRequests.set(cacheKey, requestPromise);

    try {
      const data = await requestPromise;
      
      // Cache the results
      await set(cacheKey, data);
      
      console.log(`[OptimizedServices] Fetched and cached ${data.length} services for ${cacheKey}`);
      return data;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('[OptimizedServices] Error fetching services:', error);
        throw error;
      }
      return [];
    } finally {
      // Clean up pending request
      pendingRequests.delete(cacheKey);
    }
  }, [generateCacheKey, get, set, fetchServicesFromDB]);

  // Stale-while-revalidate pattern
  const fetchWithSWR = useCallback(async (query: ServiceQuery) => {
    const cacheKey = generateCacheKey(query);
    
    // Get cached data first
    const cachedData = await get(cacheKey);
    if (cachedData) {
      setServices(cachedData);
      setIsLoading(false);
      setIsStale(true);
      
      // Fetch fresh data in background
      try {
        const freshData = await fetchServices(query, true);
        if (JSON.stringify(freshData) !== JSON.stringify(cachedData)) {
          setServices(freshData);
          setIsStale(false);
        }
      } catch (error) {
        console.warn('[OptimizedServices] Background refresh failed:', error);
      }
    } else {
      // No cache, fetch normally
      setIsLoading(true);
      try {
        const data = await fetchServices(query);
        setServices(data);
        setIsStale(false);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  }, [generateCacheKey, get, fetchServices]);

  // Effect to fetch services when options change
  useEffect(() => {
    const query: ServiceQuery = {
      serviceType: options.serviceType,
      lat: options.lat,
      lng: options.lng,
      limit: options.limit || 50,
      offset: options.offset || 0,
      useLocationFilter: options.useLocationFilter,
      sortBy: options.sortBy
    };

    const currentQuery = JSON.stringify(query);
    
    // Skip if same query as last time
    if (currentQuery === lastQueryRef.current) {
      return;
    }
    
    lastQueryRef.current = currentQuery;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    setError(null);

    if (options.staleWhileRevalidate) {
      fetchWithSWR(query);
    } else {
      setIsLoading(true);
      fetchServices(query)
        .then(data => {
          setServices(data);
          setIsStale(false);
        })
        .catch(error => setError(error.message))
        .finally(() => setIsLoading(false));
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [options, fetchServices, fetchWithSWR]);

  // Prefetch next page
  const prefetchNext = useCallback(() => {
    if (options.enablePrefetch) {
      const nextQuery: ServiceQuery = {
        ...options,
        offset: (options.offset || 0) + (options.limit || 50)
      };
      
      // Prefetch in background
      setTimeout(() => {
        fetchServices(nextQuery).catch(() => {
          // Ignore prefetch errors
        });
      }, 100);
    }
  }, [options, fetchServices]);

  // Cache invalidation
  const invalidateCache = useCallback((pattern?: string) => {
    invalidate(pattern || options.serviceType);
  }, [invalidate, options.serviceType]);

  return {
    services,
    isLoading,
    error,
    isStale,
    prefetchNext,
    invalidateCache,
    refetch: () => fetchServices({
      serviceType: options.serviceType,
      lat: options.lat,
      lng: options.lng,
      limit: options.limit || 50,
      offset: options.offset || 0,
      useLocationFilter: options.useLocationFilter,
      sortBy: options.sortBy
    }, true)
  };
};

export default useOptimizedServices;
