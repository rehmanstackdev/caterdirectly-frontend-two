import { useUnifiedImageMonitoring } from './use-unified-image-monitoring';

/**
 * Image monitoring hook for tracking load performance and failures
 * Now uses the unified image monitoring system to prevent duplication
 * @deprecated Use useUnifiedImageMonitoring directly for new code
 */
export function useImageMonitoring() {
  const unified = useUnifiedImageMonitoring();
  
  return {
    trackImageStart: unified.trackImageStart,
    trackImageLoad: unified.trackImageLoad,
    getMetrics: unified.getMetrics,
    getHealthReport: unified.getHealthReport,
    clearMetrics: unified.clearMetrics,
    getSlowImages: unified.getSlowImages,
    getFailedImages: unified.getFailedImages
  };
}
