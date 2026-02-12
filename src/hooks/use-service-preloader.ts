
import { useEffect } from 'react';
import { useUnifiedMarketplace } from './use-unified-marketplace';
import { ServiceItem } from '@/types/service-types';
import { useImagePreloader } from '@/hooks/use-image-preloader';

/**
 * Enhanced hook to preload service images with better performance
 * @param services Array of services to preload images for
 * @param options Configuration options for preloading
 */
export const useServiceImagesPreloader = (
  services: ServiceItem[], 
  options: { priority?: boolean } = {}
) => {
  const { priority = false } = options;
  const { preloadImages } = useImagePreloader();

  useEffect(() => {
    if (!Array.isArray(services) || services.length === 0) return;

    // Extract image URLs from services with proper priority
    const imageUrls = services
      .slice(0, priority ? 10 : 5) // Limit number of preloads
      .map(service => {
        // Use same priority logic as unified image system
        if (typeof service.image === 'string' && service.image.trim()) {
          return service.image;
        }
        if (service.service_details?.coverImage) {
          return service.service_details.coverImage;
        }
        if (service.service_details?.images?.[0]) {
          return service.service_details.images[0];
        }
        return null;
      })
      .filter((url): url is string => Boolean(url));

    if (imageUrls.length > 0) {
      preloadImages(imageUrls, { priority, timeout: 3000 })
        .then(({ loaded, failed }) => {
          console.log(`[useServiceImagesPreloader] Preloaded ${loaded} images, ${failed} failed`);
        })
        .catch(error => {
          console.warn('[useServiceImagesPreloader] Preload batch failed:', error);
        });
    }
  }, [services, priority, preloadImages]);
};

/**
 * Hook to preload the first page of services for all categories
 * This is used on the landing page to improve first load experience in the marketplace
 */
export const useServicesPreloader = () => {
  // Preload first page of catering services
  const { services: cateringServices } = useUnifiedMarketplace({
    activeTab: 'catering',
    isTabVisible: true,
    enableSearch: false,
    vendorMode: false
  });
  
  // Preload first page of venues
  const { services: venueServices } = useUnifiedMarketplace({
    activeTab: 'venues',
    isTabVisible: true,
    enableSearch: false,
    vendorMode: false
  });
  
  // Preload first page of party rentals
  const { services: rentalServices } = useUnifiedMarketplace({
    activeTab: 'party-rentals',
    isTabVisible: true,
    enableSearch: false,
    vendorMode: false
  });
  
  // Preload first page of staffing services
  const { services: staffServices } = useUnifiedMarketplace({
    activeTab: 'staff',
    isTabVisible: true,
    enableSearch: false,
    vendorMode: false
  });
  
  // Return number of preloaded services for debugging
  return {
    preloadedCount: {
      catering: cateringServices.length,
      venues: venueServices.length,
      rentals: rentalServices.length,
      staff: staffServices.length,
      total: cateringServices.length + venueServices.length + rentalServices.length + staffServices.length
    }
  };
};
