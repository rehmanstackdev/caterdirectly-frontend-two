

import { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { formatUnifiedServicePrice } from "@/utils/unified-price-utils";
import { ServiceItem } from "@/types/service-types";

interface CardFooterProps {
  price?: string;
  priceType?: string;
  available?: boolean;
  handleViewDetails: () => void;
  service?: ServiceItem;
}

const CardFooter = ({
  price,
  priceType,
  available = true,
  handleViewDetails,
  service
}: CardFooterProps) => {
  // SIMPLIFIED: Always use unified price formatter when we have a service object
  // Only fall back to the price prop when no service object exists
  const formattedPrice = useMemo(() => {
    if (service) {
      return formatUnifiedServicePrice(service);
    }
    return price || "";
  }, [service, price]);
  
  return (
    <div className="flex justify-between items-center px-3 py-3 border-t">
      <div>
        {formattedPrice && (
          <span className="font-semibold text-[#F07712]">{formattedPrice}</span>
        )}
        {!available && (
          <span className="text-sm text-gray-500 ml-2">Currently unavailable</span>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleViewDetails} 
        className="border-[#F07712] text-[#F07712] hover:bg-[#F07712]/10"
      >
        View Details
      </Button>
    </div>
  );
};

export default CardFooter;
