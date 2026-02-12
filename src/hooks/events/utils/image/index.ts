
/**
 * Main export file for image utilities
 * Re-exports all functionality from the modular files
 */

// Instead of using wildcard exports that can cause conflicts,
// explicitly import and re-export the functions we need
import {
  getServiceImageUrl,
  getServiceMenuImageUrl,
  tryImageSources,
  isValidImageUrl,
  logImageDebug,
  extractServiceImageUrls,
  resetImageCache,
  shouldRetryImage,
  updateImageCache
} from './core';

import {
  testImageUrl,
  resolveSupabaseUrl,
  resolvePublicUrl,
  createImageUrlVariants,
  testImageUrlWithFallback,
  addCacheBuster
} from './resolvers';

// Import the getCacheEntries function only once
import { getCacheEntries } from './cache';

// Types
import type { 
  ImageCacheEntry, 
  ImageSourcesParams, 
  UrlResolutionOptions
} from './types';

import { DEFAULT_CONFIG } from './types';

// Export all the core functions
export {
  // Core functions
  getServiceImageUrl,
  getServiceMenuImageUrl,
  tryImageSources,
  isValidImageUrl,
  logImageDebug,
  extractServiceImageUrls,
  
  // Cache functions
  resetImageCache,
  shouldRetryImage,
  updateImageCache,
  getCacheEntries, // Export once from here
  
  // Resolver functions
  resolveSupabaseUrl,
  resolvePublicUrl,
  addCacheBuster,
  testImageUrl,
  createImageUrlVariants,
  testImageUrlWithFallback,
  
  // Non-type exports
  DEFAULT_CONFIG
};

// Explicitly re-export the types with 'export type'
export type { ImageCacheEntry, ImageSourcesParams, UrlResolutionOptions };

// Export any other functions from specific modules that aren't covered above
export * from './fallbacks';
export * from './service-extractors';
