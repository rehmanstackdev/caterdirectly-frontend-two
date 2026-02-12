import React, { useState, useEffect } from 'react';
import { useImageMonitoring } from '@/hooks/use-image-monitoring';
import { useImageErrorReporting } from '@/hooks/use-image-error-reporting';
import { useUnifiedImage } from '@/hooks/use-unified-image';

interface ImagePerformanceTrackerProps {
  src: string;
  onMetricsCollected?: (metrics: any) => void;
}

/**
 * Component that wraps image loading with performance tracking
 * This is used internally by OptimizedImage to collect metrics
 */
export const ImagePerformanceTracker = ({
  src,
  onMetricsCollected
}: ImagePerformanceTrackerProps) => {
  const { startImageLoad, recordImageMetrics } = useImageMonitoring();
  const { reportImageError } = useImageErrorReporting();
  const [retryCount, setRetryCount] = useState(0);

  const { imageUrl, isLoading, hasError, retry } = useUnifiedImage(src, {
    retryOnError: true,
    maxRetries: 2,
    timeout: 3000
  });

  useEffect(() => {
    if (src && !isLoading) {
      startImageLoad(src);
    }
  }, [src, isLoading, startImageLoad]);

  useEffect(() => {
    if (!isLoading && src) {
      if (hasError) {
        recordImageMetrics(src, false, 'Load failed', undefined, retryCount);
        reportImageError(src, 'Image load failed', 'ImagePerformanceTracker');
      } else {
        recordImageMetrics(src, true, undefined, undefined, retryCount);
      }
      
      if (onMetricsCollected) {
        onMetricsCollected({
          url: src,
          success: !hasError,
          retryCount,
          finalUrl: imageUrl
        });
      }
    }
  }, [isLoading, hasError, src, imageUrl, retryCount, recordImageMetrics, reportImageError, onMetricsCollected]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    retry();
  };

  return null; // This is a tracking component, doesn't render anything
};