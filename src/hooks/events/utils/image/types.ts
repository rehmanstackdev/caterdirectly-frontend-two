
/**
 * Types for image utilities
 */

export interface ImageCacheEntry {
  success: boolean;
  timestamp: number;
  attempts: number;
}

export interface ImageSourcesParams {
  service: any;
  maxSourcesToTry?: number;
  timeoutMs?: number;
}

export interface UrlResolutionOptions {
  addCacheBuster?: boolean;
  validateUrl?: boolean;
  timeout?: number;
}

// Default configuration
export const DEFAULT_CONFIG = {
  defaultFallbackImage: 'https://via.placeholder.com/400x300?text=No+Image',
  cacheDurationMinutes: 5,
  maxRetryAttempts: 2,
  preloadTimeout: 5000,
};
