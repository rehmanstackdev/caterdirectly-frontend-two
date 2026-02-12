
import { useEffect } from "react";
import { Star, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ServiceImage from "@/components/shared/ServiceImage";
import { ServiceItem } from "@/types/service-types";
import { getCityStateDisplay } from "@/utils/address-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CatererCardProps {
  id?: string;
  image: string;
  name: string;
  rating: string;
  price: string;
  buttonText?: string;
  location?: string;
  description?: string;
  isManaged?: boolean;
  service?: ServiceItem;
  activeTab?: string;
}

const CatererCard = ({
  id,
  image,
  name,
  rating,
  price,
  buttonText = "View More",
  location,
  description,
  isManaged = false,
  service,
  activeTab = 'catering'
}: CatererCardProps) => {
const navigate = useNavigate();

// Use service location first (already formatted from vendor data), then fall back to location prop
const displayLocation = service?.location || (location ? getCityStateDisplay(location) : null);

// Debug location data to understand what's available
useEffect(() => {
  console.debug('[CatererCard] location data', { 
    id, 
    location, 
    serviceLocation: service?.location,
    displayLocation,
    service: service ? { 
      id: service.id, 
      location: service.location, 
      vendorName: service.vendorName 
    } : null
  });
}, [id, location, service, displayLocation]);

const handleClick = () => {
    navigate('/marketplace', { 
      state: { 
        activeTab: activeTab,
        selectedService: id 
      }
    });
  };

  return (
    <TooltipProvider>
      <div 
        className="bg-white rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer"
        onClick={handleClick}
      >
        <div className="relative">
          <ServiceImage 
            src={image} 
            service={service}
            alt={name} 
            aspectRatio="aspect-video"
          />
          
          {isManaged && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className="absolute top-3 right-3 flex items-center gap-1 bg-[#F07712] text-white text-xs px-2 py-1 rounded-full cursor-help"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Managed</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  This service is fully managed by our team. We handle all coordination, 
                  quality assurance, and customer support to ensure a seamless experience.
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{name}</h3>
              {displayLocation && (
                <p className="text-sm text-gray-600 mt-1">{displayLocation}</p>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const ratingValue = parseFloat(rating) || 0;
                    const filled = i < Math.floor(ratingValue);
                    const halfFilled = !filled && i === Math.floor(ratingValue) && ratingValue % 1 >= 0.5;
                    
                    return (
                      <Star 
                        key={i} 
                        className={`h-3.5 w-3.5 flex-shrink-0 ${
                          filled 
                            ? 'text-[#F07712] fill-[#F07712]' 
                            : halfFilled
                            ? 'text-[#F07712] fill-[#F07712] opacity-60'
                            : 'text-gray-300'
                        }`} 
                      />
                    );
                  })}
                </div>
                <span className="text-xs text-gray-500 ml-1">{(parseFloat(rating) || 0).toFixed(1)}</span>
                {/* {service?.reviews !== undefined && (
                  <span className="text-xs text-gray-500">
                    ({service.reviews} {parseInt(service.reviews.toString()) === 0 || parseInt(service.reviews.toString()) === 1 ? 'review' : 'reviews'})
                  </span>
                )} */}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3 line-clamp-2 min-h-[40px]">
            {description || ""}
          </p>
          <div className="flex justify-between items-center mt-3">
            <button className="px-6 py-2 bg-[#F07712] text-white text-sm font-medium rounded-full hover:bg-[#F07712]/90 transition-colors">
              {buttonText}
            </button>
            <div className="text-lg font-semibold text-gray-900">
              {price}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CatererCard;
