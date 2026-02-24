import React from "react";
import { formatCurrency } from "@/lib/utils";

interface VendorCardPricingProps {
  serviceTotal: number;
  vendorPrice?: string;
  serviceSelectedItemsCount: number;
  shouldShowPricing: boolean;
}

const VendorCardPricing = ({
  serviceTotal,
  vendorPrice,
  serviceSelectedItemsCount,
  shouldShowPricing,
}: VendorCardPricingProps) => {
  return (
    <div className="text-left sm:text-right w-full sm:w-auto sm:min-w-[140px] overflow-x-hidden">
      {shouldShowPricing && (
        <p className="text-[#F07712] font-bold text-lg sm:text-xl lg:text-2xl leading-tight break-words overflow-hidden">
          <span className="block truncate max-w-full">
            {serviceTotal > 0 ? formatCurrency(serviceTotal) : vendorPrice}
          </span>
        </p>
      )}
      {serviceSelectedItemsCount > 0 && (
        <p className="text-xs sm:text-sm text-green-600 font-medium mt-1 break-words overflow-hidden">
          <span className="block truncate max-w-full">
            {serviceSelectedItemsCount} item
            {serviceSelectedItemsCount !== 1 ? "s" : ""} selected
          </span>
        </p>
      )}
    </div>
  );
};

export default VendorCardPricing;
