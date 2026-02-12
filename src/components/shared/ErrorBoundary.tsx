
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if this is a chunk loading error
    const isChunkError = error.message.includes('Failed to fetch dynamically imported module') ||
                         error.message.includes('Importing a module script failed');
    
    if (isChunkError) {
      console.log('Chunk load error detected, refreshing page...');
      // Auto-refresh on chunk errors (new deployment available)
      window.location.reload();
    }
    
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but there was a problem loading this page. Please try refreshing the browser.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Error: {this.state.error?.message || "Unknown error"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#F07712] text-white px-4 py-2 rounded-md hover:bg-[#F07712]/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
