
import { ImageCacheEntry } from './types';

// Cache for storing image URL load results
const imageLoadCache: Record<string, ImageCacheEntry> = {};

// Cache expiration time (5 minutes)
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * ENHANCED: Clear expired cache entries on startup and during cleanup
 */
function clearExpiredEntries(): void {
  const now = Date.now();
  let clearedCount = 0;
  
  Object.keys(imageLoadCache).forEach(url => {
    const entry = imageLoadCache[url];
    if (entry && (now - entry.timestamp > CACHE_EXPIRY_MS)) {
      delete imageLoadCache[url];
      clearedCount++;
    }
  });
  
  if (clearedCount > 0) {
    console.log(`[ImageCache] Cleared ${clearedCount} expired cache entries`);
  }
}

/**
 * Reset the cache for a specific URL or clear the entire cache
 */
export function resetImageCache(url?: string): void {
  if (url) {
    delete imageLoadCache[url];
    console.log(`[resetImageCache] Removed cache entry for: ${url}`);
  } else {
    console.log(`[resetImageCache] Cleared entire image cache (${Object.keys(imageLoadCache).length} entries)`);
    Object.keys(imageLoadCache).forEach(key => delete imageLoadCache[key]);
  }
}

/**
 * ENHANCED: Check if a URL is cached and if we should retry, with expiration handling
 */
export function shouldRetryImage(url: string, maxRetryAttempts: number = 2): boolean {
  // Clear expired entries first
  clearExpiredEntries();
  
  const entry = imageLoadCache[url];
  if (!entry) return true;
  
  // If cached as successful, no need to retry
  if (entry.success) return false;
  
  // Check if cache entry expired
  const now = Date.now();
  if (now - entry.timestamp > CACHE_EXPIRY_MS) {
    delete imageLoadCache[url];
    console.log(`[shouldRetryImage] Cache entry expired for: ${url}`);
    return true;
  }
  
  // Allow retrying based on attempt count
  const shouldRetry = entry.attempts < maxRetryAttempts;
  console.log(`[shouldRetryImage] ${url} - attempts: ${entry.attempts}/${maxRetryAttempts}, shouldRetry: ${shouldRetry}`);
  return shouldRetry;
}

/**
 * Update the cache with the result of an image load attempt
 */
export function updateImageCache(url: string, success: boolean): void {
  const entry = imageLoadCache[url] || { success: false, timestamp: Date.now(), attempts: 0 };
  
  if (success) {
    entry.success = true;
    console.log(`[updateImageCache] Cached successful load: ${url}`);
  } else {
    entry.attempts += 1;
    console.log(`[updateImageCache] Cached failed load attempt ${entry.attempts}: ${url}`);
  }
  
  entry.timestamp = Date.now();
  imageLoadCache[url] = entry;
}

/**
 * Get all cache entries for debugging
 */
export function getCacheEntries(): Record<string, ImageCacheEntry> {
  clearExpiredEntries(); // Clean up before returning
  return { ...imageLoadCache };
}

/**
 * ENHANCED: Get cache statistics for monitoring
 */
export function getCacheStats(): {
  totalEntries: number;
  successfulEntries: number;
  failedEntries: number;
  expiredEntries: number;
} {
  const now = Date.now();
  let successful = 0;
  let failed = 0;
  let expired = 0;
  
  Object.values(imageLoadCache).forEach(entry => {
    if (now - entry.timestamp > CACHE_EXPIRY_MS) {
      expired++;
    } else if (entry.success) {
      successful++;
    } else {
      failed++;
    }
  });
  
  return {
    totalEntries: Object.keys(imageLoadCache).length,
    successfulEntries: successful,
    failedEntries: failed,
    expiredEntries: expired
  };
}

// Initialize cache cleanup on module load
clearExpiredEntries();

// Set up periodic cache cleanup (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(clearExpiredEntries, CACHE_EXPIRY_MS);
}
