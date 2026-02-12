import { useMemo, useState, useEffect, useCallback } from 'react';
import { ServiceItem } from '@/types/service-types';
import { useImageMonitoring } from './useImageMonitoring';
import { testImageUrlWithFallback, getServiceImageUrl } from '@/hooks/events/utils/image';

interface UnifiedImageOptions {
  enableRetry?: boolean;
  retryCount?: number;
  timeout?: number;
  priority?: boolean;
}

interface UnifiedImageReturn {
  imageUrl: string | null;
  isLoading: boolean;
  hasError: boolean;
  retry: () => void;
  metadata: {
    source: 'main' | 'cover' | 'gallery' | 'menu' | 'fallback' | 'none';
    attempts: number;
    lastTested: Date | null;
  };
}

/**
 * UNIFIED IMAGE HOOK - Single source of truth for all service image handling
 * Replaces: useSimpleServiceImage, useServiceImage, useOptimizedServiceImage
 * 
 * Priority order:
 * 1. service.image (main image)
 * 2. service.service_details.coverImage 
 * 3. service.service_details.images[0]
 * 4. service.service_details.menuImage (catering only)
 * 5. service.service_details.catering.menuImage (catering only)
 */
export function useUnifiedServiceImage(
  service: ServiceItem | string | null,
  options: UnifiedImageOptions = {}
): UnifiedImageReturn {
  const {
    enableRetry = true,
    retryCount = 2,
    timeout = 3000,
    priority = false
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lastTested, setLastTested] = useState<Date | null>(null);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);
  
  const { trackImageStart, trackImageLoad } = useImageMonitoring();

  // Core image resolution logic
  const { imageUrl, source } = useMemo(() => {
    console.log('[useUnifiedServiceImage] Resolving image via single source of truth');

    if (service === null || service === undefined) {
      return { imageUrl: null, source: 'none' as const };
    }

    // Use centralized resolver for both strings and service objects
    const resolved = getServiceImageUrl(service, '');
    if (!resolved) {
      return { imageUrl: null, source: 'none' as const };
    }

    // Infer source for metadata (best-effort)
    let determinedSource: 'main' | 'cover' | 'gallery' | 'menu' = 'main';
    if (typeof service === 'object') {
      const sd: any = service.service_details || {};
      const norm = (v?: string) => (typeof v === 'string' ? v.trim() : '');
      const matches = (a?: string) => norm(resolved) === norm(a);

      if (matches(service.image)) {
        determinedSource = 'main';
      } else if (matches(sd.coverImage) || matches(sd.cover_image)) {
        determinedSource = 'cover';
      } else if ((Array.isArray(sd.images) && matches(sd.images?.[0])) || (Array.isArray(sd.detail_images) && matches(sd.detail_images?.[0]))) {
        determinedSource = 'gallery';
      } else if ((service.type || (service as any).serviceType) === 'catering') {
        determinedSource = 'menu';
      }
    }

    return { imageUrl: resolved, source: determinedSource };
  }, [service]);

  // Reset resolved URL when imageUrl changes
  useEffect(() => {
    setResolvedImageUrl(null);
  }, [imageUrl]);

  // Image validation with fallback support
  useEffect(() => {
    if (!imageUrl) {
      setIsLoading(false);
      setHasError(false);
      setResolvedImageUrl(null);
      return;
    }

    let isMounted = true;
    setIsLoading(priority); // Only show loading for priority images
    setHasError(false);

    const validateImageWithFallback = async () => {
      try {
        trackImageStart(imageUrl);
        const serviceName = typeof service === 'object' ? service?.name : undefined;
        
        // Try to find a working variant of the image URL
        const workingUrl = await testImageUrlWithFallback(imageUrl, timeout);
        
        if (isMounted) {
          setLastTested(new Date());
          setAttempts(prev => prev + 1);
          
          if (workingUrl) {
            // Set the resolved URL if it's different from the original
            if (workingUrl !== imageUrl) {
              console.log(`[useUnifiedServiceImage] Found working variant: ${workingUrl} for original: ${imageUrl}`);
              setResolvedImageUrl(workingUrl);
            }
            setIsLoading(false);
            setHasError(false);
            trackImageLoad(workingUrl, true, source, serviceName);
          } else {
            // No working URL found - still allow the original to try loading
            setIsLoading(false);
            setHasError(false);
            trackImageLoad(imageUrl, false, source, serviceName, 'All variants failed but allowing original');
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsLoading(false);
          setHasError(false); // Don't fail on validation errors
          const serviceName = typeof service === 'object' ? service?.name : undefined;
          trackImageLoad(imageUrl, false, source, serviceName, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    };

    validateImageWithFallback();

    return () => {
      isMounted = false;
    };
  }, [imageUrl, timeout, priority]);

  // Retry mechanism
  const retry = useCallback(() => {
    if (imageUrl && attempts < retryCount) {
      setAttempts(0);
      setHasError(false);
      setIsLoading(true);
    }
  }, [imageUrl, attempts, retryCount]);

  return {
    imageUrl: resolvedImageUrl || imageUrl,
    isLoading,
    hasError,
    retry,
    metadata: {
      source,
      attempts,
      lastTested
    }
  };
}

/**
 * Utility functions for image processing
 */
function isValidImageString(value: any): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function normalizeImageUrl(url: string): string {
  if (!url) return url;
  
  // No conversion needed - both buckets work during migration period
  
  // Trust all Supabase and known image hosts
  if (url.includes('supabase') || url.includes('service-images') || url.includes('unsplash') || url.includes('placeholder')) {
    return url;
  }
  
  // Handle relative paths
  if (url.startsWith('/')) {
    return url;
  }
  
  // Handle public paths  
  if (url.startsWith('public/')) {
    return `/${url}`;
  }
  
  return url;
}

/**
 * Tests if an image URL is valid and can be loaded
 */
async function testImageUrl(url: string, timeout: number = 3000): Promise<boolean> {
  if (!url || typeof url !== 'string') return false;
  
  // Trust all known image hosts without validation
  if (url.includes('placeholder') || 
      url.includes('unsplash') || 
      url.includes('supabase') || 
      url.includes('service-images') ||
      url.includes('menu-images')) {
    return true;
  }
  
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      resolve(false);
    }, timeout);
    
    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
    
    img.src = url;
  });
}