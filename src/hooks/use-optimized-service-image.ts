import { useState, useEffect } from 'react';
import { ServiceItem } from '@/types/service-types';

/**
 * Optimized service image hook that prioritizes images properly
 * Priority: service.image → coverImage → images[0] → menuImage → fallback
 */
export const useOptimizedServiceImage = (service: ServiceItem | string | null) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);

    // Handle string input (direct URL)
    if (typeof service === 'string') {
      setImageUrl(service || '/placeholder.svg');
      setIsLoading(false);
      return;
    }

    // Handle null input
    if (!service) {
      setImageUrl('/placeholder.svg');
      setIsLoading(false);
      return;
    }

    // Handle service object - prioritize images correctly
    const determineImageUrl = () => {
      // 1. Check service.image (primary)
      if (service.image && typeof service.image === 'string' && service.image.trim() !== '') {
        return service.image;
      }

      // 2. Check service_details.coverImage
      if (service.service_details?.coverImage && typeof service.service_details.coverImage === 'string') {
        return service.service_details.coverImage;
      }

      // 3. Check service_details.images[0]
      if (service.service_details?.images && Array.isArray(service.service_details.images) && service.service_details.images[0]) {
        return service.service_details.images[0];
      }

      // 4. For catering services, check menuImage
      if (service.serviceType === 'catering' || service.type === 'catering') {
        if (service.service_details?.menuImage && typeof service.service_details.menuImage === 'string') {
          return service.service_details.menuImage;
        }
        
        // Check catering-specific structure
        if (service.service_details?.catering?.menuImage) {
          return service.service_details.catering.menuImage;
        }
      }

      // 5. Fallback
      return '/placeholder.svg';
    };

    const finalImageUrl = determineImageUrl();
    setImageUrl(finalImageUrl);
    setIsLoading(false);
  }, [service]);

  const handleImageError = () => {
    setHasError(true);
    setImageUrl('/placeholder.svg');
  };

  const handleImageLoad = () => {
    setHasError(false);
  };

  return {
    imageUrl,
    isLoading,
    hasError,
    handleImageError,
    handleImageLoad
  };
};