import ResponsiveAdditionalServices from "./ResponsiveAdditionalServices";
import { ServiceSelection } from "@/types/order";

interface AdditionalServicesProps {
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

function AdditionalServices({
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
}: AdditionalServicesProps) {
  return (
    <ResponsiveAdditionalServices
      onAddService={onAddService}
      selectedServices={selectedServices}
      showOrderSummary={showOrderSummary}
      showAddServiceButton={showAddServiceButton}
      selectedItems={selectedItems}
      customAdjustments={customAdjustments}
      isTaxExempt={isTaxExempt}
      isServiceFeeWaived={isServiceFeeWaived}
      serviceDeliveryFees={serviceDeliveryFees}
      serviceDistances={serviceDistances}
      guestCount={guestCount}
    />
  );
}

export default AdditionalServices;
