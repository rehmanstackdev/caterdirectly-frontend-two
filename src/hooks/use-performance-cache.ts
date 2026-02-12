
import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  memoryTTL: number;
  localStorageTTL: number;
  indexedDBTTL: number;
  enableCompression: boolean;
}

const DEFAULT_CONFIG: CacheConfig = {
  memoryTTL: 15 * 60 * 1000, // 15 minutes (extended for marketplace data)
  localStorageTTL: 60 * 60 * 1000, // 60 minutes (extended for better performance)
  indexedDBTTL: 4 * 60 * 60 * 1000, // 4 hours (extended)
  enableCompression: true
};

class PerformanceCache {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private compressionCache = new Map<string, string>();

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupInterval();
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanExpiredEntries();
    }, 60000); // Clean every minute
  }

  private cleanExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.memoryCache.delete(key);
      }
    }
  }

  private compress(data: any): string {
    if (!this.config.enableCompression) return JSON.stringify(data);
    
    const json = JSON.stringify(data);
    // Simple compression by removing whitespace and common patterns
    return json.replace(/\s+/g, ' ').trim();
  }

  private decompress(compressed: string): any {
    return JSON.parse(compressed);
  }

  async get<T>(key: string): Promise<T | null> {
    const now = Date.now();

    // L1: Memory cache (fastest)
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && now - memoryEntry.timestamp < memoryEntry.ttl) {
      return memoryEntry.data;
    }

    // L2: localStorage cache
    try {
      const localData = localStorage.getItem(`cache_${key}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (now - parsed.timestamp < this.config.localStorageTTL) {
          // Restore to memory cache
          this.memoryCache.set(key, {
            data: parsed.data,
            timestamp: parsed.timestamp,
            ttl: this.config.memoryTTL
          });
          return parsed.data;
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Error reading from localStorage cache:', error);
    }

    return null;
  }

  async set<T>(key: string, data: T, customTTL?: number): Promise<void> {
    const now = Date.now();
    const ttl = customTTL || this.config.memoryTTL;

    // Store in memory cache
    this.memoryCache.set(key, { data, timestamp: now, ttl });

    // Store in localStorage with compression and quota management
    try {
      const compressed = this.compress(data);
      const cacheData = {
        data,
        timestamp: now,
        compressed
      };
      
      // Use dynamic import to avoid circular dependency and handle quota
      const { safeSetItem } = await import('../utils/storage-manager');
      if (!safeSetItem(`cache_${key}`, JSON.stringify(cacheData))) {
        console.warn(`Failed to store cache item ${key} in localStorage due to quota`);
      }
    } catch (error) {
      console.warn('Error writing to localStorage cache:', error);
    }
  }

  invalidate(pattern: string): void {
    // Invalidate memory cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate localStorage
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_') && key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Error invalidating localStorage cache:', error);
    }
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Error clearing localStorage cache:', error);
    }
  }
}

const globalCache = new PerformanceCache();

export const usePerformanceCache = <T>() => {
  const [loading, setLoading] = useState(false);
  
  const get = useCallback(async (key: string): Promise<T | null> => {
    return await globalCache.get<T>(key);
  }, []);

  const set = useCallback(async (key: string, data: T, ttl?: number): Promise<void> => {
    await globalCache.set(key, data, ttl);
  }, []);

  const invalidate = useCallback((pattern: string): void => {
    globalCache.invalidate(pattern);
  }, []);

  return { get, set, invalidate, loading };
};

export { globalCache };
