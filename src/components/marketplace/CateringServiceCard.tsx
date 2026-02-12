

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceItem } from '@/types/service-types';
import { Star, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCateringPriceRange } from '@/hooks/events/utils/menu-utils';

interface CateringServiceCardProps {
  service: ServiceItem;
  onViewDetails: (service: ServiceItem) => void;
}

const CateringServiceCard = ({ service, onViewDetails }: CateringServiceCardProps) => {
  // Extract menu items if they exist
  const menuItems = service.service_details?.menuItems || [];
  const hasMenu = menuItems.length > 0;
  
  // Get up to 3 featured or first menu items
  const featuredItems = hasMenu 
    ? menuItems
        .filter(item => item.isPopular)
        .slice(0, 3)
    : [];
  
  // If we don't have 3 featured items, add regular items to make up the difference
  const displayItems = featuredItems.length === 0 && hasMenu 
    ? menuItems.slice(0, 3) 
    : featuredItems;

  // Use menu image if available, otherwise use service image or fallback
  const displayImage = service.service_details?.menuImage || service.image || 'https://via.placeholder.com/300x200?text=No+Image';

  // Get price range for catering service
  const priceDisplay = getCateringPriceRange(service);

  return (
    <Card className="h-full flex flex-col">
      <div className="relative h-56 sm:h-48">
        <img 
          src={displayImage} 
          alt={service.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-2 items-end">
          {service.rating && (
            <div className="flex items-center bg-white/80 px-2 py-1 rounded-full text-sm">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-current mr-1" />
              <span>{service.rating}</span>
              {service.reviews && <span className="text-xs ml-1">({service.reviews})</span>}
            </div>
          )}
          
          {service.isManaged && (
            <div className="flex items-center gap-1 bg-[#F07712] text-white text-xs px-2 py-1 rounded-full">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Managed</span>
            </div>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{service.name}</CardTitle>
        {service.vendorName && (
          <p className="text-gray-500 text-sm">{service.vendorName}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {service.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{service.description}</p>
        )}
        
        {displayItems.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium">Menu Highlights:</h4>
            {displayItems.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="font-medium">${typeof item.price === 'number' ? item.price.toFixed(2) : '0.00'}</span>
              </div>
            ))}
            {menuItems.length > displayItems.length && (
              <p className="text-xs text-gray-500 italic">
                +{menuItems.length - displayItems.length} more items
              </p>
            )}
          </div>
        )}
        
        <div className="mt-auto flex justify-between items-center">
          <div className="font-bold text-[#F07712]">{priceDisplay}</div>
          <Button 
            onClick={() => onViewDetails(service)}
            className="bg-[#F07712] hover:bg-[#F07712]/90"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CateringServiceCard;
