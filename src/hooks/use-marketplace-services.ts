
import { useState, useEffect, useMemo } from 'react';
import { useUnifiedMarketplace } from './use-unified-marketplace';
import { useLocation } from './use-location';
import { ServiceItem } from '@/types/service-types';

// Updated to match standardized service types
type ServiceCategory = 'catering' | 'venues' | 'party-rentals' | 'staff';

interface ServiceFilter {
  price?: 'low' | 'medium' | 'high' | 'any';
  availability?: string;
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity';
}

interface UseMarketplaceServicesOptions {
  category: ServiceCategory;
  filters?: ServiceFilter;
}

export const useMarketplaceServices = ({ 
  category, 
  filters = {} 
}: UseMarketplaceServicesOptions) => {
  const { coordinates, locationSet } = useLocation();
  const [sortedServices, setSortedServices] = useState<ServiceItem[]>([]);

  // Get services from the unified marketplace hook
  const { 
    services, 
    isLoading, 
    error, 
    refreshServices 
  } = useUnifiedMarketplace({
    activeTab: category,
    isTabVisible: true,
    enableSearch: false,
    vendorMode: false
  });

  // Apply filters and sorting
  useEffect(() => {
    if (!services.length || isLoading) {
      setSortedServices([]);
      return;
    }

    let filteredServices = [...services];

    // Apply price filter if specified
    if (filters.price && filters.price !== 'any') {
      filteredServices = filteredServices.filter(service => {
        // Extract numeric value from price string
        const price = parseFloat(service.price.replace(/[^0-9.]/g, ''));
        
        switch (filters.price) {
          case 'low':
            return price < 50;
          case 'medium':
            return price >= 50 && price < 200;
          case 'high':
            return price >= 200;
          default:
            return true;
        }
      });
    }

    // Apply rating filter if specified
    if (filters.rating) {
      filteredServices = filteredServices.filter(service => {
        const rating = parseFloat(service.rating || '0');
        return rating >= filters.rating!;
      });
    }

    // Sort services based on sortBy
    if (filters.sortBy) {
      filteredServices.sort((a, b) => {
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

    setSortedServices(filteredServices);
  }, [services, filters, isLoading]);

  // Calculate stats for the services
  const stats = useMemo(() => {
    if (!services.length) {
      return { count: 0, avgPrice: 0, avgRating: 0 };
    }

    let totalPrice = 0;
    let totalRating = 0;
    let priceCount = 0;
    let ratingCount = 0;

    services.forEach(service => {
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
      count: services.length,
      avgPrice: priceCount > 0 ? totalPrice / priceCount : 0,
      avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
    };
  }, [services]);

  return {
    services: sortedServices,
    isLoading,
    error,
    refreshServices,
    stats,
    totalCount: services.length,
    filteredCount: sortedServices.length,
  };
};
