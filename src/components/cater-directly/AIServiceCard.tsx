
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, BadgeCheck } from "lucide-react";

interface ServiceProps {
  service: {
    id: string;
    name: string;
    image: string;
    vendorName: string;
    price: string;
    description: string;
    rating?: string;
    isManaged?: boolean;
    priceType?: string;
  };
  serviceType: string;
}

// Price type mapping to ensure consistent suffix display
const PRICE_TYPE_MAPPING: Record<string, string> = {
  'per_person': '/Person',
  'per_hour': '/Hour',
  'per_day': '/Day',
  'per_item': '/Item',
  'flat_rate': '',
  'hourly': '/Hour',
  'daily': '/Day',
  'per_guest': '/Person'
};

const AIServiceCard = ({ service, serviceType }: ServiceProps) => {
  // Format price with consistent suffix handling
  const formattedPrice = React.useMemo(() => {
    if (!service.price) return 'Price on request';
    
    // Clean any existing suffixes from the price
    let cleanPrice = service.price
      .replace(/\s*(\/|per)\s*(person|hour|day|item|guest)s?/gi, '')
      .replace(/\s*\/(person|hour|day|item|guest)s?$/gi, '')
      .replace(/\s+per\s+(person|hour|day|item|guest)s?$/gi, '')
      .trim();
    
    // Get the correct suffix based on price type
    const suffix = PRICE_TYPE_MAPPING[service.priceType?.toLowerCase() || ''] || '';
    
    // ALWAYS add the suffix if we have a valid price_type (unless it's flat_rate)
    if (service.priceType && service.priceType.toLowerCase() !== 'flat_rate' && suffix) {
      return `${cleanPrice}${suffix}`;
    }
    
    // For flat_rate or missing price_type, return clean price without suffix
    return cleanPrice;
  }, [service.price, service.priceType]);

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48">
        <img 
          src={service.image} 
          alt={service.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="text-white font-medium">{service.name}</div>
          <div className="text-gray-200 text-sm">{service.vendorName}</div>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          {service.rating && (
            <div className="bg-white/90 px-2 py-1 rounded-full flex items-center">
              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="text-xs font-medium">{service.rating}</span>
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
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[#F07712] font-semibold">{formattedPrice}</div>
          <div className="text-xs text-gray-500 capitalize">{serviceType}</div>
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {service.description}
        </p>
        
        <Button
          variant="outline"
          className="w-full text-sm border-[#F07712] text-[#F07712] hover:bg-[#F07712]/5"
          onClick={() => window.location.href = `/marketplace?category=${serviceType}&id=${service.id}`}
        >
          View Details
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};

export default AIServiceCard;
