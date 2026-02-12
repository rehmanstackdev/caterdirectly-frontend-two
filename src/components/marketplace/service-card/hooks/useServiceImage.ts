
import { useState, useEffect } from 'react';
import { ServiceItem } from '@/types/service-types';
import { 
  getServiceImageUrl, 
  getServiceMenuImageUrl, 
  logImageDebug, 
  resetImageCache,
  isValidImageUrl
} from '@/hooks/events/utils/image';
import { getMenuImageUrl } from '@/hooks/events/utils/menu-utils';

export const useServiceImage = (service: ServiceItem, vendorType?: string) => {
  const [imageToDisplay, setImageToDisplay] = useState<string>('');
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);
  
  // Effect to determine the best image to display using unified resolution system
  useEffect(() => {
    const determineImage = async () => {
      // Use the unified getServiceImageUrl which handles the priority system
      // For catering: menuImage → coverImage → images[0] → service.image → fallback
      // For others: coverImage → images[0] → service.image → fallback
      const selectedImage = getServiceImageUrl(service);
      
      // Log for debugging
      logImageDebug(service.name || 'Unknown Service', service.image, selectedImage);
      
      // Set the resolved image
      setImageToDisplay(selectedImage);
      setImageLoadFailed(false);
    };
    
    determineImage().catch(error => {
      console.error(`[ServiceCard] Error in determineImage:`, error);
      // Set a fallback image on error
      setImageToDisplay(getServiceImageUrl(''));
    });
  }, [service, vendorType]);
  
  // Handle image load failure
  const handleImageError = () => {
    console.log(`[ServiceCard] Image load failed for ${service.name}`);
    setImageLoadFailed(true);
    
    // If we haven't already tried the service image as a fallback, do so now
    if (imageToDisplay !== service.image && typeof service.image === 'string') {
      setImageToDisplay(getServiceImageUrl(service.image));
    } else {
      // If all attempts failed, set to placeholder
      setImageToDisplay(getServiceImageUrl(''));
    }
  };

  return {
    imageToDisplay,
    imageLoadFailed,
    handleImageError
  };
};
