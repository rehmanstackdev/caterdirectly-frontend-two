

import { Heart } from "lucide-react";
import { ServiceItem } from "@/types/service-types";
import ServiceImage from "@/components/shared/ServiceImage";
import { getServiceImageUrl } from "@/hooks/events/utils/image";
import ManagedBadge from "@/components/shared/ManagedBadge";

interface CardHeaderProps {
  image: string;
  name: string;
  id?: string;
  isFavorite: boolean;
  isManaged?: boolean;
  available?: boolean;
  handleToggleFavorite: (e: React.MouseEvent) => void;
  onImageError?: () => void;
  service?: ServiceItem;
  priority?: boolean;
}

const CardHeader = ({
  image,
  name,
  id,
  isFavorite,
  isManaged,
  available = true,
  handleToggleFavorite,
  onImageError,
  service,
  priority = false
}: CardHeaderProps) => {
  // Use getServiceImageUrl to ensure we always get a valid image URL
  const validImageUrl = getServiceImageUrl(
    service || image,
    'https://via.placeholder.com/400x300?text=No+Image'
  );
  
  return (
    <div className="relative h-60 sm:h-52">
      <ServiceImage 
        src={validImageUrl} 
        alt={name} 
        className="w-full h-full object-cover transition-opacity duration-300"
        aspectRatio="aspect-[4/3]"
        onLoad={() => {}}
        onError={onImageError}
        priority={priority}
        service={service}
        showLoadingPlaceholder={true}
      />
      
      <div className="absolute top-3 right-3 flex flex-row gap-2 items-center">
        {/* Managed badge now appears first */}
        {isManaged && (
          <ManagedBadge />
        )}
        
        {/* Favorites button now appears second */}
        <button 
          onClick={handleToggleFavorite}
          className={`p-2 rounded-full ${isFavorite ? 'bg-red-50' : 'bg-white/80'} shadow-sm`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} 
          />
        </button>
        
        {!available && (
          <div className="bg-gray-800/80 text-white text-xs px-2 py-1 rounded-full">
            Unavailable
          </div>
        )}
      </div>
    </div>
  );
};

export default CardHeader;
