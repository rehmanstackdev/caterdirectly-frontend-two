
import React from "react";
import { ServiceSelection } from "@/types/order";
import { calculateServiceTotal as unifiedCalculateServiceTotal } from "@/utils/unified-calculations";
import { getServiceName, getSelectedItemsCountForService } from "@/utils/order-summary-utils";
import { formatCurrency } from "@/lib/utils";
import SelectedItemsBreakdown from "./SelectedItemsBreakdown";

interface ServiceSummaryItemProps {
  service: ServiceSelection;
  selectedItems: Record<string, number>;
  serviceIndex: number;
  deliveryFee?: { range: string; fee: number };
}

const ServiceSummaryItem = React.memo(({
  service,
  selectedItems,
  serviceIndex,
  deliveryFee
}: ServiceSummaryItemProps) => {
  const serviceTotal = unifiedCalculateServiceTotal(service, selectedItems);
  const selectedItemsForService = getSelectedItemsCountForService(service, selectedItems);

  const getBookableItems = (service: ServiceSelection) => {
    if (!service.service_details) return [];
    
    const details = service.service_details;
    const serviceType = service.serviceType || service.type || '';
    
    // Handle catering services
    if (serviceType === 'catering') {
      let items = [];
      
      if (details.menuItems && Array.isArray(details.menuItems)) {
        items = details.menuItems;
      } else if (details.catering && details.catering.menuItems && Array.isArray(details.catering.menuItems)) {
        items = [...details.catering.menuItems];
        
        // Add combo items if they exist
        if (details.catering.combos && Array.isArray(details.catering.combos)) {
          items = [...items, ...details.catering.combos];
        }
      } else if (details.menu && Array.isArray(details.menu)) {
        items = details.menu;
      }
      
      return items;
    }
    
    // Handle party rental services
    if (serviceType === 'party-rental' || serviceType === 'party-rentals') {
      if (details.rentalItems && Array.isArray(details.rentalItems)) {
        return details.rentalItems;
      }
      
      if (details.items && Array.isArray(details.items)) {
        return details.items;
      }
      
      if (details.rental && details.rental.items && Array.isArray(details.rental.items)) {
        return details.rental.items;
      }
    }
    
    // Handle staff services
    if (serviceType === 'staff') {
      if (details.staffServices && Array.isArray(details.staffServices)) {
        return details.staffServices;
      }
      
      if (details.services && Array.isArray(details.services)) {
        return details.services;
      }
    }
    
    // Handle venue services
    if (serviceType === 'venue' || serviceType === 'venues') {
      if (details.venueOptions && Array.isArray(details.venueOptions)) {
        return details.venueOptions;
      }
      
      if (details.options && Array.isArray(details.options)) {
        return details.options;
      }
    }
    
    return [];
  };

  const bookableItems = getBookableItems(service);
  const serviceType = service.serviceType || service.type || '';

  return (
    <div className="border-b border-gray-100 pb-3 last:border-0 w-full overflow-x-hidden">
      {/* Service Header */}
      <div className="flex justify-between items-start mb-2 gap-3 w-full overflow-x-hidden">
        <div className="flex-1 min-w-0 max-w-[calc(100%-150px)] overflow-x-hidden">
          <h4 className="font-medium break-words overflow-hidden">
            <span className="block truncate max-w-full">{getServiceName(service)}</span>
          </h4>
          <p className="text-sm text-gray-600 break-words overflow-hidden">
            <span className="block truncate max-w-full">
              {service.vendorName || service.vendor || "Vendor"}
            </span>
          </p>
          {service.quantity > 1 && (
            <p className="text-xs text-gray-500 break-words overflow-hidden">
              <span className="whitespace-nowrap">
                {serviceType === 'venue' || serviceType === 'venues' ? 'Hours:' : 'Quantity:'} {service.quantity}
              </span>
            </p>
          )}
          {(() => {
            const sid = (service as any).id || (service as any).serviceId;
            const selectedDuration = sid ? Number((selectedItems as any)[`${sid}_duration`] || 0) : 0;
            const displayDuration = selectedDuration > 0 ? selectedDuration : (service.duration || 0);
            
            return displayDuration > 1 && (service.serviceType === 'staff' || service.serviceType === 'venue') && (
              <p className="text-xs text-gray-500 break-words overflow-hidden">
                <span className="whitespace-nowrap">Duration: {displayDuration} hours</span>
              </p>
            );
          })()}
        </div>
        <span className="text-[#F07712] font-medium flex-shrink-0 whitespace-nowrap min-w-[110px] sm:min-w-[130px] text-right pr-2">
          {formatCurrency(serviceTotal)}
        </span>
      </div>

      {bookableItems.length > 0 && selectedItemsForService > 0 && (
        <SelectedItemsBreakdown 
          bookableItems={bookableItems}
          selectedItems={selectedItems}
          serviceType={serviceType}
          serviceId={(service as any).id || (service as any).serviceId}
        />
      )}

      {/* Delivery Fee Display */}
      {(() => {
        // Convert fee to number if it's a string, handle all edge cases
        const feeValue = deliveryFee?.fee != null
          ? (typeof deliveryFee.fee === 'string' ? parseFloat(deliveryFee.fee) : Number(deliveryFee.fee))
          : null;
        const hasDeliveryFee = deliveryFee && feeValue != null && !isNaN(feeValue) && feeValue > 0;

        return hasDeliveryFee ? (
          <div className="ml-4 mt-2 pt-2 border-t border-gray-100 w-full overflow-x-hidden">
            <div className="flex justify-between items-center text-sm gap-3 w-full overflow-x-hidden">
              <div className="flex-1 min-w-0 max-w-[calc(100%-130px)]">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-medium">
                  Delivery Fee
                  </span>
                  {deliveryFee.range && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {deliveryFee.range}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[#F07712] font-semibold flex-shrink-0 whitespace-nowrap min-w-[110px] sm:min-w-[130px] text-right pr-2">
                +{formatCurrency(feeValue)}
              </span>
            </div>
          </div>
        ) : null;
      })()}

      {/* Staff fallback: show headcount x hours when there are no role items */}
      {serviceType === 'staff' && bookableItems.length === 0 && (
        (() => {
          const sid = (service as any).id || (service as any).serviceId;
          const selectedHeadcount = sid ? Number((selectedItems as any)[sid] || 0) : 0;
          const headcount = selectedHeadcount > 0 ? selectedHeadcount : (Number((service as any).quantity) || 0);
          if (headcount <= 0) return null;

          // Prefer selected duration for this staff service id if present
          const selectedDuration = sid ? Number((selectedItems as any)[`${sid}_duration`] || 0) : 0;
          const duration = selectedDuration > 0 ? selectedDuration : (Number((service as any).duration) || 0);

          return (
            <div className="ml-4 space-y-1 w-full overflow-x-hidden">
              <div className="flex justify-between text-sm gap-3 w-full overflow-x-hidden">
                <span className="text-gray-600 flex-1 min-w-0 max-w-[calc(100%-130px)] break-words overflow-hidden">
                  <span className="block truncate max-w-full">
                    {getServiceName(service)} × {headcount}{duration > 0 ? ` @ ${duration} hrs each` : ''}
                  </span>
                </span>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
});

ServiceSummaryItem.displayName = 'ServiceSummaryItem';

export default ServiceSummaryItem;
