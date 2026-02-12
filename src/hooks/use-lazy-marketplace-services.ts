
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUnifiedMarketplace } from './use-unified-marketplace';
import { useLocation } from './use-location';
import { ServiceItem } from '@/types/service-types';
import { useCart } from '@/contexts/CartContext';

type ServiceCategory = 'catering' | 'venues' | 'party-rentals' | 'staff';

interface UseLazyMarketplaceServicesOptions {
  activeTab: ServiceCategory;
  isVisible: boolean; // Only load when tab is visible
}

export const useLazyMarketplaceServices = ({ 
  activeTab, 
  isVisible 
}: UseLazyMarketplaceServicesOptions) => {
  const { coordinates, locationSet } = useLocation();
  const [loadedTabs, setLoadedTabs] = useState<Set<ServiceCategory>>(new Set());
  const [hoveredTab, setHoveredTab] = useState<ServiceCategory | null>(null);
  const { cartCount } = useCart();
  
  // Track if component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Only fetch if tab is visible or has been loaded before
  const shouldLoad = isVisible || loadedTabs.has(activeTab);
  
  const { 
    services, 
    isLoading, 
    error, 
    refreshServices 
  } = useUnifiedMarketplace({
    activeTab,
    isTabVisible: shouldLoad,
    enableSearch: false,
    vendorMode: false
  });

  // Mark tab as loaded when data is fetched and component is still mounted
  useEffect(() => {
    if (isVisible && !isLoading && !error && isMounted.current) {
      setLoadedTabs(prev => new Set([...prev, activeTab]));
    }
  }, [activeTab, isVisible, isLoading, error]);

  // Prefetch on hover with delay
  useEffect(() => {
    if (!hoveredTab || loadedTabs.has(hoveredTab) || !isMounted.current) return;
    
    const timer = setTimeout(() => {
      if (isMounted.current) {
        setLoadedTabs(prev => new Set([...prev, hoveredTab]));
      }
    }, 300); // 300ms hover delay before prefetch
    
    return () => clearTimeout(timer);
  }, [hoveredTab, loadedTabs]);
  
  // When cart state changes, refresh services to ensure the UI updates
  useEffect(() => {
    if (isVisible && shouldLoad) {
      // Only refresh if this tab is visible, to avoid unnecessary work
      refreshServices();
    }
  }, [cartCount, isVisible, shouldLoad, refreshServices]);

  const handleTabHover = useCallback((tab: ServiceCategory) => {
    setHoveredTab(tab);
  }, []);

  const handleTabLeave = useCallback(() => {
    setHoveredTab(null);
  }, []);

  // Prevent unnecessary re-renders by only returning new data when necessary
  return {
    services: shouldLoad ? services : [],
    isLoading: shouldLoad ? isLoading : false,
    error: shouldLoad ? error : null,
    refreshServices,
    handleTabHover,
    handleTabLeave,
    isTabLoaded: loadedTabs.has(activeTab)
  };
};
