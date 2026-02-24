import { ServiceSelection } from "@/types/order";
import { ShoppingCart, ShoppingBag } from "lucide-react";
import AddServiceButton from "./order-summary/AddServiceButton";
import EnhancedOrderSummaryCard from "./order-summary/EnhancedOrderSummaryCard";
import { getSelectedItemsCountForService } from "@/utils/order-summary-utils";

interface ResponsiveAdditionalServicesProps {
  onAddService: () => void;
  selectedServices: ServiceSelection[];
  showOrderSummary?: boolean;
  showAddServiceButton?: boolean;
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
  showAddServiceButton = true,
  selectedItems = {},
  customAdjustments = [],
  isTaxExempt = false,
  isServiceFeeWaived = false,
  serviceDeliveryFees = {},
  serviceDistances = {},
  guestCount = 1,
}: ResponsiveAdditionalServicesProps) {
  const hasSelectedServices = selectedServices.length > 0;
  const hasSelectedItems = selectedServices.some(
    (service) => getSelectedItemsCountForService(service, selectedItems) > 0,
  );
  const servicesMissing = !hasSelectedServices;
  const itemsMissing = hasSelectedServices && !hasSelectedItems;

  return (
    <div className="w-full overflow-x-hidden">
      {showAddServiceButton && (
        <AddServiceButton
          onAddService={onAddService}
          hasServices={hasSelectedServices}
        />
      )}

      {/* Empty Cart State */}
      {(servicesMissing || itemsMissing) && showOrderSummary && (
        <div
          className={`${showAddServiceButton ? "mt-4" : ""} border border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 text-center`}
        >
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-white border border-orange-200 flex items-center justify-center">
            {servicesMissing ? (
              <ShoppingCart className="w-6 h-6 text-orange-500" />
            ) : (
              <ShoppingBag className="w-6 h-6 text-orange-500" />
            )}
          </div>

          <h4 className="text-base font-semibold text-gray-800">
            {servicesMissing
              ? "No services selected"
              : "Cart is Empty, No items yet"}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {servicesMissing
              ? "Add services first to build your cart summary."
              : "Choose items from your selected services to see totals here."}
          </p>

          <div className="mt-3 inline-flex items-center gap-1 text-xs text-orange-600 font-medium bg-orange-100 px-2.5 py-1 rounded-full">
            {servicesMissing
              ? "Start by adding a service"
              : "Select items from the left Side Menus And Combos"}
          </div>
        </div>
      )}

      {/* Enhanced Order Summary Card */}
      {hasSelectedServices && hasSelectedItems && showOrderSummary && (
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
}

export default ResponsiveAdditionalServices;
