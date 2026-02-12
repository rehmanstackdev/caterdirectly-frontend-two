import React from "react";
import { ServiceSelection } from "@/types/order";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ServiceImage from "@/components/shared/ServiceImage";
import { getServiceName, getMenuItems, calculateServiceTotal, requiresItemSelection } from "@/utils/order-summary-utils";
import { getFormattedServicePrice } from "@/utils/order/service-price-utils";
import SelectedItemsBreakdown from "@/components/booking/order-summary/SelectedItemsBreakdown";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import { useServiceDistances } from "@/hooks/use-service-distances";
import { calculateUnifiedOrderTotals } from "@/utils/unified-calculations";
import { getTaxRateByLocation } from "@/utils/tax-calculation";
import { Loader2 } from "lucide-react";

interface OrderItemsBreakdownProps {
  services: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  billingAddress?: string | null;
  taxOverride?: { amount: number; rate?: number; breakdown?: any; jurisdiction?: any } | null;
  serviceFeeOverride?: {
    serviceFeePercentage?: number;
    serviceFeeFixed?: number;
    serviceFeeType?: string;
  };
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  // ✅ NEW: Accept pre-calculated pricing snapshot (SSOT)
  pricingSnapshot?: {
    subtotal: number;
    serviceFee: number;
    deliveryFee: number;
    adjustmentsTotal: number;
    adjustmentsBreakdown: any[];
    tax: number;
    taxRate: number;
    total: number;
  } | null;
}

const OrderItemsBreakdown = ({ 
  services, 
  selectedItems, 
  formData,
  billingAddress,
  taxOverride,
  serviceFeeOverride,
  isTaxExempt = false,
  isServiceFeeWaived = false,
  pricingSnapshot = null
}: OrderItemsBreakdownProps) => {
  console.log('[OrderItemsBreakdown] Rendering', {
    selectedItems,
    hasPricingSnapshot: !!pricingSnapshot,
    customAdjustments: formData.customAdjustments
  });
  
  const { settings } = useAdminSettings();
  const { distancesByService } = useServiceDistances(services, formData.location);
  
  // Use serviceFeeOverride if provided (for public pages), otherwise use admin settings
  const effectiveSettings = serviceFeeOverride || settings || {
    serviceFeePercentage: 5.0,
    serviceFeeFixed: 0.00,
    serviceFeeType: 'percentage'
  };
  
  // ✅ SSOT: If pricing snapshot provided, use it directly (no recalculation)
  // Otherwise, calculate live using unified system
  const calculatedTotals = pricingSnapshot ? null : calculateUnifiedOrderTotals(
    services,
    selectedItems,
    formData.location,
    effectiveSettings,
    undefined, // actualDistanceMiles
    formData.customAdjustments || [],
    distancesByService, // actualDistancesByService
    isTaxExempt,
    isServiceFeeWaived
  );
  
  // Extract values from either snapshot or calculated totals
  const subtotal = pricingSnapshot?.subtotal ?? calculatedTotals?.subtotal ?? 0;
  const serviceFee = pricingSnapshot?.serviceFee ?? calculatedTotals?.serviceFee ?? 0;
  const deliveryFee = pricingSnapshot?.deliveryFee ?? calculatedTotals?.deliveryFee ?? 0;
  const deliveryDetails = calculatedTotals?.deliveryDetails;
  const adjustmentsTotal = pricingSnapshot?.adjustmentsTotal ?? calculatedTotals?.adjustmentsTotal ?? 0;
  const adjustmentsBreakdown = pricingSnapshot?.adjustmentsBreakdown ?? calculatedTotals?.adjustmentsBreakdown ?? [];
  
  if (pricingSnapshot) {
    console.info('[OrderItemsBreakdown] Using pricing snapshot (SSOT)', {
      subtotal,
      serviceFee,
      deliveryFee,
      adjustmentsTotal,
      total: pricingSnapshot.total
    });
  }
  
  // Debug: Log adjustments source and values
  console.info('[OrderItemsBreakdown] Adjustments', {
    fromSnapshot: !!pricingSnapshot,
    adjustmentsCount: adjustmentsBreakdown.length,
    adjustmentsSum: adjustmentsBreakdown.reduce((sum, adj) => sum + adj.amount, 0),
    adjustments: adjustmentsBreakdown.map(adj => ({
      label: adj.label,
      amount: adj.amount,
      mode: adj.mode
    }))
  });

// Tax calculation and display logic - ENFORCE tax exemption
// Only include taxable adjustments in pre-tax base for tax calculation
const taxableAdjustments = adjustmentsBreakdown
  .filter(adj => adj.taxable !== false)
  .reduce((sum, adj) => sum + adj.amount, 0);

const preTaxTotal = subtotal + serviceFee + deliveryFee + taxableAdjustments;

// Add non-taxable adjustments after tax calculation
const nonTaxableAdjustments = adjustmentsBreakdown
  .filter(adj => adj.taxable === false)
  .reduce((sum, adj) => sum + adj.amount, 0);

// ✅ SSOT PRIORITY: Use tax from pricing snapshot (invoice) if available
const snapshotTax = pricingSnapshot?.tax ?? null;
const snapshotTaxRate = pricingSnapshot?.taxRate ?? null;

// Calculate override rate (for draft orders being edited)
const overrideRate = taxOverride?.rate ?? taxOverride?.breakdown?.[0]?.tax_rate;

// Derive rate from location only as final fallback
const derivedRate = getTaxRateByLocation(billingAddress || formData?.location || '').rate;

// Use the most specific rate available
const effectiveRate = snapshotTaxRate ?? overrideRate ?? derivedRate;

// ✅ Tax calculation with SSOT priority
const effectiveTax = isTaxExempt 
  ? 0 
  : (snapshotTax ?? (taxOverride?.amount ?? preTaxTotal * effectiveRate));

// ✅ Show tax if we have snapshot OR billingAddress OR taxOverride
const shouldDisplayTax = !!pricingSnapshot || billingAddress || taxOverride !== undefined;

// Only show "Calculating..." if we're waiting for billing address AND no snapshot
const isCalculatingTax = billingAddress && !taxOverride && !pricingSnapshot;

// ✅ Update final total to exclude tax
const finalTotal = pricingSnapshot?.total ?? (preTaxTotal + nonTaxableAdjustments);

// Helper function to get tax display label with percentage
const getTaxDisplayLabel = () => {
  if (isTaxExempt) return 'Tax (Exempt)';
  
  // Use the rate that was actually charged (from snapshot or calculated)
  return `Tax (${(effectiveRate * 100).toFixed(2)}%)`;
};
  
  return (
    <Card>
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-base sm:text-lg">Order Items & Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8">
        {/* Consolidated Invoice Items */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 text-sm sm:text-base">Order Details</h3>
          
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="space-y-4">
              {/* Header - Mobile optimized */}
              <div className="hidden sm:grid grid-cols-12 gap-3 text-xs font-medium text-gray-600 uppercase tracking-wide px-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              <div className="sm:hidden">
                <Separator />
              </div>
              
              {/* Services and Items */}
              {services.map((service, serviceIndex) => {
                const serviceName = getServiceName(service);
                const formattedServicePrice = getFormattedServicePrice(service);
                const servicePrice = parseFloat(formattedServicePrice.replace(/[^0-9.]/g, '')) || 0;
                const menuItems = getMenuItems(service);
                const hasMenuItems = menuItems && menuItems.length > 0;
                const requiresSelection = requiresItemSelection(service.serviceType || service.type || '');
                
                // Use unified calculation for service total
                const serviceTotal = calculateServiceTotal(service, selectedItems);

                // Calculate actual staff count and duration from selectedItems for display
                const serviceId = service.id || service.serviceId;
                let staffCount = service.quantity || 1;
                let effectiveDuration = service.duration || 1;
                
                if (service.serviceType === 'staff') {
                  // Get valid staff role IDs from service details
                  const staffServiceItems = service.service_details?.staffServices || 
                                           service.service_details?.services || 
                                           [];
                  const validStaffRoleIds = staffServiceItems.map((item: any) => item.id || item.itemId);
                  
                  const allKeys = Object.keys(selectedItems);
                  
                  // Only count items that belong to THIS staff service
                  const staffRoleKeys = allKeys.filter(key => 
                    !key.endsWith('_duration') &&
                    selectedItems[key] > 0 &&
                    (
                      // Prefixed with this service ID (e.g., "serviceId_bartender")
                      key.startsWith(`${serviceId}_`) ||
                      // OR is a direct match to a valid staff role ID
                      validStaffRoleIds.includes(key)
                    )
                  );
                  
                  // Sum quantities only from valid staff items
                  let totalStaffCount = 0;
                  if (staffRoleKeys.length > 0) {
                    totalStaffCount = staffRoleKeys.reduce((sum, key) => sum + (selectedItems[key] || 0), 0);
                  }
                  
                  console.log('[Staff Calc] Counting keys:', {
                    serviceId,
                    serviceName,
                    validStaffRoleIds,
                    matchedKeys: staffRoleKeys,
                    quantities: staffRoleKeys.map(k => ({ key: k, qty: selectedItems[k] })),
                    totalCount: totalStaffCount
                  });
                  
                  // Fallback to service object if no valid items found
                  if (totalStaffCount > 0) {
                    staffCount = totalStaffCount;
                  } else {
                    staffCount = selectedItems[serviceId] || service.quantity || 1;
                  }
                  
                  // Find maximum duration from staff role keys
                  const durations: number[] = [];
                  
                  staffRoleKeys.forEach(roleKey => {
                    const durationKey = `${roleKey}_duration`;
                    if (selectedItems[durationKey]) {
                      durations.push(selectedItems[durationKey]);
                    }
                  });
                  
                  // PHASE 2: Ultimate fallback to service object or minimumHours
                  if (durations.length > 0) {
                    effectiveDuration = Math.max(...durations);
                  } else {
                    effectiveDuration = selectedItems[`${serviceId}_duration`] || 
                                       service.duration || 
                                       service.service_details?.staff?.minimumHours || 1;
                  }
                  
                  // Enforce minimum hours if specified
                  if (service.service_details?.staff?.minimumHours) {
                    effectiveDuration = Math.max(effectiveDuration, service.service_details.staff.minimumHours);
                  }
                  
                  console.info(`[Staff Service ${serviceName}] Final values:`, {
                    serviceQuantity: service.quantity,
                    serviceDuration: service.duration,
                    staffRoleKeys,
                    calculatedStaffCount: staffCount,
                    calculatedDuration: effectiveDuration
                  });
                }

                return (
                  <div key={serviceIndex} className="space-y-3">
                    {/* Service Header - Mobile responsive */}
                    <div className="hidden sm:grid grid-cols-12 gap-3 text-sm py-3 border-b border-gray-200">
                      <div className="col-span-6">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            {(service.serviceImage || service.image) && (
                              <ServiceImage
                                src={service.serviceImage || service.image || ""}
                                alt={serviceName}
                                className="w-full h-full object-cover"
                                aspectRatio="aspect-square"
                              />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 truncate">{serviceName}</p>
                            <p className="text-xs text-gray-500 truncate">by {service.vendorName || service.vendor || "Vendor"}</p>
                            {service.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2 text-center font-medium self-center">
                        {service.serviceType === 'staff' ? `${staffCount} × ${effectiveDuration} hrs` : requiresSelection ? 'See Below' : (service.quantity || 1)}
                      </div>
                      <div className="col-span-2 text-right self-center text-sm">
                        {service.serviceType === 'staff' ? `${formattedServicePrice}/hr` : requiresSelection ? 'See Below' : formattedServicePrice}
                      </div>
                      <div className="col-span-2 text-right font-semibold text-[#F07712] self-center">
                        ${serviceTotal.toFixed(2)}
                      </div>
                    </div>

                    {/* Mobile Service Header */}
                    <div className="sm:hidden p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {(service.serviceImage || service.image) && (
                            <ServiceImage
                              src={service.serviceImage || service.image || ""}
                              alt={serviceName}
                              className="w-full h-full object-cover"
                              aspectRatio="aspect-square"
                            />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-sm break-words">{serviceName}</h4>
                          <p className="text-xs text-gray-500 break-words">by {service.vendorName || service.vendor || "Vendor"}</p>
                          {service.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                          )}
                            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Qty: </span>
                              <span className="font-medium">
                                {service.serviceType === 'staff' ? `${staffCount} × ${effectiveDuration} hrs` : requiresSelection ? 'See Below' : (service.quantity || 1)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Price: </span>
                              <span className="font-medium">
                                {service.serviceType === 'staff' ? `${formattedServicePrice}/hr` : requiresSelection ? 'See Below' : formattedServicePrice}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-right">
                            <span className="text-sm font-semibold text-[#F07712]">${serviceTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items Breakdown - For catering services */}
                    {hasMenuItems && service.serviceType === 'catering' && (
                      <div className="ml-0 sm:ml-4 space-y-1 pl-0 sm:pl-8">
                        {menuItems.map((item: any) => {
                          const quantity = selectedItems[item.id] || 0;
                          if (quantity <= 0) return null;
                          
                          const itemPrice = typeof item.price === 'string' 
                            ? parseFloat(item.price.replace(/[^0-9.-]/g, '')) || 0
                            : Number(item.price) || 0;
                          const itemTotal = itemPrice * quantity;
                          
                          return (
                            <div key={item.id} className="hidden sm:grid grid-cols-12 gap-3 text-xs py-1 text-gray-600">
                              <div className="col-span-6 pl-4 flex items-center gap-2">
                                {item.image && (
                                  <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                    <ServiceImage
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      aspectRatio="aspect-square"
                                      showLoadingPlaceholder={false}
                                    />
                                  </div>
                                )}
                                <span>• {item.name}</span>
                              </div>
                              <div className="col-span-2 text-center">
                                {quantity}
                              </div>
                              <div className="col-span-2 text-right">
                                ${itemPrice.toFixed(2)}
                              </div>
                              <div className="col-span-2 text-right font-medium">
                                ${itemTotal.toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Mobile Menu Items */}
                        <div className="sm:hidden space-y-2 mt-3 pl-4 border-l-2 border-gray-200">
                          {menuItems.map((item: any) => {
                            const quantity = selectedItems[item.id] || 0;
                            if (quantity <= 0) return null;
                            
                            const itemPrice = typeof item.price === 'string' 
                              ? parseFloat(item.price.replace(/[^0-9.-]/g, '')) || 0
                              : Number(item.price) || 0;
                            const itemTotal = itemPrice * quantity;
                            
                            return (
                              <div key={item.id} className="flex justify-between items-center text-xs text-gray-600">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {item.image && (
                                    <div className="w-6 h-6 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                      <ServiceImage
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        aspectRatio="aspect-square"
                                        showLoadingPlaceholder={false}
                                      />
                                    </div>
                                  )}
                                  <span className="break-words">• {item.name} × {quantity}</span>
                                </div>
                                <span className="font-medium ml-2 whitespace-nowrap">${itemTotal.toFixed(2)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Staff Items Breakdown */}
                    {service.serviceType === 'staff' && (() => {
                      const details = service.service_details;
                      const staffItems = details?.staffServices || details?.services || [];
                      if (staffItems.length > 0) {
                        return (
                          <div className="mt-2">
                            <SelectedItemsBreakdown
                              bookableItems={staffItems}
                              selectedItems={selectedItems}
                              serviceType="staff"
                              serviceId={service.id || service.serviceId}
                            />
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Custom Line Items Section - ✅ SSOT: Use adjustmentsBreakdown (matches totals) */}
        {adjustmentsBreakdown.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">Custom Line Items</h3>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="space-y-2">
                {adjustmentsBreakdown.map((adjustment) => {
                  const isPercentage = adjustment.type === 'percentage';
                  const isSurcharge = adjustment.mode === 'surcharge';
                  
                  return (
                    <div key={adjustment.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {adjustment.label} {isPercentage && adjustment.value ? `(${adjustment.value}%)` : ''}
                      </span>
                      <span className={`font-medium ${isSurcharge ? 'text-orange-600' : 'text-green-600'}`}>
                        {isSurcharge ? '+' : '-'}${Math.abs(adjustment.amount).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Order Totals */}
        <div className="space-y-4">
          <Separator />
          
          {/* Mobile Totals */}
          <div className="sm:hidden bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">Order Total</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {serviceFee > 0 || isServiceFeeWaived ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      Service Fee
                      {isServiceFeeWaived && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">WAIVED</span>
                      )}
                    </span>
                    <span className={`font-medium ${isServiceFeeWaived ? 'line-through text-gray-400' : ''}`}>
                      ${serviceFee.toFixed(2)}
                    </span>
                  </div>
                ) : null}
<div className="flex justify-between">
  <span className="text-gray-600">Delivery Fee{deliveryDetails?.range ? ` (${deliveryDetails.range})` : ''}</span>
  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
</div>
{deliveryDetails?.minimumWarnings && deliveryDetails.minimumWarnings.length > 0 && (
  <div className="ml-4 mt-1">
    {deliveryDetails.minimumWarnings.map((warning, index) => (
      <div key={index} className="text-xs text-orange-600 flex justify-between">
        <span>{warning.vendor}: ${warning.required} minimum required</span>
        <span>(current: ${warning.current.toFixed(2)})</span>
      </div>
    ))}
  </div>
)}
{adjustmentsBreakdown.length > 0 && adjustmentsBreakdown.map((adjustment) => (
  <div key={adjustment.id} className="flex justify-between">
    <span className="text-gray-600">{adjustment.label}</span>
    <span className={`font-medium ${adjustment.mode === 'discount' ? 'text-green-600' : ''}`}>
      {adjustment.mode === 'discount' ? '-' : ''}${Math.abs(adjustment.amount).toFixed(2)}
    </span>
  </div>
))}
{shouldDisplayTax || isTaxExempt ? (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 flex items-center gap-2">
      {getTaxDisplayLabel()}
      {isTaxExempt && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">EXEMPT</span>
      )}
    </span>
    <span className={`font-medium ${isTaxExempt ? 'line-through text-gray-400' : ''}`}>
      {isCalculatingTax ? 'Calculating...' : `$${effectiveTax.toFixed(2)}`}
    </span>
  </div>
) : (
  <div className="flex justify-between">
    <span className="text-gray-600">Tax (calculated after billing address)</span>
    <span className="font-medium">$0.00</span>
  </div>
)}
                <Separator />
<div className="flex justify-between text-base font-semibold text-[#F07712]">
  <span>Total</span>
  <span>${finalTotal.toFixed(2)}</span>
</div>
            </div>
          </div>

          {/* Desktop Totals */}
          <div className="hidden sm:block">
            <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Order Total</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {serviceFee > 0 || isServiceFeeWaived ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-2">
                      Service Fee
                      {isServiceFeeWaived && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">WAIVED</span>
                      )}
                    </span>
                    <span className={`font-medium ${isServiceFeeWaived ? 'line-through text-gray-400' : ''}`}>
                      ${serviceFee.toFixed(2)}
                    </span>
                  </div>
                ) : null}
<div className="flex justify-between">
  <span className="text-gray-600">Delivery Fee{deliveryDetails?.range ? ` (${deliveryDetails.range})` : ''}</span>
  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
</div>
{deliveryDetails?.minimumWarnings && deliveryDetails.minimumWarnings.length > 0 && (
  <div className="ml-4 mt-1">
    {deliveryDetails.minimumWarnings.map((warning, index) => (
      <div key={index} className="text-xs text-orange-600 flex justify-between">
        <span>{warning.vendor}: ${warning.required} minimum required</span>
        <span>(current: ${warning.current.toFixed(2)})</span>
      </div>
    ))}
  </div>
)}
{adjustmentsBreakdown.length > 0 && adjustmentsBreakdown.map((adjustment) => (
  <div key={adjustment.id} className="flex justify-between">
    <span className="text-gray-600">{adjustment.label}</span>
    <span className={`font-medium ${adjustment.mode === 'discount' ? 'text-green-600' : ''}`}>
      {adjustment.mode === 'discount' ? '-' : ''}${Math.abs(adjustment.amount).toFixed(2)}
    </span>
  </div>
))}
{shouldDisplayTax || isTaxExempt ? (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 flex items-center gap-2">
      {getTaxDisplayLabel()}
      {isTaxExempt && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">EXEMPT</span>
      )}
    </span>
    <span className={`font-medium ${isTaxExempt ? 'line-through text-gray-400' : ''}`}>
      {isCalculatingTax ? 'Calculating...' : `$${effectiveTax.toFixed(2)}`}
    </span>
  </div>
) : (
  <div className="flex justify-between">
    <span className="text-gray-600">Tax (calculated after billing address)</span>
    <span className="font-medium">$0.00</span>
  </div>
)}
                <Separator />
<div className="flex justify-between text-base font-semibold text-[#F07712]">
  <span>Total</span>
  <span>${finalTotal.toFixed(2)}</span>
</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemsBreakdown;