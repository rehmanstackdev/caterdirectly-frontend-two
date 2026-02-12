
import React from "react";
import ServiceImage from "@/components/shared/ServiceImage";
import ManagedBadge from "@/components/shared/ManagedBadge";

interface VendorCardHeaderProps {
  vendorImage?: string;
  vendorName?: string;
  vendorType?: string;
  isManaged?: boolean;
}

const VendorCardHeader = ({
  vendorImage,
  vendorName,
  vendorType,
  isManaged = false
}: VendorCardHeaderProps) => {
  return (
    <div className="flex items-start gap-3 sm:gap-4 w-full overflow-x-hidden">
      {/* Image container - responsive sizing */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gray-200 rounded-xl shadow-sm overflow-hidden flex-shrink-0">
        {vendorImage && (
          <ServiceImage 
            src={vendorImage} 
            alt={vendorName || "Service"} 
            className="w-full h-full object-cover" 
            showLoadingPlaceholder={false}
            aspectRatio="aspect-square"
          />
        )}
      </div>
      
      {/* Text content - flexible width with overflow protection */}
      <div className="flex-1 pt-1 w-full overflow-x-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 mb-2 w-full overflow-x-hidden">
          <h3 className="font-bold text-sm sm:text-base md:text-lg leading-tight break-words flex-1 overflow-x-hidden">
            <span className="block truncate max-w-full">
              {vendorName || "Selected Service"}
            </span>
          </h3>
          {isManaged && (
            <div className="self-start">
              <ManagedBadge size="sm" />
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed break-words overflow-x-hidden">
          <span className="block truncate max-w-full">
            {vendorType || "Service Type"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default VendorCardHeader;
