import { useState, useRef, useEffect, useCallback } from 'react';

interface UseLazyImageOptions {
  rootMargin?: string;
  threshold?: number;
  enabled?: boolean;
}

/**
 * Hook for lazy loading images with intersection observer
 */
export function useLazyImage(options: UseLazyImageOptions = {}) {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    enabled = true
  } = options;

  const [isInView, setIsInView] = useState(!enabled);
  const [hasLoaded, setHasLoaded] = useState(false);
  const imgRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback((node: HTMLElement | null) => {
    if (!enabled) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    imgRef.current = node;

    if (node) {
      // Create new observer
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isInView) {
              setIsInView(true);
              // Stop observing once in view
              observerRef.current?.disconnect();
            }
          });
        },
        {
          rootMargin,
          threshold
        }
      );

      observerRef.current.observe(node);
    }
  }, [enabled, rootMargin, threshold, isInView]);

  const onLoad = useCallback(() => {
    setHasLoaded(true);
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    setRef,
    isInView,
    hasLoaded,
    onLoad,
    shouldLoad: isInView || !enabled
  };
}