/**
 * Universal localStorage management utility
 * Handles quota monitoring, cleanup, and optimization for all user types
 */

interface StorageQuotaInfo {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

interface StorageCleanupResult {
  removedItems: number;
  freedSpace: number;
  errors: string[];
}

// Essential keys that should never be cleaned up automatically
const ESSENTIAL_KEYS = [
  'marketplace-cart',
  'booking-state-backup', 
  'vendor_application_draft_v1',
  'admin_visited_routes',
  'supabase-auth',
  'currentDraftId'
];

// Keys that can be moved to sessionStorage for development
const DEVELOPMENT_KEYS = [
  'eventify_services',
  'orders',
  'events'
];

// Cache keys that can be cleaned up when quota is reached
const CACHE_KEY_PATTERNS = [
  'cache_',
  'image_',
  'lovable-uploads/',
  'uploaded_image_',
  'cached_image',
  'service_image_'
];

export class StorageManager {
  
  /**
   * Get current localStorage usage information
   */
  static getStorageQuotaInfo(): StorageQuotaInfo {
    let used = 0;
    
    // Calculate current usage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }
    
    // Estimate total quota (typically 5-10MB, we'll use 5MB as conservative estimate)
    const total = 5 * 1024 * 1024; // 5MB in bytes
    const available = total - used;
    const percentage = (used / total) * 100;
    
    return {
      used,
      available,
      total,
      percentage
    };
  }
  
  /**
   * Check if localStorage has enough space for new data
   */
  static hasSpaceFor(dataSize: number): boolean {
    const quota = this.getStorageQuotaInfo();
    return quota.available > dataSize;
  }
  
  /**
   * Progressive cleanup of localStorage starting with least important data
   */
  static async progressiveCleanup(): Promise<StorageCleanupResult> {
    const result: StorageCleanupResult = {
      removedItems: 0,
      freedSpace: 0,
      errors: []
    };
    
    try {
      const keysToRemove: string[] = [];
      
      // Phase 1: Remove expired cache entries (more aggressive - 30 minutes instead of 60)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && this.isCacheKey(key)) {
          try {
            const value = localStorage.getItem(key);
            if (value && this.isExpiredCacheEntry(key, value)) {
              keysToRemove.push(key);
            }
          } catch (error) {
            result.errors.push(`Error processing cache key ${key}: ${error}`);
          }
        }
      }
      
      // Phase 2: Remove old image uploads (keep only 15 recent ones)
      const imageKeys = this.getImageKeys();
      const oldImageKeys = this.getOldImageKeys(imageKeys);
      keysToRemove.push(...oldImageKeys);
      
      // Phase 3: Remove old draft orders (>7 days old)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('draft_order_')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const parsed = JSON.parse(value);
              const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
              if (parsed.created_at && new Date(parsed.created_at).getTime() < sevenDaysAgo) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            result.errors.push(`Error processing draft ${key}: ${error}`);
          }
        }
      }
      
      // Phase 4: Remove expired booking state backups (>24 hours old)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('booking_state_backup_')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const parsed = JSON.parse(value);
              const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
              if (parsed.timestamp && parsed.timestamp < oneDayAgo) {
                keysToRemove.push(key);
              }
            }
          } catch (error) {
            result.errors.push(`Error processing booking ${key}: ${error}`);
          }
        }
      }
      
      // Phase 5: Remove legacy/unused keys
      const legacyKeys = ['old_marketplace_cart', 'legacy_services', 'temp_data', 'dev_cache'];
      for (const legacyKey of legacyKeys) {
        if (localStorage.getItem(legacyKey)) {
          keysToRemove.push(legacyKey);
        }
      }
      
      // Remove identified keys
      for (const key of keysToRemove) {
        try {
          const value = localStorage.getItem(key);
          const size = value ? key.length + value.length : key.length;
          localStorage.removeItem(key);
          result.removedItems++;
          result.freedSpace += size;
        } catch (error) {
          result.errors.push(`Error removing key ${key}: ${error}`);
        }
      }
      
      console.log(`Storage cleanup completed: removed ${result.removedItems} items, freed ${this.formatBytes(result.freedSpace)}`);
      
    } catch (error) {
      result.errors.push(`Storage cleanup error: ${error}`);
    }
    
    return result;
  }
  
  /**
   * Move development data from localStorage to sessionStorage
   */
  static migrateDevelopmentData(): void {
    try {
      for (const key of DEVELOPMENT_KEYS) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            // Move to sessionStorage
            sessionStorage.setItem(key, data);
            localStorage.removeItem(key);
            console.log(`Migrated ${key} from localStorage to sessionStorage`);
          } catch (error) {
            console.warn(`Failed to migrate ${key} to sessionStorage:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error during development data migration:', error);
    }
  }
  
  /**
   * Initialize storage management on app startup
   */
  static async initializeStorageManagement(): Promise<void> {
    try {
      const quota = this.getStorageQuotaInfo();
      console.log(`Storage status: ${this.formatBytes(quota.used)}/${this.formatBytes(quota.total)} (${quota.percentage.toFixed(1)}%)`);
      
      // If storage is over 80% full, run cleanup
      if (quota.percentage > 80) {
        console.log('Storage quota exceeded 80%, running cleanup...');
        await this.progressiveCleanup();
      }
      
      // Move development data to sessionStorage
      if (process.env.NODE_ENV === 'development') {
        this.migrateDevelopmentData();
      }
      
      // Set up periodic cleanup (every 5 minutes)
      setInterval(() => {
        const currentQuota = this.getStorageQuotaInfo();
        if (currentQuota.percentage > 85) {
          this.progressiveCleanup();
        }
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('Error initializing storage management:', error);
    }
  }
  
  /**
   * Safe localStorage setItem with quota handling
   */
  static safeSetItem(key: string, value: string): boolean {
    try {
      // Check if we have space
      const dataSize = key.length + value.length;
      if (!this.hasSpaceFor(dataSize)) {
        // Try cleanup first
        this.progressiveCleanup();
        
        // Check again after cleanup
        if (!this.hasSpaceFor(dataSize)) {
          console.warn(`Not enough localStorage space for ${key}`);
          return false;
        }
      }
      
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting localStorage item ${key}:`, error);
      return false;
    }
  }
  
  // Helper methods
  private static isCacheKey(key: string): boolean {
    return CACHE_KEY_PATTERNS.some(pattern => key.includes(pattern));
  }
  
  private static isExpiredCacheEntry(key: string, value: string): boolean {
    try {
      // Try to parse cache entry with timestamp
      const parsed = JSON.parse(value);
      if (parsed.timestamp && parsed.ttl) {
        const expiryTime = parsed.timestamp + parsed.ttl;
        return Date.now() > expiryTime;
      }
    } catch {
      // If not parseable as cache entry, consider old entries (>30 minutes) as expired
      const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
      return key.includes('cache_') && Date.now() > thirtyMinutesAgo;
    }
    return false;
  }
  
  private static getImageKeys(): string[] {
    const imageKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('service_image_') || key.includes('lovable-uploads/'))) {
        imageKeys.push(key);
      }
    }
    return imageKeys;
  }
  
  private static getOldImageKeys(imageKeys: string[]): string[] {
    // Keep only the 15 most recent images, remove older ones
    const keysWithTimestamp = imageKeys
      .map(key => {
        const timestampMatch = key.match(/(\d{13})/); // 13-digit timestamp
        const timestamp = timestampMatch ? parseInt(timestampMatch[1]) : 0;
        return { key, timestamp };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return keysWithTimestamp.slice(15).map(item => item.key);
  }
  
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export convenience functions
export const initializeStorageManagement = () => StorageManager.initializeStorageManagement();
export const getStorageQuotaInfo = () => StorageManager.getStorageQuotaInfo();
export const safeSetItem = (key: string, value: string) => StorageManager.safeSetItem(key, value);
export const progressiveCleanup = () => StorageManager.progressiveCleanup();
