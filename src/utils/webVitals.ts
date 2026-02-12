import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals';

interface MetricData {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

function sendToAnalytics(metric: Metric) {
  const metricData: MetricData = {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    delta: metric.delta,
    rating: metric.rating
  };
  
  // Send to Google Analytics 4 (if available)
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as any).gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.delta * 1000 : metric.delta),
      event_label: metric.id,
      metric_rating: metric.rating,
      non_interaction: true,
    });
  }
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: Math.round(metric.value),
      rating: metric.rating,
      delta: Math.round(metric.delta)
    });
  }
}

/**
 * Initialize Web Vitals tracking for Core Web Vitals metrics
 * Call this once in your main.tsx after React render
 */
export function initWebVitals() {
  onCLS(sendToAnalytics);
  onINP(sendToAnalytics); // Replaced FID with INP (newer metric)
  onLCP(sendToAnalytics);
  onFCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
