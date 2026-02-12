interface ResponsiveImageProps {
  src: string; // Base image URL
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // Above-fold images
  className?: string;
  sizes?: string;
}

/**
 * Optimized image component with AVIF/WebP support and responsive srcset
 * Automatically generates optimized URLs for Builder.io and Supabase images
 */
export function ResponsiveImage({ 
  src, 
  alt, 
  width = 800, 
  height = 600, 
  priority = false,
  className = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
}: ResponsiveImageProps) {
  // Generate optimized URLs for different formats and sizes
  const generateUrl = (format: 'avif' | 'webp' | 'jpg', size: number) => {
    // For Builder.io URLs
    if (src.includes('builder.io')) {
      return `${src}${src.includes('?') ? '&' : '?'}format=${format}&width=${size}&quality=85`;
    }
    // For Supabase URLs
    if (src.includes('supabase')) {
      const calcHeight = Math.round(height * (size / width));
      return `${src}${src.includes('?') ? '&' : '?'}width=${size}&height=${calcHeight}&resize=cover&quality=80&format=${format}`;
    }
    return src;
  };
  
  const responsiveSizes = [400, 800, 1200, 1600];
  
  return (
    <picture>
      {/* AVIF format (60% smaller, Chrome/Edge only) */}
      <source
        type="image/avif"
        srcSet={responsiveSizes.map(size => `${generateUrl('avif', size)} ${size}w`).join(', ')}
        sizes={sizes}
      />
      
      {/* WebP format (30% smaller, universal support) */}
      <source
        type="image/webp"
        srcSet={responsiveSizes.map(size => `${generateUrl('webp', size)} ${size}w`).join(', ')}
        sizes={sizes}
      />
      
      {/* JPEG fallback */}
      <img
        src={generateUrl('jpg', 800)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={className}
      />
    </picture>
  );
}
