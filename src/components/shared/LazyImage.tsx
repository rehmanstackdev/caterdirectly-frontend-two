
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // Load immediately if true
}

const LazyImage = ({
  src,
  alt,
  className,
  aspectRatio = 'aspect-video',
  placeholder = '/api/placeholder/400/225',
  onLoad,
  onError,
  priority = false
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before coming into view
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    console.log('[LazyImage] Image load failed:', { src, alt, hasError });
    setHasError(true);
    onError?.();
  };

  // Debug: Log image source when it changes
  React.useEffect(() => {
    if (src) {
      console.log('[LazyImage] Image src changed:', { src, alt, isInView: isInView || priority });
    } else {
      console.warn('[LazyImage] Empty src provided:', { alt, isInView: isInView || priority });
    }
  }, [src, alt, isInView, priority]);

  return (
    <div 
      ref={imgRef}
      className={cn(
        'relative overflow-hidden bg-gray-100',
        aspectRatio,
        className
      )}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
      )}
      
      {/* Actual image - only render when in view or priority */}
      {(isInView || priority) && src && (
        <img
          src={hasError ? placeholder : src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      
      {/* Show placeholder if no src provided */}
      {!src && (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs text-gray-500">No Image URL</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
