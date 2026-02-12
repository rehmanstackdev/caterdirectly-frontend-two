
import React from "react";
import { Button } from "@/components/ui/button";
import { Star, BadgeCheck } from "lucide-react";
import ServiceImage from "@/components/shared/ServiceImage";

interface VenueCardProps {
  image: string;
  name: string;
  rating: string;
  price: string;
  capacity?: string;
  location?: string;
  isManaged?: boolean;
  onClick?: () => void;
}

const VenueCard = ({
  image,
  name,
  rating,
  price,
  capacity,
  location,
  isManaged = false,
  onClick,
}: VenueCardProps) => {
  const handleViewMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      console.log(`Viewing more details for ${name}`);
      // Here you would typically handle navigation to venue details page
    }
  };

  return (
    <div 
      className="bg-white w-full pb-6 rounded-[32px_0px_32px_0px] shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <div className="aspect-[1.63] w-full">
          <ServiceImage 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover rounded-[32px_0px_0px_0px]"
            aspectRatio="aspect-[1.63]" 
          />
        </div>
        
        <div className="absolute bottom-3 left-3 flex gap-2 items-center">
          {capacity && (
            <div className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
              Up to {capacity} people
            </div>
          )}
        </div>
        
        {isManaged && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#F07712] text-white text-xs px-2 py-1 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" />
            <span>Managed</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-start px-6 pt-4">
        <div className="flex flex-col">
          <div className="text-[rgba(240,119,18,1)] text-xl font-medium leading-tight">
            {name}
          </div>
          {location && (
            <div className="text-gray-600 text-sm mt-1">{location}</div>
          )}
          <Button
            onClick={handleViewMore}
            className="bg-[rgba(240,119,18,1)] text-white text-sm font-semibold mt-3 px-6 py-2.5 rounded-full hover:bg-[rgba(240,119,18,0.9)] transition-colors"
          >
            View More
          </Button>
        </div>
        <div className="flex flex-col items-end text-[rgba(54,54,54,1)]">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[rgba(240,119,18,1)] text-[rgba(240,119,18,1)]" />
            <span className="text-base font-medium">{rating}</span>
          </div>
          <div className="text-xl font-bold mt-3">{price}</div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
