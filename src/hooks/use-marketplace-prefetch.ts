import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePerformanceCache } from './use-performance-cache';
import { normalizeServiceType, SERVICE_TYPES } from '@/utils/service-type-utils';
import { ServiceItem, ServiceStatus, PriceType } from '@/types/service-types';

/**
 * Background prefetch service for marketplace data
 * Preloads first page of each tab to make navigation feel instant
 */
export const useMarketplacePrefetch = () => {
  const { set: cacheSet } = usePerformanceCache();
  const prefetchStatus = useRef<Record<string, boolean>>({});

  const prefetchTabServices = useCallback(async (serviceType: string) => {
    const cacheKey = `${serviceType}-all`;
    
    // Skip if already prefetched
    if (prefetchStatus.current[cacheKey]) return;
    
    try {
      const query = supabase
        .from('services')
        .select(`
          *,
          vendors(city, state, company_name, full_address)
        `)
        .eq('status', 'approved')
        .eq('active', true)
        .eq('available', true)
        .eq('type', serviceType)
        .order('created_at', { ascending: false })
        .limit(20); // Prefetch first 20 services per tab

      const { data, error } = await query;
      if (error) throw error;

      const transformedData: ServiceItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: normalizeServiceType(item.type) || 'catering',
        serviceType: normalizeServiceType(item.service_type || item.type) || 'catering',
        description: item.description || '',
        price: item.price || '$0',
        price_type: (item.price_type || 'flat_rate') as PriceType,
        image: item.image || '',
        vendorName: item.vendor_name || 'Unknown Vendor',
        vendor_id: item.vendor_id,
        location: item.vendors?.full_address || (item.vendors?.city && item.vendors?.state ? `${item.vendors.city}, ${item.vendors.state}` : ''),
        rating: item.rating || '0',
        reviews: item.reviews || '0',
        service_details: item.service_details || {},
        status: (item.status || 'approved') as ServiceStatus,
        active: item.active,
        available: item.available,
        isManaged: item.is_managed,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        adminFeedback: item.admin_feedback
      }));

      // Cache with extended TTL (15 minutes)
      await cacheSet(cacheKey, transformedData, 15 * 60 * 1000);
      prefetchStatus.current[cacheKey] = true;
      
      console.log(`[MarketplacePrefetch] Prefetched ${transformedData.length} ${serviceType} services`);
    } catch (error) {
      console.warn(`[MarketplacePrefetch] Failed to prefetch ${serviceType}:`, error);
    }
  }, [cacheSet]);

  const prefetchAllTabs = useCallback(async () => {
    console.log('[MarketplacePrefetch] Starting background prefetch...');
    
    // Prefetch all marketplace tabs in parallel
    const serviceTypes = ['catering', 'venues', 'party-rentals', 'staff'];
    const prefetchTasks = serviceTypes.map(serviceType => 
      prefetchTabServices(serviceType)
    );
    
    try {
      await Promise.allSettled(prefetchTasks);
      console.log('[MarketplacePrefetch] Background prefetch completed');
    } catch (error) {
      console.warn('[MarketplacePrefetch] Background prefetch failed:', error);
    }
  }, [prefetchTabServices]);

  return {
    prefetchAllTabs,
    prefetchTabServices,
    isPrefetched: (serviceType: string) => prefetchStatus.current[`${serviceType}-all`] || false
  };
};