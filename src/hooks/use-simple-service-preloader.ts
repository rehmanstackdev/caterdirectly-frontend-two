import { useEffect } from 'react';
import { ServiceItem } from '@/types/service-types';
import { useImagePreloader } from '@/hooks/use-image-preloader';

/**
 * Simple hook to preload service images with better performance
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
 * Simplified hook to preload services without causing conflicts
 * This version doesn't trigger multiple marketplace hooks simultaneously
 */
export const useSimpleServicesPreloader = () => {
  // Just return a simple object for now to avoid conflicts
  return {
    preloadedCount: {
      catering: 0,
      venues: 0,
      rentals: 0,
      staff: 0,
      total: 0
    }
  };
};