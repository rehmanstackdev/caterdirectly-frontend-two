import React, { Component, ReactNode } from 'react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PersistenceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.persistenceFailure('error-boundary', error, 1, false);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Try to recover by clearing potentially corrupted localStorage data
    try {
      const persistenceKeys = [
        'booking-state-backup',
        'vendor_application_draft_v1'
      ];
      
      persistenceKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          logger.log(`Cleared potentially corrupted data: ${key}`);
        }
      });
    } catch (cleanupError) {
      logger.error('Failed to cleanup corrupted data:', cleanupError);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/10">
          <h3 className="text-sm font-medium text-destructive">
            Data Recovery in Progress
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            We've detected an issue with saved data and are attempting to recover. 
            Please refresh the page to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}