import React, { useMemo } from "react";
import { ServiceSelection } from "@/types/order";
import { calculateUnifiedOrderTotals } from "@/utils/unified-calculations";
import { getSelectedItemsCountForService } from "@/utils/order-summary-utils";
import { calculateCateringPrice, extractCateringItems } from "@/utils/catering-price-calculation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ServiceSummaryItem from "./ServiceSummaryItem";
import { CustomAdjustment } from "@/types/adjustments";

interface EnhancedOrderSummaryCardProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  showDetailedBreakdown?: boolean;
  showCheckoutTaxNote?: boolean;
  showItemCountFooter?: boolean;
  className?: string;
  customAdjustments?: CustomAdjustment[];
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  serviceDeliveryFees?: Record<string, { range: string; fee: number }>;
  serviceDistances?: Record<string, number>; // Distance in miles for each service
  guestCount?: number;
}

const EnhancedOrderSummaryCard = React.memo(({
  selectedServices,
  selectedItems,
  showDetailedBreakdown = false,
  showCheckoutTaxNote = true,
  showItemCountFooter = true,
  className = "",
  customAdjustments = [],
  isTaxExempt = false,
  isServiceFeeWaived = false,
  serviceDeliveryFees = {},
  serviceDistances = {},
  guestCount = 1
}: EnhancedOrderSummaryCardProps) => {
  // Phase 1: Memoize expensive calculations to prevent recalculation on every render
  const calculations = useMemo(() => {
    return calculateUnifiedOrderTotals(
      selectedServices,
      selectedItems,
      undefined,
      undefined,
      undefined,
      customAdjustments,
      undefined,
      isTaxExempt,
      isServiceFeeWaived,
      guestCount
    );
  }, [selectedServices, selectedItems, customAdjustments, isTaxExempt, isServiceFeeWaived, guestCount]);
  
  // Calculate total delivery fees - only include fees for services with calculated distances
  const totalDeliveryFees = useMemo(() => {
    return Object.entries(serviceDeliveryFees).reduce((sum, [serviceId, feeInfo]) => {
      // Check distance with the same serviceId
      let distance = serviceDistances[serviceId];

      // If distance not found, try finding the service and checking with alternate IDs
      if (!distance) {
        const service = selectedServices.find(s =>
          (s.id || s.serviceId) === serviceId
        );
        if (service) {
          // Try alternate service ID formats
          distance = serviceDistances[service.id] || serviceDistances[service.serviceId];
        }
      }

      // Include delivery fee if there's either:
      // 1. A calculated distance for this service, OR
      // 2. A manually selected delivery fee (feeInfo exists)
      if (feeInfo.fee && (distance && distance > 0 || !distance)) {
        return sum + (feeInfo.fee || 0);
      }
      return sum;
    }, 0);
  }, [serviceDeliveryFees, serviceDistances, selectedServices]);
  
  // Calculate catering breakdowns for each catering service
  const cateringCalculations = useMemo(() => {
    const calculations: Record<string, ReturnType<typeof calculateCateringPrice> & {
      menuItems: Array<{ name: string; quantity: number; price: number; additionalCharge: number }>;
      simpleItems: Array<{ name: string; quantity: number; price: number }>;
      premiumItems: Array<{ name: string; quantity: number; price: number; additionalCharge: number }>;
    }> = {};

    selectedServices.forEach(service => {
      const serviceType = service.serviceType || service.type || '';
      if (serviceType === 'catering' && service.service_details) {
        const serviceId = service.id || service.serviceId;
        const { baseItems, additionalChargeItems, comboCategoryItems } = extractCateringItems(
          selectedItems,
          service.service_details
        );

        // Calculate base price per person (sum of all base items)
        const basePricePerPerson = baseItems.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);

        // Prepare additional charges for calculation
        const additionalCharges = additionalChargeItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          additionalCharge: item.additionalCharge,
          isMenuItem: item.isMenuItem
        }));

        const calcResult = calculateCateringPrice(basePricePerPerson, additionalCharges, guestCount, comboCategoryItems);

        // Separate menu items (individual items, not combo category items)
        const menuItems = additionalChargeItems.filter(item => item.isMenuItem).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          additionalCharge: item.additionalCharge
        }));

        // Separate simple items (no additional charge) from premium items
        const simpleItems = comboCategoryItems.filter(item => !item.additionalCharge || item.additionalCharge === 0);
        const premiumItems = comboCategoryItems.filter(item => item.additionalCharge && item.additionalCharge > 0).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          additionalCharge: item.additionalCharge!
        }));

        calculations[serviceId] = {
          ...calcResult,
          menuItems,
          simpleItems,
          premiumItems
        };
      }
    });

    return calculations;
  }, [selectedServices, selectedItems, guestCount]);

  const hasItems = selectedServices.length > 0 || Object.keys(selectedItems).length > 0 || (customAdjustments?.length || 0) > 0;
  const totalItemsSelected = useMemo(
    () => selectedServices.reduce((sum, s) => sum + getSelectedItemsCountForService(s, selectedItems), 0),
    [selectedServices, selectedItems]
  );
  if (!hasItems) {
    return (
      <Card className={`bg-muted/5 border-dashed ${className}`}>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No services selected yet</p>
          <p className="text-sm text-muted-foreground mt-1">Add services to see your order summary</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 shadow-lg ${className}`}>
      <CardHeader className="pb-4 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-200">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          <span className="font-bold">Order Summary</span>
          {selectedServices.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-auto bg-orange-500 text-white hover:bg-orange-600">
              {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Section 1: Services with Catering Calculation */}
        {selectedServices.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</span>
              Services
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-4 shadow-sm border border-orange-100">
              {selectedServices.map((service, index) => {
                const serviceId = service?.id || service?.serviceId || `service-${index}`;
                const serviceType = service.serviceType || service.type || '';
                const isCatering = serviceType === 'catering';
                const cateringCalc = isCatering ? cateringCalculations[serviceId] : null;

                // Get delivery fee - try primary serviceId first, then alternates
                let deliveryFee = serviceDeliveryFees[serviceId];
                if (!deliveryFee && service?.id) {
                  deliveryFee = serviceDeliveryFees[service.id];
                }
                if (!deliveryFee && service?.serviceId) {
                  deliveryFee = serviceDeliveryFees[service.serviceId];
                }

                // Get distance - try primary serviceId first, then alternates
                let distance = serviceDistances[serviceId];
                if (!distance && service?.id) {
                  distance = serviceDistances[service.id];
                }
                if (!distance && service?.serviceId) {
                  distance = serviceDistances[service.serviceId];
                }

                // Use delivery fee if there's either a calculated distance OR a manually selected fee
                const finalDeliveryFee = deliveryFee && (distance && distance > 0 || !distance) ? deliveryFee : undefined;

                return (
                  <div key={service.id || service.serviceId || `service-${index}`}>
                    {/* Catering Price Calculation Breakdown */}
                    {isCatering && cateringCalc && cateringCalc.finalTotal > 0 && (
                      <div className="space-y-3 mb-3">
                        {/* Service Name Header */}
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">{service.serviceName || service.name}</span>
                          <span className="text-xs text-gray-500">{service.vendorName || service.vendor}</span>
                        </div>

                        {/* 1. Menu Items (individual items) - Price × Quantity ONLY (NO guest count) */}
                        {cateringCalc.menuItems && cateringCalc.menuItems.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Menu Items</span>
                            {cateringCalc.menuItems.map((item, idx) => (
                              <div key={idx} className="space-y-1 py-1 border-b border-gray-100 last:border-0">
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-800 font-medium">{item.name}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                  <span>
                                    {formatCurrency(item.additionalCharge)} × {item.quantity}
                                  </span>
                                  <span className="text-orange-600 font-semibold">
                                    {formatCurrency(item.additionalCharge * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 2. Combo Base Price - No guest count breakdown shown */}
                        {/* Base price is calculated using protein quantity in BookingFlow, not guest count */}
                        {/* Only show when there's a base price */}
                        {cateringCalc.basePriceTotal > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Combo Base Price</span>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900">Base Total</span>
                              <span className="text-lg font-bold text-orange-600">{formatCurrency(cateringCalc.basePriceTotal)}</span>
                            </div>
                          </div>
                        )}

                        {/* 3. Selected Items - Includes both simple items and premium items */}
                        {/* For combos: sides multiply by guest count, proteins by protein quantity (already in item.quantity) */}
                        {((cateringCalc.simpleItems && cateringCalc.simpleItems.length > 0) ||
                          (cateringCalc.premiumItems && cateringCalc.premiumItems.length > 0)) && (
                          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Selected Items</span>

                            {/* Simple Items */}
                            {cateringCalc.simpleItems && cateringCalc.simpleItems.map((item, idx) => {
                              // Simple items from combos: item.quantity already includes the correct multiplier
                              // (protein quantity for proteins, guest count for sides - set in BookingFlow)
                              const itemTotal = item.price * item.quantity;

                              return (
                                <div key={`simple-${idx}`} className="space-y-1 py-1 border-b border-gray-100 last:border-0">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-800 font-medium">{item.name}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>
                                      {formatCurrency(item.price)} × {item.quantity}
                                    </span>
                                    <span className="text-orange-600 font-semibold">
                                      {formatCurrency(itemTotal)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Premium Items */}
                            {cateringCalc.premiumItems && cateringCalc.premiumItems.map((item, idx) => {
                              // Premium items: show as (green price + upcharge) × quantity
                              // Green text in combo = item.price + item.additionalCharge
                              const backendPrice = item.price || 0;
                              const upcharge = item.additionalCharge || 0;
                              // The base price shown in green in combo selector
                              const greenDisplayPrice = backendPrice;
                              const quantity = item.quantity || 1;
                              // Total = (greenPrice + upcharge) × quantity
                              const itemTotal = (greenDisplayPrice + upcharge) * quantity;

                              return (
                                <div key={`premium-${idx}`} className="space-y-1 py-1 border-b border-gray-100 last:border-0">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-800 font-medium">{item.name}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>
                                      ({formatCurrency(greenDisplayPrice)} + {formatCurrency(upcharge)}) × {quantity}
                                    </span>
                                    <span className="text-orange-600 font-semibold">
                                      {formatCurrency(itemTotal)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Service Total */}
                        <div className="flex justify-between items-center pt-2 border-t border-orange-200">
                          <span className="font-semibold text-gray-900">Service Total</span>
                          <span className="text-xl font-bold text-orange-600">{formatCurrency(cateringCalc.finalTotal)}</span>
                        </div>
                      </div>
                    )}

                    {/* Non-catering services use ServiceSummaryItem */}
                    {!isCatering && (
                      <ServiceSummaryItem
                        service={service}
                        selectedItems={selectedItems}
                        serviceIndex={index}
                        deliveryFee={finalDeliveryFee}
                      />
                    )}

                    {/* Delivery fee for catering services */}
                    {isCatering && finalDeliveryFee && finalDeliveryFee.fee > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-700 font-medium">Delivery Fee</span>
                            {finalDeliveryFee.range && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {finalDeliveryFee.range}
                              </span>
                            )}
                          </div>
                          <span className="text-orange-600 font-semibold">+{formatCurrency(finalDeliveryFee.fee)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Custom Adjustments */}
        {(calculations.adjustmentsBreakdown?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              Adjustments
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-orange-100">
              {calculations.adjustmentsBreakdown!.map((adj) => (
                <div key={adj.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">{adj.label}</span>
                  <span className={adj.amount < 0 ? "text-red-600 font-semibold" : "text-orange-600 font-semibold"}>
                    {adj.amount < 0 ? '' : '+'}{formatCurrency(adj.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Delivery Fees Summary - Show if any delivery fees exist */}
        {totalDeliveryFees > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                {(calculations.adjustmentsBreakdown?.length ?? 0) > 0 ? '3' : '2'}
              </span>
              Delivery Fees
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-orange-100">
              {Object.entries(serviceDeliveryFees).map(([serviceId, feeInfo]) => {
                const service = selectedServices.find(s =>
                  (s.id || s.serviceId) === serviceId
                );

                // Check distance with the same serviceId
                let distance = serviceDistances[serviceId];

                // If distance not found, try alternate service ID formats
                if (!distance && service) {
                  distance = serviceDistances[service.id] || serviceDistances[service.serviceId];
                }

                // Show delivery fee if there's either a calculated distance OR a manually selected fee
                if (!service || !feeInfo.fee) return null;
                return (
                  <div key={serviceId} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <span className="text-gray-800 font-medium block">
                        {service.serviceName || service.name}
                      </span>
                      {feeInfo.range && (
                        <span className="text-orange-600 text-xs font-semibold bg-orange-50 px-2 py-0.5 rounded inline-block mt-1">
                          {feeInfo.range}
                        </span>
                      )}
                    </div>
                    <span className="text-orange-600 font-semibold">{formatCurrency(feeInfo.fee)}</span>
                  </div>
                );
              })}
              <Separator className="my-2 bg-orange-200" />
              <div className="flex justify-between items-center pt-1">
                <span className="font-semibold text-gray-900">Total Delivery Fees</span>
                <span className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalDeliveryFees)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Breakdown - Only show on checkout page */}
        {showDetailedBreakdown && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
                {(() => {
                  let sectionNum = selectedServices.length > 0 ? 2 : 1;
                  if ((calculations.adjustmentsBreakdown?.length ?? 0) > 0) sectionNum++;
                  if (totalDeliveryFees > 0) sectionNum++;
                  return sectionNum;
                })()}
              </span>
              Fees & Tax
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-orange-100">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(calculations.subtotal + (calculations.adjustmentsTotal || 0) + totalDeliveryFees)}
                </span>
              </div>

              {(calculations.serviceFee > 0 || isServiceFeeWaived) && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`text-gray-600 ${isServiceFeeWaived ? 'line-through' : ''}`}>
                      Service Fee
                    </span>
                    {isServiceFeeWaived && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        WAIVED
                      </Badge>
                    )}
                  </div>
                  <span className={isServiceFeeWaived ? 'line-through text-gray-400' : 'font-semibold text-gray-900'}>
                    {formatCurrency(isServiceFeeWaived ? 0 : calculations.serviceFee)}
                  </span>
                </div>
              )}

              {(calculations.tax > 0 || isTaxExempt) && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">
                      Tax {calculations.taxData?.rate ? `(${(calculations.taxData.rate * 100).toFixed(1)}%)` : ''}
                    </span>
                    {isTaxExempt && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                        EXEMPT
                      </Badge>
                    )}
                  </div>
                  <span className={isTaxExempt ? 'text-blue-600 font-semibold' : 'font-semibold text-gray-900'}>
                    {isTaxExempt ? 'Exempt' : formatCurrency(calculations.tax)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Non-detailed view: show subtotal in a simple white box */}
        {!showDetailedBreakdown && (
          <div className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Subtotal</span>
              <span className="text-xl font-bold text-orange-600">
                {formatCurrency(calculations.subtotal + (calculations.adjustmentsTotal || 0) + totalDeliveryFees)}
              </span>
            </div>

            {/* Tax Info - Show on booking page for transparency */}
            {showCheckoutTaxNote && calculations.taxData && !isTaxExempt && (
              <div className="text-xs text-gray-500 mt-2">
                *Tax and fees will be calculated at checkout
              </div>
            )}

            {/* Tax Exempt Notice */}
            {isTaxExempt && (
              <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  EXEMPT
                </Badge>
                <span>This order is tax exempt</span>
              </div>
            )}
          </div>
        )}

        {/* Final Total - Orange gradient bar */}
        {showDetailedBreakdown && (
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg p-5 shadow-lg border-2 border-orange-400">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-lg">TOTAL</span>
              <span className="text-3xl font-bold text-white drop-shadow-md">
                {formatCurrency(calculations.total)}
              </span>
            </div>
          </div>
        )}

        {/* Item Count Summary */}
        {showItemCountFooter && totalItemsSelected > 0 && (
          <div className="text-xs text-gray-500 text-center pt-2">
            {totalItemsSelected} total items selected
          </div>
        )}
      </CardContent>
    </Card>
  );
});

EnhancedOrderSummaryCard.displayName = 'EnhancedOrderSummaryCard';

export default EnhancedOrderSummaryCard;
