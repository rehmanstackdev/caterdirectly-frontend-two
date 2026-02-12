import { useCallback, useRef, useState } from 'react';

interface ImageMetrics {
  url: string;
  loadTime: number;
  fileSize: number;
  success: boolean;
  error?: string;
  timestamp: number;
  retryCount: number;
}

interface ImageLoadEvent {
  url: string;
  success: boolean;
  loadTime: number;
  source: string;
  service?: string;
  timestamp: Date;
  userAgent: string;
  error?: string;
}

interface ImageStats {
  totalImages: number;
  successfulLoads: number;
  failedLoads: number;
  averageLoadTime: number;
  totalDataTransferred: number;
  successRate: number;
}

interface UnifiedImageMonitoring {
  // New unified API
  startImageLoad: (url: string) => void;
  recordImageMetrics: (url: string, success: boolean, error?: string, fileSize?: number, retryCount?: number) => void;
  getImageStats: () => ImageStats;
  getSlowImages: (threshold?: number) => ImageMetrics[];
  getFailedImages: () => Record<string, number>;
  clearMetrics: () => void;
  
  // Legacy API compatibility
  trackImageStart: (url: string) => void;
  trackImageLoad: (url: string, success: boolean, source?: string, service?: string, error?: string) => void;
  getMetrics: () => {
    totalLoads: number;
    successfulLoads: number;
    failedLoads: number;
    averageLoadTime: number;
    successRate: number;
    errorReasons: Record<string, number>;
  };
  getHealthReport: () => any;
  
  // Shared state
  metrics: ImageMetrics[];
}

// Singleton state to prevent duplication
let sharedMetrics: ImageMetrics[] = [];
let sharedLoadStartTimes: Map<string, number> = new Map();

/**
 * Unified image monitoring hook that consolidates both existing image monitoring systems
 * Provides backward compatibility while preventing state duplication
 */
export function useUnifiedImageMonitoring(): UnifiedImageMonitoring {
  const [, forceUpdate] = useState({});
  const eventLogRef = useRef<ImageLoadEvent[]>([]);

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Unified implementation
  const startImageLoad = useCallback((url: string) => {
    sharedLoadStartTimes.set(url, performance.now());
  }, []);

  const recordImageMetrics = useCallback((
    url: string,
    success: boolean,
    error?: string,
    fileSize?: number,
    retryCount: number = 0
  ) => {
    const loadTime = performance.now() - (sharedLoadStartTimes.get(url) || 0);
    sharedLoadStartTimes.delete(url);

    const metric: ImageMetrics = {
      url,
      loadTime,
      fileSize: fileSize || 0,
      success,
      error,
      timestamp: Date.now(),
      retryCount
    };

    sharedMetrics.push(metric);
    
    // Keep only last 1000 entries to prevent memory issues
    if (sharedMetrics.length > 1000) {
      sharedMetrics = sharedMetrics.slice(-1000);
    }

    // Log performance issues
    if (!success) {
      console.error(`[UnifiedImageMonitoring] Failed to load: ${url}`, { error, loadTime, retryCount });
    } else if (loadTime > 3000) {
      console.warn(`[UnifiedImageMonitoring] Slow load (${loadTime.toFixed(0)}ms): ${url}`);
    }

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'image_load', {
        event_category: 'performance',
        event_label: success ? 'success' : 'error',
        value: Math.round(loadTime)
      });
    }

    triggerUpdate();
  }, [triggerUpdate]);

  const getImageStats = useCallback((): ImageStats => {
    const total = sharedMetrics.length;
    const successful = sharedMetrics.filter(m => m.success).length;
    const failed = total - successful;
    const avgLoadTime = total > 0 
      ? sharedMetrics.reduce((sum, m) => sum + m.loadTime, 0) / total 
      : 0;
    const totalData = sharedMetrics.reduce((sum, m) => sum + m.fileSize, 0);

    return {
      totalImages: total,
      successfulLoads: successful,
      failedLoads: failed,
      averageLoadTime: avgLoadTime,
      totalDataTransferred: totalData,
      successRate: total > 0 ? (successful / total) * 100 : 0
    };
  }, []);

  const getSlowImages = useCallback((threshold: number = 2000) => {
    return sharedMetrics
      .filter(m => m.loadTime > threshold)
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 10);
  }, []);

  const getFailedImages = useCallback(() => {
    return sharedMetrics
      .filter(m => !m.success)
      .reduce((acc, m) => {
        acc[m.url] = (acc[m.url] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
  }, []);

  const clearMetrics = useCallback(() => {
    sharedMetrics = [];
    sharedLoadStartTimes.clear();
    eventLogRef.current = [];
    triggerUpdate();
  }, [triggerUpdate]);

  // Legacy API compatibility
  const trackImageStart = useCallback((url: string) => {
    startImageLoad(url);
  }, [startImageLoad]);

  const trackImageLoad = useCallback((
    url: string,
    success: boolean,
    source: string = 'unknown',
    service?: string,
    error?: string
  ) => {
    const startTime = sharedLoadStartTimes.get(url) || performance.now();
    const loadTime = performance.now() - startTime;
    
    const event: ImageLoadEvent = {
      url,
      success,
      loadTime,
      source,
      service,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      error
    };

    eventLogRef.current.push(event);
    
    // Keep only last 100 events
    if (eventLogRef.current.length > 100) {
      eventLogRef.current = eventLogRef.current.slice(-100);
    }

    // Also record in unified metrics
    recordImageMetrics(url, success, error, 0, 0);
  }, [recordImageMetrics]);

  const getMetrics = useCallback(() => {
    const events = eventLogRef.current;
    const totalLoads = events.length;
    const successfulLoads = events.filter(e => e.success).length;
    const failedLoads = totalLoads - successfulLoads;
    
    const loadTimes = events.filter(e => e.success).map(e => e.loadTime);
    const averageLoadTime = loadTimes.length > 0 
      ? loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length 
      : 0;
    
    const successRate = totalLoads > 0 ? (successfulLoads / totalLoads) * 100 : 0;
    
    const errorReasons = events
      .filter(e => !e.success && e.error)
      .reduce((acc, e) => {
        const reason = e.error || 'unknown';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalLoads,
      successfulLoads,
      failedLoads,
      averageLoadTime: Math.round(averageLoadTime),
      successRate: Math.round(successRate * 100) / 100,
      errorReasons
    };
  }, []);

  const getHealthReport = useCallback(() => {
    const metrics = getMetrics();
    const recentEvents = eventLogRef.current.slice(-20);
    
    const recentSuccessRate = recentEvents.length > 0 
      ? (recentEvents.filter(e => e.success).length / recentEvents.length) * 100 
      : 100;

    let status: 'healthy' | 'warning' | 'critical';
    if (recentSuccessRate >= 90) {
      status = 'healthy';
    } else if (recentSuccessRate >= 70) {
      status = 'warning';
    } else {
      status = 'critical';
    }

    return {
      status,
      recentSuccessRate: Math.round(recentSuccessRate * 100) / 100,
      ...metrics,
      recommendations: []
    };
  }, [getMetrics]);

  return {
    // New unified API
    startImageLoad,
    recordImageMetrics,
    getImageStats,
    getSlowImages,
    getFailedImages,
    clearMetrics,
    
    // Legacy API compatibility
    trackImageStart,
    trackImageLoad,
    getMetrics,
    getHealthReport,
    
    // Shared state
    metrics: sharedMetrics.slice(-100)
  };
}
