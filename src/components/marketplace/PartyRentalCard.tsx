

import { Star, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import ServiceImage from "@/components/shared/ServiceImage";

interface PartyRentalCardProps {
  image: string;
  name: string;
  rating: string;
  price: string;
  location: string;
  isManaged?: boolean;
  onClick?: () => void;
}

const PartyRentalCard = ({
  image,
  name,
  rating,
  price,
  location,
  isManaged = false,
  onClick,
}: PartyRentalCardProps) => {
  return (
    <div 
      className="bg-white w-full pb-4 md:pb-6 rounded-[20px_0px_20px_0px] md:rounded-[32px_0px_32px_0px] shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <ServiceImage 
          src={image} 
          alt={name} 
          className="w-full object-cover rounded-[20px_0px_0px_0px] md:rounded-[32px_0px_0px_0px]"
          aspectRatio="aspect-[1.63]"
        />
        
        {isManaged && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#F07712] text-white text-xs px-2 py-1 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Managed</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-start px-3 md:px-6 pt-3 md:pt-4">
        <div className="flex flex-col">
          <div className="text-[rgba(240,119,18,1)] text-sm md:text-xl font-medium leading-tight break-words">
            {name}
          </div>
          <div className="text-gray-600 text-xs md:text-sm mt-1">
            {location}
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
            className="bg-[rgba(240,119,18,1)] text-white text-xs md:text-sm font-semibold mt-2 md:mt-3 px-3 md:px-6 py-1 md:py-2.5 rounded-full hover:bg-[rgba(240,119,18,0.9)] transition-colors"
            size="sm"
          >
            View Details
          </Button>
        </div>
        <div className="flex flex-col items-end text-[rgba(54,54,54,1)]">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 md:w-4 md:h-4 fill-[rgba(240,119,18,1)] text-[rgba(240,119,18,1)]" />
            <span className="text-xs md:text-base font-medium">{rating}</span>
          </div>
          <div className="text-sm md:text-xl font-bold mt-1 md:mt-3">{price}</div>
        </div>
      </div>
    </div>
  );
};

export default PartyRentalCard;
