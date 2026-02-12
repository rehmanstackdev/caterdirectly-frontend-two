
import { useState, useEffect, useCallback, useRef } from 'react';
import { ServiceItem } from '@/types/service-types';
import { 
  getServiceImageUrl, 
  testImageUrl, 
  isValidImageUrl,
  resetImageCache,
  shouldRetryImage,
  updateImageCache,
  addCacheBuster
} from '@/hooks/events/utils/image';

interface UseUnifiedImageOptions {
  fallbackImage?: string;
  retryOnError?: boolean;
  maxRetries?: number;
  timeout?: number;
  priority?: boolean;
}

interface UseUnifiedImageReturn {
  imageUrl: string;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
  preload: () => Promise<boolean>;
}

/**
 * Unified image hook that provides consistent image handling across all components
 * This replaces all the individual image handling logic scattered across components
 */
export function useUnifiedImage(
  source: ServiceItem | string | null | undefined,
  options: UseUnifiedImageOptions = {}
): UseUnifiedImageReturn {
  const {
    fallbackImage = 'https://via.placeholder.com/400x300?text=No+Image',
    retryOnError = true,
    maxRetries = 2,
    timeout = 3000,
    priority = false
  } = options;

  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const retryCount = useRef(0);
  const isMounted = useRef(true);

  // Process the source to get the optimal image URL
  const processImageSource = useCallback(() => {
    const resolvedUrl = getServiceImageUrl(source, fallbackImage);
    console.log('[useUnifiedImage] Resolved image URL:', {
      sourceType: typeof source,
      sourceName: typeof source === 'object' ? source?.name : 'N/A',
      resolvedUrl
    });
    return resolvedUrl;
  }, [source, fallbackImage]);

  // Enhanced validate and load image with exponential backoff
  const validateAndLoadImage = useCallback(async (url: string) => {
    if (!isMounted.current) return false;
    
    setIsLoading(true);
    setHasError(false);

    try {
      // For placeholder images, don't validate - just use them
      if (url.includes('placeholder') || url.includes('via.placeholder')) {
        setImageUrl(url);
        setIsLoading(false);
        return true;
      }

      // Validate the image URL with network resilience
      const isValid = await testImageUrl(url, timeout);
      
      if (!isMounted.current) return false;

      if (isValid) {
        setImageUrl(url);
        setIsLoading(false);
        updateImageCache(url, true);
        console.log('[useUnifiedImage] Successfully loaded image:', url);
        return true;
      } else {
        throw new Error(`Image validation failed: ${url}`);
      }
    } catch (error) {
      if (!isMounted.current) return false;
      
      console.error('[useUnifiedImage] Image load error:', error);
      updateImageCache(url, false);
      
      // Enhanced retry logic with exponential backoff
      if (retryOnError && retryCount.current < maxRetries && shouldRetryImage(url, maxRetries)) {
        retryCount.current += 1;
        const backoffDelay = Math.min(1000 * Math.pow(2, retryCount.current - 1), 5000); // Max 5s delay
        
        console.log(`[useUnifiedImage] Retrying image load (attempt ${retryCount.current}/${maxRetries}) after ${backoffDelay}ms:`, url);
        
        const urlWithCacheBuster = addCacheBuster(url);
        resetImageCache(url);
        
        setTimeout(() => {
          if (isMounted.current) {
            validateAndLoadImage(urlWithCacheBuster);
          }
        }, backoffDelay);
        
        return false;
      }
      
      // All retries failed, use fallback
      setImageUrl(fallbackImage);
      setHasError(true);
      setIsLoading(false);
      return false;
    }
  }, [timeout, retryOnError, maxRetries, fallbackImage]);

  // Main effect to process and load image
  useEffect(() => {
    isMounted.current = true;
    retryCount.current = 0;
    
    const processedUrl = processImageSource();
    
    if (!processedUrl || processedUrl === fallbackImage) {
      setImageUrl(fallbackImage);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    validateAndLoadImage(processedUrl);

    return () => {
      isMounted.current = false;
    };
  }, [source, processImageSource, validateAndLoadImage, fallbackImage]);

  // Retry function
  const retry = useCallback(() => {
    retryCount.current = 0;
    setHasError(false);
    const processedUrl = processImageSource();
    if (processedUrl) {
      resetImageCache(processedUrl);
      validateAndLoadImage(processedUrl);
    }
  }, [processImageSource, validateAndLoadImage]);

  // Preload function for performance optimization
  const preload = useCallback(async (): Promise<boolean> => {
    const processedUrl = processImageSource();
    if (!processedUrl || processedUrl === fallbackImage) return false;
    
    return testImageUrl(processedUrl, timeout);
  }, [processImageSource, fallbackImage, timeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return {
    imageUrl,
    isLoading,
    hasError,
    retry,
    preload
  };
}

/**
 * Specialized hook for service images with optimized defaults
 */
export function useServiceImage(service: ServiceItem | null | undefined, priority: boolean = false) {
  return useUnifiedImage(service, {
    fallbackImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop&auto=format',
    retryOnError: true,
    maxRetries: 2,
    timeout: 3000,
    priority
  });
}

/**
 * Hook for menu images with catering-specific fallback
 */
export function useMenuImage(service: ServiceItem | null | undefined) {
  return useUnifiedImage(service, {
    fallbackImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop&auto=format',
    retryOnError: true,
    maxRetries: 1,
    timeout: 2000
  });
}
