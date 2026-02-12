import React, { useMemo } from "react";
import { ServiceSelection } from "@/types/order";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ServiceImage from "@/components/shared/ServiceImage";
import { getServiceName, getMenuItems, calculateServiceTotal, requiresItemSelection } from "@/utils/order-summary-utils";
import { getFormattedServicePrice } from "@/utils/order/service-price-utils";
import SelectedItemsBreakdown from "@/components/booking/order-summary/SelectedItemsBreakdown";
import { useAdminSettings } from "@/hooks/use-admin-settings";
import { useServiceDistances } from "@/hooks/use-service-distances";
import { calculateUnifiedOrderTotals } from "@/utils/unified-calculations";
import { calculateCateringPrice, extractCateringItems } from "@/utils/catering-price-calculation";
import { getTaxRateByLocation } from "@/utils/tax-calculation";
import { useApiDeliveryCalculations } from "@/hooks/use-api-delivery-calculations";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ImageIcon } from "lucide-react";

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
  onDeliveryFeeCalculated?: (deliveryFee: number) => void;
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
  
  // Calculate service delivery fees first
  const serviceDeliveryFees = services.reduce((total, service) => {
    const serviceFee = parseFloat((service as any).deliveryFee || '0') || 0;
    return total + serviceFee;
  }, 0);
  
  // Use API-based delivery calculations for the first service (primary service)
  const primaryService = services[0];
  const apiDeliveryResult = useApiDeliveryCalculations(
    formData.location || '',
    primaryService?.service_details?.deliveryOptions || {},
    subtotal,
    distancesByService?.[primaryService?.id || primaryService?.serviceId || '']?.distanceMiles,
    primaryService?.id || primaryService?.serviceId,
    primaryService?.vendorId
  );
  
  // Calculate final delivery fee: Use API result if available, otherwise fallback to existing logic
  const deliveryFee = apiDeliveryResult.usingApiResult 
    ? apiDeliveryResult.deliveryFee
    : serviceDeliveryFees > 0 
      ? serviceDeliveryFees 
      : (pricingSnapshot?.deliveryFee ?? calculatedTotals?.deliveryFee ?? 0);
  
  const deliveryDetails = calculatedTotals?.deliveryDetails;
  const adjustmentsTotal = pricingSnapshot?.adjustmentsTotal ?? calculatedTotals?.adjustmentsTotal ?? 0;
  const adjustmentsBreakdown = pricingSnapshot?.adjustmentsBreakdown ?? calculatedTotals?.adjustmentsBreakdown ?? [];
  
  // Only include taxable adjustments in pre-tax base for tax calculation
const taxableAdjustments = adjustmentsBreakdown
  .filter(adj => adj.taxable !== false)
  .reduce((sum, adj) => sum + adj.amount, 0);

const preTaxTotal = subtotal + serviceFee + deliveryFee + taxableAdjustments;

// Add non-taxable adjustments after tax calculation
const nonTaxableAdjustments = adjustmentsBreakdown
  .filter(adj => adj.taxable === false)
  .reduce((sum, adj) => sum + adj.amount, 0);

// ✅ Update final total to exclude tax
const finalTotal = pricingSnapshot?.total ?? (preTaxTotal + nonTaxableAdjustments);

  // Get guest count from formData
  const guestCount = parseInt(String(formData?.headcount || formData?.guestCount || '1')) || 1;

  // Calculate catering breakdowns for each catering service
  const cateringCalculations = useMemo(() => {
    const calculations: Record<string, ReturnType<typeof calculateCateringPrice> & {
      menuItems: Array<{ name: string; quantity: number; price: number; additionalCharge: number; image?: string }>;
      simpleItems: Array<{ name: string; quantity: number; price: number; image?: string }>;
      premiumItems: Array<{ name: string; quantity: number; price: number; additionalCharge: number; image?: string }>;
    }> = {};

    services.forEach(service => {
      const serviceType = service.serviceType || service.type || '';
      if (serviceType === 'catering' && service.service_details) {
        const serviceId = service.id || service.serviceId;

        // Check if comboCategoryItems are already parsed (from API)
        const apiComboCategoryItems = service.service_details.comboCategoryItems || [];
        // Check for cateringItems (menu items from API) - these are individual menu items, not combo items
        const apiCateringItems = service.service_details.menuItems || service.service_details.catering?.menuItems || [];

        let comboCategoryItems: Array<{ name: string; quantity: number; price: number; additionalCharge?: number; image?: string }> = [];
        let baseItems: Array<{ id: string; name: string; price: number; quantity: number; isCombo: boolean }> = [];
        let additionalChargeItems: Array<{ id: string; name: string; price: number; additionalCharge: number; quantity: number; isMenuItem?: boolean; image?: string }> = [];
        let cateringMenuItems: Array<{ name: string; quantity: number; price: number; additionalCharge: number; image?: string }> = [];

        if (apiComboCategoryItems.length > 0 || apiCateringItems.length > 0) {
          // Use pre-parsed combo category items from API
          // Note: These items are displayed separately, their prices should NOT be added to base price
          comboCategoryItems = apiComboCategoryItems.map((item: any) => ({
            name: item.name || item.menuItemName,
            quantity: item.quantity || 1,
            price: parseFloat(String(item.price)) || 0,
            additionalCharge: item.additionalCharge || (item.premiumCharge ? parseFloat(String(item.premiumCharge)) : 0),
            image: item.image || item.imageUrl || ''
          }));

          // When API provides comboCategoryItems, the base price is 0
          // because the combo category items' prices are displayed separately
          // in "Selected Items" (simple items) and "Additional Charges" (premium items)
          // baseItems stays empty, so basePricePerPerson will be 0

          // Map cateringItems (individual menu items) to additionalChargeItems format
          // These are menu items like "grill chicken", "Veges" which have their own prices
          apiCateringItems.forEach((item: any) => {
            // Get quantity from selectedItems or from the item itself
            const itemId = item.id || item.cateringId;
            const quantity = selectedItems[itemId] || item.quantity || 0;
            if (quantity > 0) {
              const price = parseFloat(String(item.price || item.pricePerPerson)) || 0;
              cateringMenuItems.push({
                name: item.name || item.menuItemName,
                quantity: quantity,
                price: price,
                additionalCharge: price, // Menu items use their price as the charge
                image: item.image || item.imageUrl || ''
              });
            }
          });
        } else {
          // Fall back to extractCateringItems for booking flow
          const extracted = extractCateringItems(selectedItems, service.service_details);
          baseItems = extracted.baseItems;
          additionalChargeItems = extracted.additionalChargeItems.map(item => ({
            ...item,
            image: (item as any).image || ''
          }));
          comboCategoryItems = extracted.comboCategoryItems.map(item => ({
            ...item,
            image: (item as any).image || ''
          }));
        }

        // Calculate base price per person (sum of all base items)
        const basePricePerPerson = baseItems.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);

        // Prepare additional charges for calculation
        // Include both additionalChargeItems AND cateringMenuItems (from API)
        const additionalCharges = [
          ...additionalChargeItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.price,
            additionalCharge: item.additionalCharge,
            isMenuItem: item.isMenuItem
          })),
          // Also include cateringMenuItems (individual menu items from API like BBQ, Veges, grill chicken)
          ...cateringMenuItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: 0,
            additionalCharge: item.price, // Menu items use their price as the charge per guest
            isMenuItem: true
          }))
        ];

        const calcResult = calculateCateringPrice(basePricePerPerson, additionalCharges, guestCount, comboCategoryItems);

        // Separate menu items (individual items, not combo category items)
        // Use cateringMenuItems if available (from API), otherwise use additionalChargeItems
        const menuItems = cateringMenuItems.length > 0
          ? cateringMenuItems
          : additionalChargeItems.filter(item => item.isMenuItem).map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              additionalCharge: item.additionalCharge,
              image: item.image || ''
            }));

        // Separate simple items (no additional charge) from premium items
        const simpleItems = comboCategoryItems.filter(item => !item.additionalCharge || item.additionalCharge === 0).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image || ''
        }));
        const premiumItems = comboCategoryItems.filter(item => item.additionalCharge && item.additionalCharge > 0).map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          additionalCharge: item.additionalCharge!,
          image: item.image || ''
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
  }, [services, selectedItems, guestCount]);

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardHeader className="pb-4 border-b border-gray-200">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
          <span className="font-bold">Order Items & Pricing</span>
          {services.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-auto bg-gray-100 text-gray-700 hover:bg-gray-200">
              {services.length} service{services.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Section 1: Services */}
        <div className="space-y-3">
          {/* <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-bold">1</span>
            Services
          </h4> */}

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="space-y-4">
              {/* Header - Mobile optimized */}
              {/* <div className="hidden sm:grid grid-cols-12 gap-3 text-sm font-bold text-gray-800 uppercase tracking-wide px-1 py-2">
                <div className="col-span-6">Item</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Unit Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div> */}
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
                }

                // Check if this is a catering service with calculation data
                const isCatering = service.serviceType === 'catering';
                const cateringCalc = isCatering ? cateringCalculations[serviceId] : null;

                return (
                  <div key={serviceIndex} className="space-y-3">
                    {/* Catering Service with Calculation Breakdown */}
                    {isCatering && cateringCalc && cateringCalc.finalTotal > 0 ? (
                      <div className="space-y-3">
                        {/* Service Name Header */}
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">{serviceName}</span>
                          <span className="text-xs text-gray-500">{service.vendorName || service.vendor}</span>
                        </div>

                        {/* 1. Menu Items (individual items) - Price × Quantity ONLY (NO guest count) */}
                        {cateringCalc.menuItems && cateringCalc.menuItems.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <span className="text-sm font-semibold text-gray-500 uppercase mb-2 block">Menu Items</span>

                            {/* Column Headers */}
                            <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-300">
                              <div className="col-span-5">
                                <span className="text-sm font-semibold text-gray-600 uppercase">Item</span>
                              </div>
                              <div className="col-span-3 text-right">
                                <span className="text-sm font-semibold text-gray-600 uppercase">Unit Price</span>
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="text-sm font-semibold text-gray-600 uppercase">Qty</span>
                              </div>
                              <div className="col-span-2 text-right">
                                <span className="text-sm font-semibold text-gray-600 uppercase">Total</span>
                              </div>
                            </div>

                            {cateringCalc.menuItems.map((item, idx) => (
                              <div key={idx} className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 last:border-0 items-center">
                                <div className="col-span-5 flex items-center gap-2">
                                  <Avatar className="h-14 w-14 shrink-0 rounded-md">
                                    <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                                    <AvatarFallback className="bg-gray-200 text-gray-500 rounded-md">
                                      <ImageIcon className="h-6 w-6" />
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-gray-800 font-medium text-sm">{item.name}</span>
                                </div>
                                <div className="col-span-3 text-right">
                                  <span className="text-gray-700 text-sm">{formatCurrency(item.additionalCharge)}</span>
                                </div>
                                <div className="col-span-2 text-center">
                                  <span className="text-gray-700 text-sm">{item.quantity}</span>
                                </div>
                                <div className="col-span-2 text-right">
                                  <span className="text-gray-900 font-semibold text-sm">
                                    {formatCurrency(item.additionalCharge * item.quantity)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 2. Combo Base Price - No guest count breakdown shown */}
                        {/* Base price is calculated using protein quantity in BookingFlow, not guest count */}
                        {cateringCalc.basePricePerPerson > 0 && (
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <span className="text-sm font-semibold text-gray-500 uppercase">Base Price</span>
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-900 text-base">Base Total</span>
                              <span className="text-xl font-bold text-gray-900">{formatCurrency(cateringCalc.basePriceTotal)}</span>
                            </div>
                          </div>
                        )}

                        {/* 3. Selected Items - Includes both simple items and premium items */}
                        {/* For combos: sides multiply by guest count, proteins by protein quantity (already in item.quantity) */}
                        {((cateringCalc.simpleItems && cateringCalc.simpleItems.length > 0) ||
                          (cateringCalc.premiumItems && cateringCalc.premiumItems.length > 0)) && (
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <span className="text-sm font-semibold text-gray-500 uppercase mb-2 block">Selected Items</span>

                            {/* Column Headers */}
                            <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-300">
                              <div className="col-span-5">
                                <span className="text-sm font-semibold text-gray-600 uppercase">Item</span>
                              </div>
                              <div className="col-span-3 text-right">
                                <span className="text-sm font-semibold text-gray-600 uppercase">Unit Price</span>
                              </div>
                              <div className="col-span-2 text-center">
                                <span className="text-sm font-semibold text-gray-600 uppercase">Qty</span>
                              </div>
                              <div className="col-span-2 text-right">
                                <span className="text-sm font-semibold text-gray-600 uppercase">Total</span>
                              </div>
                            </div>

                            {/* Simple Items */}
                            {cateringCalc.simpleItems && cateringCalc.simpleItems.map((item, idx) => {
                              // Simple items from combos: item.quantity already includes the correct multiplier
                              // (protein quantity for proteins, guest count for sides - set in BookingFlow)
                              const itemTotal = item.price * item.quantity;

                              return (
                                <div key={`simple-${idx}`} className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 last:border-0 items-center">
                                  <div className="col-span-5 flex items-center gap-2">
                                    <Avatar className="h-10 w-10 shrink-0 rounded-md">
                                      <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                                      <AvatarFallback className="bg-gray-200 text-gray-500 rounded-md">
                                        <ImageIcon className="h-5 w-5" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-800 font-medium text-sm">{item.name}</span>
                                  </div>
                                  <div className="col-span-3 text-right">
                                    <span className="text-gray-700 text-sm">{formatCurrency(item.price)}</span>
                                  </div>
                                  <div className="col-span-2 text-center">
                                    <span className="text-gray-700 text-sm">{item.quantity}</span>
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <span className="text-gray-900 font-semibold text-sm">
                                      {formatCurrency(itemTotal)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}

                            {/* Premium Items */}
                            {cateringCalc.premiumItems && cateringCalc.premiumItems.map((item, idx) => {
                              // Premium items: unit price = price + additionalCharge
                              const backendPrice = item.price || 0;
                              const upcharge = item.additionalCharge || 0;
                              const unitPrice = backendPrice + upcharge;
                              const quantity = item.quantity || 1;
                              // Total = (price + upcharge) × quantity
                              const itemTotal = unitPrice * quantity;

                              return (
                                <div key={`premium-${idx}`} className="grid grid-cols-12 gap-2 py-2 border-b border-gray-100 last:border-0 items-center">
                                  <div className="col-span-5 flex items-center gap-2">
                                    <Avatar className="h-10 w-10 shrink-0 rounded-md">
                                      <AvatarImage src={item.image} alt={item.name} className="object-cover" />
                                      <AvatarFallback className="bg-gray-200 text-gray-500 rounded-md">
                                        <ImageIcon className="h-5 w-5" />
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-800 font-medium text-sm">{item.name}</span>
                                  </div>
                                  <div className="col-span-3 text-right">
                                    <span className="text-gray-700 text-sm">
                                      {formatCurrency(unitPrice)}
                                    </span>
                                  </div>
                                  <div className="col-span-2 text-center">
                                    <span className="text-gray-700 text-sm">{quantity}</span>
                                  </div>
                                  <div className="col-span-2 text-right">
                                    <span className="text-gray-900 font-semibold text-sm">
                                      {formatCurrency(itemTotal)}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Service Total */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="font-semibold text-gray-900">Service Total</span>
                          <span className="text-xl font-bold text-gray-900">{formatCurrency(cateringCalc.finalTotal)}</span>
                        </div>
                      </div>
                    ) : (
                      /* Non-catering services: Column-based layout */
                      <div className="space-y-3">
                        {/* Service Name Header */}
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-800">{serviceName}</span>
                          <span className="text-xs text-gray-500">{service.vendorName || service.vendor}</span>
                        </div>

                        {/* Service Details with Columns */}
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          {/* Column Headers */}
                          <div className="grid grid-cols-12 gap-2 pb-2 border-b border-gray-300">
                            <div className="col-span-5">
                              <span className="text-sm font-semibold text-gray-600 uppercase">Item</span>
                            </div>
                            <div className="col-span-3 text-right">
                              <span className="text-sm font-semibold text-gray-600 uppercase">Unit Price</span>
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-sm font-semibold text-gray-600 uppercase">Qty</span>
                            </div>
                            <div className="col-span-2 text-right">
                              <span className="text-sm font-semibold text-gray-600 uppercase">Total</span>
                            </div>
                          </div>

                          {/* Service Row */}
                          <div className="grid grid-cols-12 gap-2 py-2 items-center">
                            <div className="col-span-5 flex items-center gap-2">
                              <Avatar className="h-14 w-14 shrink-0 rounded-md">
                                <AvatarImage 
                                  src={(service as any).image || (service as any).imageUrl || (service as any).serviceImage} 
                                  alt={serviceName} 
                                  className="object-cover" 
                                />
                                <AvatarFallback className="bg-gray-200 text-gray-500 rounded-md">
                                  <ImageIcon className="h-6 w-6" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-gray-800 font-medium text-sm">{serviceName}</span>
                            </div>
                            <div className="col-span-3 text-right">
                              <span className="text-gray-700 text-sm">{formattedServicePrice}</span>
                            </div>
                            <div className="col-span-2 text-center">
                              <span className="text-gray-700 text-sm">
                                {(() => {
                                  // For venues, events_staff, and party_rentals, use service.quantity
                                  // For staff services, effectiveDuration represents hours (different from quantity)
                                  const serviceType = service.serviceType || service.type || '';
                                  if (serviceType === 'venues' || serviceType === 'events_staff' || serviceType === 'party_rentals' || serviceType === 'party-rental' || serviceType === 'party-rentals') {
                                    return (service as any).quantity || service.quantity || 1;
                                  }
                                  // For staff, use effectiveDuration (hours) if available, otherwise quantity
                                  return effectiveDuration || (service as any).quantity || service.quantity || 1;
                                })()}
                              </span>
                            </div>
                            <div className="col-span-2 text-right">
                              <span className="text-gray-900 font-semibold text-sm">
                                {formatCurrency(serviceTotal)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Service Total */}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="font-semibold text-gray-900">Service Total</span>
                          <span className="text-xl font-bold text-gray-900">{formatCurrency(serviceTotal)}</span>
                        </div>
                      </div>
                    )}

                    {/* Staff Items Breakdown */}
                    {service.serviceType === 'staff' && (() => {
                      const details = service.service_details;
                      const staffItemsList = details?.staffServices || details?.services || [];
                      if (staffItemsList.length > 0) {
                        return (
                          <div className="mt-2">
                            <SelectedItemsBreakdown
                              bookableItems={staffItemsList}
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

        {/* Section 2: Custom Line Items / Adjustments */}
        {adjustmentsBreakdown.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              Adjustments
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-gray-100">
              {adjustmentsBreakdown.map((adjustment) => {
                const isPercentage = adjustment.type === 'percentage';
                const isSurcharge = adjustment.mode === 'surcharge';

                return (
                  <div key={adjustment.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {adjustment.label} {isPercentage && adjustment.value ? `(${adjustment.value}%)` : ''}
                    </span>
                    <span className={`font-semibold ${isSurcharge ? 'text-gray-900' : 'text-green-600'}`}>
                      {isSurcharge ? '+' : '-'}{formatCurrency(Math.abs(adjustment.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Subtotal Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <span className="font-semibold text-gray-900">Subtotal</span>
              <p className="text-xs text-gray-500 mt-0.5">*Tax and fees will be calculated at checkout</p>
            </div>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
        </div>

        {/* Delivery Fees Section (per vendor) - after subtotal */}
        {(() => {
          const serviceDeliveryFees = services
            .filter(s => {
              const fee = parseFloat(String((s as any).deliveryFee || '0')) || 0;
              return fee > 0;
            })
            .map(s => ({
              serviceName: s.serviceName || s.name || 'Service',
              deliveryFee: parseFloat(String((s as any).deliveryFee || '0')) || 0
            }));

          const totalServiceDeliveryFees = serviceDeliveryFees.reduce((sum, s) => sum + s.deliveryFee, 0);

          if (serviceDeliveryFees.length > 0) {
            return (
              <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase">Delivery Fees</span>
                {serviceDeliveryFees.map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-800">{s.serviceName}</span>
                        <p className="text-xs text-gray-900">75-100 miles</p>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(s.deliveryFee)}</span>
                    </div>
                  </div>
                ))}
                {serviceDeliveryFees.length > 1 && (
                  <>
                    <Separator className="my-2 bg-gray-200" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Delivery Fees</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(totalServiceDeliveryFees)}</span>
                    </div>
                  </>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* Service Fee (only if there are fees) */}
        {(serviceFee > 0 || isServiceFeeWaived) && (
          <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className={`text-gray-600 ${isServiceFeeWaived ? 'line-through' : ''}`}>
                  Service Fee ({effectiveSettings.serviceFeePercentage}%)
                </span>
                {isServiceFeeWaived && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    WAIVED
                  </Badge>
                )}
              </div>
              <span className={`font-semibold ${isServiceFeeWaived ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {formatCurrency(serviceFee)}
              </span>
            </div>
          </div>
        )}

        {/* Tax Section - Calculated based on eventLocation (zipCode, county, city) */}
        {(() => {
          // Get tax data from either snapshot or live calculation
          const taxData = pricingSnapshot
            ? { rate: pricingSnapshot.taxRate, description: `Tax (${(pricingSnapshot.taxRate * 100).toFixed(3)}%)`, jurisdiction: formData?.location }
            : calculatedTotals?.taxData;
          const taxAmount = pricingSnapshot?.tax ?? calculatedTotals?.tax ?? 0;
          const taxRate = taxData?.rate ?? 0;

          // Get location information
          const eventLocation = formData?.location || billingAddress || '';

          if (isTaxExempt) {
            return (
              <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Tax</span>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                      TAX EXEMPT
                    </Badge>
                  </div>
                  <span className="font-semibold text-gray-900">{formatCurrency(0)}</span>
                </div>
                {/* {eventLocation && (
                  <p className="text-xs text-gray-500">Location: {eventLocation}</p>
                )} */}
              </div>
            );
          }

          if (taxAmount > 0 && taxData) {
            // Format tax percentage - remove unnecessary decimal zeros
            const taxPercentageValue = taxRate * 100;
            const taxPercentage = taxPercentageValue % 1 === 0
              ? taxPercentageValue.toFixed(0)
              : taxPercentageValue.toFixed(3).replace(/\.?0+$/, '');

            return (
              <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    {/* Tax label with percentage and badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-700 text-sm font-normal">
                        Tax Fee ({taxPercentage}%)
                      </span>
                      {/* <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200 font-medium">
                        {taxPercentage}% Rate
                      </Badge> */}
                    </div>

                    {/* Jurisdiction (State/County/City) */}
                    {/* {taxData.jurisdiction && (
                      <p className="text-xs text-gray-500">
                        {taxData.jurisdiction}
                      </p>
                    )} */}

                    {/* Full event location address */}
                    {/* {eventLocation && (
                      <p className="text-xs text-gray-500">
                        Location: {eventLocation}
                      </p>
                    )} */}
                  </div>
                  <span className="font-semibold text-gray-900 ml-4">{formatCurrency(taxAmount)}</span>
                </div>
              </div>
            );
          }

          return null;
        })()}

        {/* Final Total - Premium white/grey design */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-900 text-lg">TOTAL</span>
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(finalTotal + (pricingSnapshot?.tax ?? calculatedTotals?.tax ?? 0))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemsBreakdown;