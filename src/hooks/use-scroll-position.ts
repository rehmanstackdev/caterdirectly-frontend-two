
import { useEffect, useRef, useCallback } from 'react';

interface UseScrollPositionOptions {
  key: string; // Unique key for this scroll position
  preserveOnReload?: boolean;
  debounceMs?: number;
}

export const useScrollPosition = ({ 
  key, 
  preserveOnReload = true,
  debounceMs = 100 
}: UseScrollPositionOptions) => {
  const scrollPositions = useRef<Map<string, number>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isRestoringRef = useRef(false);

  // Save scroll position with debouncing
  const saveScrollPosition = useCallback(() => {
    if (isRestoringRef.current) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const scrollY = window.scrollY;
      scrollPositions.current.set(key, scrollY);
      
      if (preserveOnReload) {
        sessionStorage.setItem(`scroll-${key}`, scrollY.toString());
      }
    }, debounceMs);
  }, [key, preserveOnReload, debounceMs]);

  // Restore scroll position
  const restoreScrollPosition = useCallback(() => {
    let savedPosition = scrollPositions.current.get(key);
    
    if (!savedPosition && preserveOnReload) {
      const stored = sessionStorage.getItem(`scroll-${key}`);
      savedPosition = stored ? parseInt(stored, 10) : 0;
    }
    
    if (savedPosition && savedPosition > 0) {
      isRestoringRef.current = true;
      
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedPosition, behavior: 'instant' });
        
        // Reset flag after a short delay
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 100);
      });
    }
  }, [key, preserveOnReload]);

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveScrollPosition]);

  return {
    restoreScrollPosition,
    saveScrollPosition: () => saveScrollPosition()
  };
};
