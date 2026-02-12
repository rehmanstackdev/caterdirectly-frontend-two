
import { useMemo, useCallback } from 'react';
import { useImageOptimization } from '@/hooks/use-image-optimization';
import { useLazyImage } from '@/hooks/use-lazy-image';
import { useUnifiedImage } from '@/hooks/use-unified-image';
import { ServiceItem } from '@/types/service-types';

interface OptimizedImageProps {
  src: string | ServiceItem | null;
  alt: string;
  className?: string;
  aspectRatio?: string;
  size?: 'thumbnail' | 'small' | 'medium' | 'large';
  lazy?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  showPlaceholder?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  fallbackImage?: string;
}

/**
 * Optimized image component with WebP compression, lazy loading, and responsive sizing
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  aspectRatio = 'aspect-[4/3]',
  size = 'medium',
  lazy = true,
  priority = false,
  onLoad,
  onError,
  showPlaceholder = true,
  objectFit = 'cover',
  fallbackImage
}: OptimizedImageProps) => {
  const { optimizeImageUrl, createImageVariants } = useImageOptimization();
  const { setRef, shouldLoad, hasLoaded, onLoad: onLazyLoad } = useLazyImage({ 
    enabled: lazy && !priority 
  });

  // Get the base image URL using unified system
  const { imageUrl, isLoading, hasError, retry } = useUnifiedImage(src, {
    fallbackImage,
    retryOnError: true,
    maxRetries: 2,
    timeout: 3000,
    priority
  });

  // Optimize the image URL based on size with WebP format
  const optimizedUrl = useMemo(() => {
    if (!imageUrl) return '';
    
    const sizeMap = {
      thumbnail: { width: 150, height: 150 },
      small: { width: 400, height: 300 },
      medium: { width: 800, height: 600 },
      large: { width: 1200, height: 900 }
    };

    return optimizeImageUrl(imageUrl, {
      ...sizeMap[size],
      quality: priority ? 90 : 80,
      format: 'webp' // Force WebP format for optimal compression
    });
  }, [imageUrl, size, priority, optimizeImageUrl]);

  // Create WebP blur placeholder
  const blurUrl = useMemo(() => {
    if (!showPlaceholder || !imageUrl) return '';
    return optimizeImageUrl(imageUrl, { 
      width: 40, 
      height: 30, 
      quality: 20, 
      blur: true,
      format: 'webp' 
    });
  }, [imageUrl, showPlaceholder, optimizeImageUrl]);

  // Handle combined load events
  const handleLoad = useCallback(() => {
    onLazyLoad();
    onLoad?.();
  }, [onLazyLoad, onLoad]);

  // Handle error state
  if (hasError) {
    return (
      <div
        ref={setRef}
        className={`${className} ${aspectRatio} bg-muted flex items-center justify-center cursor-pointer`}
        onClick={retry}
        title="Click to retry loading image"
      >
        <div className="text-muted-foreground text-xs text-center p-2">
          <div>{alt ? `${alt} failed to load` : "Image failed to load"}</div>
          <div className="text-xs mt-1 text-primary">Click to retry</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setRef}
      className={`relative ${aspectRatio} overflow-hidden ${className}`}
    >
      {/* WebP blur placeholder shown while loading */}
      {showPlaceholder && blurUrl && !hasLoaded && (
        <img
          src={blurUrl}
          alt=""
          className={`absolute inset-0 w-full h-full object-${objectFit} filter blur-sm scale-110`}
          aria-hidden="true"
        />
      )}

      {/* Loading skeleton */}
      {(isLoading || !shouldLoad) && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Main WebP optimized image with responsive srcSet */}
      {shouldLoad && optimizedUrl && (
        <img
          src={optimizedUrl}
          alt={alt}
          className={`w-full h-full object-${objectFit} transition-opacity duration-300 ${
            hasLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={onError}
          // Add responsive srcSet for different screen sizes
          srcSet={imageUrl ? `
            ${optimizeImageUrl(imageUrl, { width: 400, height: 300, format: 'webp' })} 400w,
            ${optimizeImageUrl(imageUrl, { width: 800, height: 600, format: 'webp' })} 800w,
            ${optimizedUrl} 1200w
          ` : undefined}
          sizes="(max-width: 768px) 400px, (max-width: 1200px) 800px, 1200px"
        />
      )}
    </div>
  );
};

export default OptimizedImage;
