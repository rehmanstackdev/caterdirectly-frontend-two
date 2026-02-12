
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ServiceItem } from '@/types/service-types';
import StatusBadge from './StatusBadge';
import { getServiceTypeLabel } from '@/utils/service-utils';

interface ServiceImageProps {
  service: ServiceItem;
}

const ServiceImage: React.FC<ServiceImageProps> = ({ service }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
    setHasAttemptedLoad(true);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    setHasAttemptedLoad(true);
  };

  // Cleanup blob URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (service.image && service.image.startsWith('blob:')) {
        URL.revokeObjectURL(service.image);
      }
    };
  }, [service.image]);

  // Check if we have a valid image
  const hasValidImage = service.image && 
    typeof service.image === 'string' && 
    service.image.trim() !== '' && 
    !imageError;

  // Get the image source with fallback
  const getImageSrc = () => {
    if (!hasValidImage) {
      return null; // No image to display
    }
    
    // Handle blob URLs (from local file uploads)
    if (service.image.startsWith('blob:')) {
      return service.image;
    }
    // Handle different image URL formats
    if (service.image.startsWith('http')) {
      return service.image;
    }
    // Handle relative paths
    if (service.image.startsWith('/')) {
      return service.image;
    }
    // Avoid calling Supabase public storage URLs directly — treat as absent
    if (service.image.includes('storage/v1/object/public/') || service.image.includes('supabase.co')) {
      return null;
    }
    return service.image;
  };

  const imageSrc = getImageSrc();

  return (
    <div className="aspect-video relative">
      {imageSrc ? (
        <>
          {imageLoading && !hasAttemptedLoad && (
            <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Loading...</div>
            </div>
          )}
          
          <img 
            src={imageSrc}
            alt={service.name || 'Service image'}
            className="w-full h-full object-cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: imageLoading && !hasAttemptedLoad ? 'none' : 'block' }}
          />
        </>
      ) : (
        // Simple placeholder when no image
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">No Image</span>
          </div>
        </div>
      )}
      
      <div className="absolute top-2 right-2">
        <StatusBadge status={service.status} active={service.active} />
      </div>
      
      <Badge className="absolute top-2 left-2 bg-gray-900/60 text-white">
        {getServiceTypeLabel(service.type)}
      </Badge>
    </div>
  );
};

export default ServiceImage;
