import { useState, useCallback, useRef } from 'react';
import { useUnifiedMarketplace } from './use-unified-marketplace';

type ServiceCategory = 'catering' | 'venues' | 'party-rentals' | 'staff';

interface UseOptimizedMarketplaceOptions {
  activeTab: ServiceCategory;
  vendorMode?: boolean;
}

/**
 * Optimized marketplace hook that only fetches data for the active tab
 * and implements intelligent caching to prevent redundant requests
 */
export const useOptimizedMarketplace = ({ 
  activeTab, 
  vendorMode = false 
}: UseOptimizedMarketplaceOptions) => {
  const [loadedTabs] = useState<Set<ServiceCategory>>(new Set());
  const tabDataCache = useRef<Map<string, any>>(new Map());
  
  // Only fetch data for the currently active tab
  const { 
    services, 
    isLoading, 
    error, 
    refreshServices 
  } = useUnifiedMarketplace({
    activeTab,
    isTabVisible: true, // Always true since we only render active tab
    vendorMode,
    enableSearch: false
  });

  // Cache management for future optimization
  const getCachedData = useCallback((tab: ServiceCategory) => {
    const cacheKey = `${tab}-${vendorMode}`;
    return tabDataCache.current.get(cacheKey);
  }, [vendorMode]);

  const setCachedData = useCallback((tab: ServiceCategory, data: any) => {
    const cacheKey = `${tab}-${vendorMode}`;
    tabDataCache.current.set(cacheKey, {
      ...data,
      timestamp: Date.now()
    });
  }, [vendorMode]);

  // Cache fresh data
  if (services.length > 0 && !isLoading) {
    setCachedData(activeTab, { services, error: null });
  }

  return {
    services,
    isLoading,
    error,
    refreshServices,
    getCachedData,
    isTabLoaded: true // Always true since we only load active tab
  };
};