
/**
 * This file re-exports all image utilities from their new location
 * to maintain backward compatibility with existing imports.
 */

// Re-export all the image utilities from the new location
export {
  // Core functions
  getServiceImageUrl,
  getServiceMenuImageUrl,
  tryImageSources,
  isValidImageUrl,
  resetImageCache,
  testImageUrl,
  logImageDebug,
  extractServiceImageUrls,
  
  // Cache functions
  shouldRetryImage,
  updateImageCache,
  getCacheEntries,
  
  // Resolver functions
  resolveSupabaseUrl,
  resolvePublicUrl,
  addCacheBuster,
  
  // Types
  type ImageCacheEntry,
  type ImageSourcesParams,
  type UrlResolutionOptions
} from '@/hooks/events/utils/image';

// If there are any utility functions that were previously defined only in this file
// but are now needed elsewhere, we can add them here
