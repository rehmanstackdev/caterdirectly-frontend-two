
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import UnifiedImage from '@/components/shared/UnifiedImage';

interface EventImageProps {
  image: string | null;
  title: string;
  event?: any; // Optional event object for fallback images
}

const EventImage = ({ image, title, event }: EventImageProps) => {
  const isMobile = useIsMobile();
  
  
  // Log image for debugging purposes
  useEffect(() => {
    console.log('EventImage component: rendering with image', { image });
  }, [image]);
  

  // Generate a reasonable fallback if no image is provided
  
  return (
    <div className={`rounded-lg overflow-hidden ${isMobile ? 'h-48' : 'h-60'}`}>
      <UnifiedImage 
        service={event as any}
        alt={title}
        className="w-full h-full"
        aspectRatio=""
        showLoadingState={true}
        enableRetry={true}
      />
    </div>
  );
};

export default EventImage;