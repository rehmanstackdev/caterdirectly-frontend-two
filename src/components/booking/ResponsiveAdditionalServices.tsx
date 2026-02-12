
import { ServiceSelection } from "@/types/order";
import AddServiceButton from "./order-summary/AddServiceButton";
import EnhancedOrderSummaryCard from "./order-summary/EnhancedOrderSummaryCard";

interface ResponsiveAdditionalServicesProps {
  onAddService: () => void;
  selectedServices: ServiceSelection[];
  showOrderSummary?: boolean;
  selectedItems?: Record<string, number>;
  customAdjustments?: import("@/types/adjustments").CustomAdjustment[];
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  serviceDeliveryFees?: Record<string, { range: string; fee: number }>;
  serviceDistances?: Record<string, number>; // Distance in miles for each service
  guestCount?: number;
}

function ResponsiveAdditionalServices({
  onAddService,
  selectedServices,
  showOrderSummary = true,
  selectedItems = {},
  customAdjustments = [],
  isTaxExempt = false,
  isServiceFeeWaived = false,
  serviceDeliveryFees = {},
  serviceDistances = {},
  guestCount = 1
}: ResponsiveAdditionalServicesProps) {
  // Dev-only debug logging
  if (import.meta.env.DEV) {
    console.count('[ResponsiveAdditionalServices] Component render');
    console.log('[ResponsiveAdditionalServices] State:', {
      selectedServicesCount: selectedServices.length,
      selectedItemsCount: Object.keys(selectedItems).length,
      customAdjustmentsCount: customAdjustments.length
    });
  }
  
  // Show component when any services are selected
  const shouldShowComponent = selectedServices.length > 0;


  return (
    <div className="w-full overflow-x-hidden">
      {/* Add Service Button */}
      <AddServiceButton 
        onAddService={onAddService}
        hasServices={shouldShowComponent}
      />
      {/* Enhanced Order Summary Card (positioned under Add Service Button) */}
      {shouldShowComponent && showOrderSummary && (
        <EnhancedOrderSummaryCard
          selectedServices={selectedServices}
          selectedItems={selectedItems}
          customAdjustments={customAdjustments}
          showDetailedBreakdown={false}
          className="mt-4"
          isTaxExempt={isTaxExempt}
          isServiceFeeWaived={isServiceFeeWaived}
          serviceDeliveryFees={serviceDeliveryFees}
          serviceDistances={serviceDistances}
          guestCount={guestCount}
        />
      )}
    </div>
  );
};

export default ResponsiveAdditionalServices;
