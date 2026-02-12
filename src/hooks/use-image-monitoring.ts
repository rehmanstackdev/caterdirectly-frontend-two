import { useUnifiedImageMonitoring } from './use-unified-image-monitoring';

/**
 * Hook for monitoring image performance and collecting metrics
 * Now uses the unified image monitoring system to prevent duplication
 * @deprecated Use useUnifiedImageMonitoring directly for new code
 */
export function useImageMonitoring() {
  const unified = useUnifiedImageMonitoring();
  
  return {
    startImageLoad: unified.startImageLoad,
    recordImageMetrics: unified.recordImageMetrics,
    getImageStats: unified.getImageStats,
    getSlowImages: unified.getSlowImages,
    getFailedImages: unified.getFailedImages,
    clearMetrics: unified.clearMetrics,
    metrics: unified.metrics
  };
}
