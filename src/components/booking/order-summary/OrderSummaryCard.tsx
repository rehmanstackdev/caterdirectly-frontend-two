
import React from "react";
import { ServiceSelection } from "@/types/order";
import { calculateUnifiedOrderTotals } from "@/utils/unified-calculations";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ServiceSummaryItem from "./ServiceSummaryItem";

interface OrderSummaryCardProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  serviceDeliveryFees?: Record<string, { range: string; fee: number }>;
}

const OrderSummaryCard = ({
  selectedServices,
  selectedItems,
  serviceDeliveryFees = {}
}: OrderSummaryCardProps) => {
  const { subtotal } = calculateUnifiedOrderTotals(selectedServices, selectedItems);
  
  // Calculate total delivery fees
  const totalDeliveryFees = Object.values(serviceDeliveryFees).reduce((sum, feeInfo) => {
    return sum + (feeInfo.fee || 0);
  }, 0);

  return (
    <Card className="bg-white shadow-sm border border-gray-100 mb-4 sm:mb-6 w-full overflow-x-hidden">
      <CardHeader className="pb-3 overflow-x-hidden">
        <CardTitle className="text-lg break-words overflow-hidden">
          <span className="truncate max-w-full">Order Summary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 overflow-x-hidden">
        {selectedServices.map((service, index) => {
          const serviceId = service?.id || service?.serviceId || `service-${index}`;
          const deliveryFee = serviceDeliveryFees[serviceId];
          return (
            <ServiceSummaryItem
              key={index}
              service={service}
              selectedItems={selectedItems}
              serviceIndex={index}
              deliveryFee={deliveryFee}
            />
          );
        })}

        {/* Order Subtotal */}
        <div className="border-t pt-3 mt-4 w-full overflow-x-hidden">
          <div className="flex justify-between items-center font-semibold text-lg gap-3 w-full overflow-x-hidden">
            <span className="flex-shrink-0">Subtotal</span>
            <span className="text-[#F07712] whitespace-nowrap min-w-[140px] sm:min-w-[150px] text-right pr-2">
              {formatCurrency(subtotal + totalDeliveryFees)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummaryCard;
