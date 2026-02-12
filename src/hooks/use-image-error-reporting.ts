import { useCallback } from 'react';
import { toast } from 'sonner';

interface ImageError {
  url: string;
  error: string;
  timestamp: number;
  userAgent: string;
  viewport: string;
  context?: string;
}

/**
 * Hook for centralized image error reporting and user feedback
 */
export function useImageErrorReporting() {
  const reportImageError = useCallback((
    url: string,
    error: string,
    context?: string,
    showUserToast: boolean = false
  ) => {
    const errorData: ImageError = {
      url,
      error,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      context
    };

    // Log to console for debugging
    console.error('[ImageError]', errorData);

    // Send to external error reporting service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(new Error(`Image load failed: ${error}`), {
        tags: { component: 'image_system' },
        extra: errorData
      });
    }

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'image_error', {
        event_category: 'error',
        event_label: error,
        value: 1
      });
    }

    // Show user-friendly toast if requested
    if (showUserToast) {
      toast.error('Image failed to load', {
        description: 'We\'re working to fix this issue. Please try refreshing the page.',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload()
        }
      });
    }

    // Store in local storage for offline analysis
    try {
      const storedErrors = JSON.parse(localStorage.getItem('imageErrors') || '[]');
      storedErrors.push(errorData);
      // Keep only last 50 errors
      const trimmedErrors = storedErrors.slice(-50);
      localStorage.setItem('imageErrors', JSON.stringify(trimmedErrors));
    } catch (e) {
      console.warn('[ImageError] Failed to store error in localStorage:', e);
    }
  }, []);

  const getStoredErrors = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('imageErrors') || '[]') as ImageError[];
    } catch {
      return [];
    }
  }, []);

  const clearStoredErrors = useCallback(() => {
    localStorage.removeItem('imageErrors');
  }, []);

  const generateErrorReport = useCallback(() => {
    const errors = getStoredErrors();
    const errorsByUrl = errors.reduce((acc, error) => {
      acc[error.url] = (acc[error.url] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const errorsByType = errors.reduce((acc, error) => {
      acc[error.error] = (acc[error.error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalErrors: errors.length,
      errorsByUrl: Object.entries(errorsByUrl)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      errorsByType: Object.entries(errorsByType)
        .sort(([,a], [,b]) => b - a),
      recentErrors: errors.slice(-10)
    };
  }, [getStoredErrors]);

  return {
    reportImageError,
    getStoredErrors,
    clearStoredErrors,
    generateErrorReport
  };
}
