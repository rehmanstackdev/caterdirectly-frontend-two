
import { useState, useCallback, useMemo } from 'react';
import { ServiceItem } from '@/types/service-types';
import { useUnifiedServiceImage } from '@/hooks/useUnifiedServiceImage';
import { useImageOptimization } from '@/hooks/use-image-optimization';

interface UnifiedImageProps {
  service?: ServiceItem | string | null;
  src?: string | null;
  alt: string;
  className?: string;
  aspectRatio?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  showLoadingState?: boolean;
  enableRetry?: boolean;
  fallbackContent?: React.ReactNode;
}

/**
 * UNIFIED IMAGE COMPONENT - Single component for all image display needs
 * Now with automatic WebP optimization and responsive sizing
 */
const UnifiedImage = ({
  service,
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[4/3]',
  objectFit = 'cover',
  priority = false,
  onLoad,
  onError,
  showLoadingState = true,
  enableRetry = true,
  fallbackContent
}: UnifiedImageProps) => {
  const [imageLoadState, setImageLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);
  
  // Use unified image resolution for services, or direct src for simple images
  const { 
    imageUrl, 
    isLoading: hookIsLoading, 
    hasError: hookHasError, 
    retry,
    metadata 
  } = useUnifiedServiceImage(src || service, {
    enableRetry,
    priority,
    timeout: priority ? 5000 : 3000
  });

  const { getResponsiveImageUrl } = useImageOptimization();

  // Calculate responsive image URL based on container size
  const optimizedImageUrl = useMemo(() => {
    if (!imageUrl) return '';
    
    // Get container dimensions for responsive sizing
    const containerWidth = elementRef?.offsetWidth || 800;
    const containerHeight = elementRef?.offsetHeight || 600;
    
    return getResponsiveImageUrl(imageUrl, containerWidth, containerHeight);
  }, [imageUrl, elementRef, getResponsiveImageUrl]);

  const handleImageLoad = useCallback(() => {
    setImageLoadState('loaded');
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setImageLoadState('error');
    onError?.();
  }, [onError]);

  const handleRetry = useCallback(() => {
    setImageLoadState('loading');
    retry();
  }, [retry]);

  // Determine final loading state
  const isLoading = showLoadingState && (hookIsLoading || imageLoadState === 'loading');
  const hasError = hookHasError || imageLoadState === 'error';
  const isLoaded = !isLoading && !hasError && imageLoadState === 'loaded';

  // Default fallback content
  const defaultFallback = (
    <div className="absolute inset-0 bg-muted/10 flex items-center justify-center">
      <div className="text-center text-muted-foreground">
        <div className="w-12 h-12 mx-auto mb-2 bg-muted/20 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-xs">No image available</p>
        {enableRetry && hasError && metadata.attempts < 2 && (
          <button 
            onClick={handleRetry}
            className="mt-2 text-xs text-primary hover:text-primary/80 underline"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div 
      ref={setElementRef}
      className={`relative ${aspectRatio} overflow-hidden bg-muted/5 ${className}`}
    >
      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted/10 animate-pulse" />
      )}
      
      {/* Optimized image display with WebP format and responsive sizing */}
      {optimizedImageUrl && !hasError && (
        <img
          src={optimizedImageUrl}
          alt={alt}
          className={`w-full h-full ${
            objectFit === 'contain'
              ? 'object-contain'
              : objectFit === 'fill'
              ? 'object-fill'
              : objectFit === 'none'
              ? 'object-none'
              : objectFit === 'scale-down'
              ? 'object-scale-down'
              : 'object-cover'
          } transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleImageLoad}
          onError={handleImageError}
          // Add srcSet for additional responsive support
          srcSet={imageUrl ? `${getResponsiveImageUrl(imageUrl, 400)} 400w, ${getResponsiveImageUrl(imageUrl, 800)} 800w, ${optimizedImageUrl} 1200w` : undefined}
          sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
        />
      )}
      
      {/* Error/fallback state */}
      {(!optimizedImageUrl || hasError) && (fallbackContent || defaultFallback)}
      
      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded opacity-0 hover:opacity-100 transition-opacity">
          {metadata.source} | {metadata.attempts} | WebP
        </div>
      )}
    </div>
  );
};

export default UnifiedImage;
