import { ServiceItem } from "@/types/service-types";
import { isValidImageUrl, resolvePublicUrl, resolveSupabaseUrl, testImageUrl as testUrl } from './resolvers';
import { tryImageSources } from './fallbacks';
import { getServiceMenuImageUrl, extractServiceImageUrls, logImageDebug } from './service-extractors';
import { resetImageCache, shouldRetryImage, updateImageCache } from './cache';
import { DEFAULT_CONFIG } from './types';

/**
 * Re-export key utilities from their modules to maintain backwards compatibility
 */
export { 
  isValidImageUrl 
} from './resolvers';

export { 
  logImageDebug, 
  extractServiceImageUrls,
  getServiceMenuImageUrl
} from './service-extractors';

// Re-export cache functions for backwards compatibility
export { resetImageCache, shouldRetryImage, updateImageCache } from './cache';

// Re-export tryImageSources for backwards compatibility
export { tryImageSources } from './fallbacks';

/**
 * FIXED: Enhanced service image resolution with proper fallback chain
 * Priority: service.image → coverImage → images[0] → menuImage (catering only) → null
 * Now returns null instead of misleading fallback when no valid images exist
 */
export function getServiceImageUrl(
  service: ServiceItem | string | null | undefined,
  fallbackImage: string = ''
): string {
  console.log('[getServiceImageUrl] Starting enhanced image resolution:', {
    serviceType: typeof service,
    serviceName: typeof service === 'object' ? service?.name : 'N/A',
    serviceId: typeof service === 'object' ? service?.id : 'N/A',
    image: typeof service === 'object' ? service?.image : 'N/A',
    serviceDetails: typeof service === 'object' ? !!service?.service_details : 'N/A'
  });

  // Case 1: If passed value is null/undefined, return fallback or empty
  if (service === null || service === undefined) {
    console.log('[getServiceImageUrl] Service is null/undefined, returning empty');
    return fallbackImage || '';
  }
  
  // Case 2: If passed value is a string (direct image URL)
  if (typeof service === 'string') {
    const resolved = resolveImageUrl(service, fallbackImage);
    console.log('[getServiceImageUrl] String input resolved to:', resolved);
    return resolved;
  }
  
  // Case 3: If passed a service object, use PROPER priority system
  if (typeof service === 'object') {
    const serviceType = service.type || service.serviceType;
    console.log('[getServiceImageUrl] Processing service object:', {
      serviceType,
      hasServiceDetails: !!service.service_details,
      mainServiceImage: service.image,
      coverImage: service.service_details?.coverImage,
      imagesArray: service.service_details?.images?.length || 0,
      menuImage: service.service_details?.menuImage || service.service_details?.catering?.menuImage
    });
    
    // PRIORITY 1: Main service image (highest priority for all services)
    if (typeof service.image === 'string' && service.image.trim() !== '') {
      const resolved = resolveImageUrl(service.image, fallbackImage);
      console.log('[getServiceImageUrl] Using main service.image (Priority 1):', {
        serviceImage: service.image,
        resolved
      });
      return resolved;
    }
    
    // PRIORITY 2: Cover image from service details (camelCase and snake_case)
    const coverImage = service.service_details?.coverImage || service.service_details?.cover_image;
    if (typeof coverImage === 'string' && coverImage.trim() !== '') {
      const resolved = resolveImageUrl(coverImage, fallbackImage);
      console.log('[getServiceImageUrl] Using cover image (Priority 2):', resolved);
      return resolved;
    }
    
    // PRIORITY 3: First image from images array
    const images = service.service_details?.images;
    if (Array.isArray(images) && images.length > 0 && typeof images[0] === 'string') {
      const resolved = resolveImageUrl(images[0], fallbackImage);
      console.log('[getServiceImageUrl] Using first array image (Priority 3):', resolved);
      return resolved;
    }
    
    // PRIORITY 3.5: Try detail_images array (alternative field name)
    const detailImages = service.service_details?.detail_images;
    if (Array.isArray(detailImages) && detailImages.length > 0 && typeof detailImages[0] === 'string') {
      const resolved = resolveImageUrl(detailImages[0], fallbackImage);
      console.log('[getServiceImageUrl] Using first detail_images array image (Priority 3.5):', resolved);
      return resolved;
    }
    
    // PRIORITY 4: Menu image (only for catering services, lowest priority)
    if (serviceType === 'catering') {
      const menuImage = service.service_details?.menuImage || 
                       service.service_details?.menu_image ||
                       service.service_details?.catering?.menuImage ||
                       service.service_details?.catering?.menu_image ||
                       service.service_details?.menu?.image ||
                       service.service_details?.menu?.menu_image;
      if (typeof menuImage === 'string' && menuImage.trim() !== '') {
        const resolved = resolveImageUrl(menuImage, fallbackImage);
        console.log('[getServiceImageUrl] Using menu image (Priority 4 - catering only):', resolved);
        return resolved;
      }
    }
  }
  
  // Return empty string instead of misleading fallback
  console.warn(`[getServiceImageUrl] No valid image found for service, returning empty:`, service);
  return fallbackImage || '';
}

/**
 * ENHANCED: Helper function to resolve image URLs with improved format handling and validation
 */
function resolveImageUrl(imageUrl: string, fallbackImage: string): string {
  // Handle empty strings
  if (!imageUrl || imageUrl.trim() === '') {
    return fallbackImage;
  }
  
  const trimmedUrl = imageUrl.trim();
  
  // Handle HTTP/HTTPS URLs (most common case)
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }
  
  // Handle base64 data URLs
  if (trimmedUrl.startsWith('data:image')) {
    return trimmedUrl;
  }
  
  // Handle relative paths to public folder (lovable-uploads)
  if (trimmedUrl.includes('lovable-uploads/')) {
    const resolved = resolvePublicUrl(trimmedUrl);
    console.log('[resolveImageUrl] Resolved public URL:', { original: trimmedUrl, resolved });
    return resolved || trimmedUrl;
  }
  
  // Handle Supabase storage URLs with improved detection
  if (trimmedUrl.includes('storage/v1/object/public/') || 
      trimmedUrl.includes('supabase.co') ||
      trimmedUrl.includes('supabase.in') ||
      (trimmedUrl.includes('supabase') && trimmedUrl.includes('storage')) ||
      trimmedUrl.includes('service-images') ||
      trimmedUrl.includes('menu-images')) {
    const resolved = resolveSupabaseUrl(trimmedUrl);
    console.log('[resolveImageUrl] Resolved Supabase URL:', { original: trimmedUrl, resolved });
    return resolved || trimmedUrl;
  }
  
  // Handle absolute paths
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }
  
  // Last attempt - if it looks like any kind of URL, return as-is
  console.log(`[resolveImageUrl] Unknown URL format, returning as-is: ${trimmedUrl}`);
  return trimmedUrl;
}

// Re-export testImageUrl from resolvers with a different name to prevent conflicts
export { testUrl as testImageUrl };
