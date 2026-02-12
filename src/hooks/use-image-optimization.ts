
import { useCallback } from 'react';

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  blur?: boolean;
}

/**
 * Hook for optimizing image URLs with compression and format conversion
 */
export function useImageOptimization() {
  const optimizeImageUrl = useCallback((
    originalUrl: string, 
    options: ImageOptimizationOptions = {}
  ): string => {
    const {
      width,
      height,
      quality = 80,
      format = 'webp', // Default to WebP for better performance
      blur = false
    } = options;

    // Don't optimize placeholder or data URLs
    if (!originalUrl || 
        originalUrl.includes('placeholder') || 
        originalUrl.includes('via.placeholder') ||
        originalUrl.startsWith('data:')) {
      return originalUrl;
    }

    // For Unsplash images, use their optimization parameters
    if (originalUrl.includes('unsplash.com')) {
      const url = new URL(originalUrl);
      if (width) url.searchParams.set('w', width.toString());
      if (height) url.searchParams.set('h', height.toString());
      url.searchParams.set('q', quality.toString());
      url.searchParams.set('fm', format);
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('auto', 'format');
      if (blur) url.searchParams.set('blur', '2');
      return url.toString();
    }

    // For Builder.io images (cdn.builder.io), add optimization parameters
    if (originalUrl.includes('cdn.builder.io')) {
      const url = new URL(originalUrl);
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', format);
      url.searchParams.set('fit', 'cover');
      if (blur) url.searchParams.set('blur', '2');
      return url.toString();
    }

    // For Supabase storage, we can't transform but we can add cache headers
    if (originalUrl.includes('supabase.co') || originalUrl.includes('storage/v1/object/public/')) {
      // Add cache buster for better caching behavior
      const url = new URL(originalUrl);
      url.searchParams.set('t', 'optimized');
      return url.toString();
    }

    // For other URLs, return as-is (could add Cloudinary or other service integration here)
    return originalUrl;
  }, []);

  const createImageVariants = useCallback((originalUrl: string) => {
    return {
      thumbnail: optimizeImageUrl(originalUrl, { width: 150, height: 150, quality: 70, format: 'webp' }),
      small: optimizeImageUrl(originalUrl, { width: 400, height: 300, quality: 75, format: 'webp' }),
      medium: optimizeImageUrl(originalUrl, { width: 800, height: 600, quality: 80, format: 'webp' }),
      large: optimizeImageUrl(originalUrl, { width: 1200, height: 900, quality: 85, format: 'webp' }),
      blur: optimizeImageUrl(originalUrl, { width: 40, height: 30, quality: 20, blur: true, format: 'webp' })
    };
  }, [optimizeImageUrl]);

  // New function to get responsive image sizes based on display dimensions
  const getResponsiveImageUrl = useCallback((
    originalUrl: string,
    displayWidth: number,
    displayHeight?: number
  ): string => {
    // Use lower quality for mobile devices (< 768px)
    const isMobile = displayWidth < 768;
    const quality = isMobile ? 75 : 85;
    
    // Calculate optimal width (use 2x for retina displays)
    const optimalWidth = Math.min(displayWidth * 2, 1920);
    const optimalHeight = displayHeight ? Math.min(displayHeight * 2, 1080) : undefined;
    
    return optimizeImageUrl(originalUrl, {
      width: optimalWidth,
      height: optimalHeight,
      quality,
      format: 'webp'
    });
  }, [optimizeImageUrl]);

  return {
    optimizeImageUrl,
    createImageVariants,
    getResponsiveImageUrl
  };
}
