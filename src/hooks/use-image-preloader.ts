import { useCallback, useRef } from 'react';

interface PreloadOptions {
  priority?: boolean;
  timeout?: number;
}

/**
 * Hook for preloading images to improve perceived performance
 */
export function useImagePreloader() {
  const preloadCache = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((
    url: string, 
    options: PreloadOptions = {}
  ): Promise<boolean> => {
    const { priority = false, timeout = 5000 } = options;

    // Skip if already preloaded or invalid URL
    if (!url || preloadCache.current.has(url)) {
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const img = new Image();
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          resolved = true;
          preloadCache.current.add(url);
        }
      };

      // Set up timeout
      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          console.warn(`[useImagePreloader] Preload timeout for: ${url}`);
          resolve(false);
        }
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        cleanup();
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        cleanup();
        resolve(false);
      };

      // Set fetchPriority for modern browsers
      if ('fetchPriority' in img && priority) {
        (img as any).fetchPriority = 'high';
      }

      img.src = url;
    });
  }, []);

  const preloadImages = useCallback(async (
    urls: string[], 
    options: PreloadOptions = {}
  ): Promise<{ loaded: number; failed: number }> => {
    const results = await Promise.allSettled(
      urls.map(url => preloadImage(url, options))
    );

    const loaded = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.length - loaded;

    console.log(`[useImagePreloader] Preloaded ${loaded}/${urls.length} images`);
    
    return { loaded, failed };
  }, [preloadImage]);

  const clearCache = useCallback(() => {
    preloadCache.current.clear();
  }, []);

  return {
    preloadImage,
    preloadImages,
    clearCache,
    getCacheSize: () => preloadCache.current.size
  };
}