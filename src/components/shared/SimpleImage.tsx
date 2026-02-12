
import React, { useState, useCallback } from 'react';

interface SimpleImageProps {
  src: string | null;
  alt: string;
  className?: string;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
  lazy?: boolean;
  fallbackSrc?: string;
}

/**
 * Enhanced image component with proper error handling
 * Shows clear placeholder instead of misleading images
 */
const SimpleImage = ({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[4/3]',
  onLoad,
  onError,
  lazy = true,
  fallbackSrc
}: SimpleImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    console.log('[SimpleImage] Image loaded successfully:', currentSrc);
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [currentSrc, onLoad]);

  const handleError = useCallback(() => {
    console.log('[SimpleImage] Image failed to load:', currentSrc);
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback if we haven't already and it's different from current
    if (fallbackSrc && currentSrc !== fallbackSrc && !hasError) {
      console.log('[SimpleImage] Trying fallback image:', fallbackSrc);
      setCurrentSrc(fallbackSrc);
      setIsLoading(true);
      setHasError(false);
      return;
    }
    
    onError?.();
  }, [currentSrc, fallbackSrc, hasError, onError]);

  // If no src provided or error with no fallback, show placeholder
  if (!src || (hasError && (!fallbackSrc || currentSrc === fallbackSrc))) {
    return (
      <div className={`relative ${aspectRatio} overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-12 h-12 mx-auto mb-2 bg-gray-200 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatio} overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      
      <img
        src={currentSrc || ''}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export default SimpleImage;
