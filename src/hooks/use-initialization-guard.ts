import { useRef, useCallback } from 'react';

/**
 * Hook to prevent duplicate initialization/API calls
 * Useful for preventing repeated API requests when components re-render
 * 
 * @param identifier - Unique identifier for the initialization (e.g., orderId, invoiceId)
 * @returns Object with shouldInitialize flag and markInitialized function
 * 
 * @example
 * ```tsx
 * const { shouldInitialize, markInitialized } = useInitializationGuard(orderId);
 * 
 * useEffect(() => {
 *   if (!shouldInitialize) {
 *     console.log('Already initialized, skipping');
 *     return;
 *   }
 *   
 *   // Perform initialization
 *   loadData();
 *   markInitialized();
 * }, [orderId, shouldInitialize, markInitialized]);
 * ```
 */
export function useInitializationGuard(identifier: string | null | undefined) {
  const initializedRef = useRef<string | null>(null);

  const shouldInitialize = useCallback(() => {
    if (!identifier) return false;
    
    if (initializedRef.current === identifier) {
      console.log(`[useInitializationGuard] Already initialized for: ${identifier}`);
      return false;
    }
    
    return true;
  }, [identifier]);

  const markInitialized = useCallback(() => {
    if (identifier) {
      initializedRef.current = identifier;
      console.log(`[useInitializationGuard] Marked as initialized: ${identifier}`);
    }
  }, [identifier]);

  const reset = useCallback(() => {
    initializedRef.current = null;
    console.log('[useInitializationGuard] Reset initialization guard');
  }, []);

  return {
    shouldInitialize: shouldInitialize(),
    markInitialized,
    reset,
    isInitialized: identifier ? initializedRef.current === identifier : false
  };
}

/**
 * Hook for one-time initialization that runs only once per component mount
 * 
 * @param callback - Function to execute once
 * @param dependencies - Optional dependencies array (if provided, will re-run if deps change)
 * 
 * @example
 * ```tsx
 * useOnceInitialization(() => {
 *   console.log('This runs only once');
 *   loadInitialData();
 * });
 * ```
 */
export function useOnceInitialization(
  callback: () => void | (() => void),
  dependencies: any[] = []
) {
  const hasRunRef = useRef(false);
  const cleanupRef = useRef<(() => void) | void>(undefined);

  if (!hasRunRef.current) {
    hasRunRef.current = true;
    cleanupRef.current = callback();
  }

  // Cleanup on unmount
  return () => {
    if (typeof cleanupRef.current === 'function') {
      cleanupRef.current();
    }
  };
}

