import { ServiceSelection } from "@/types/order";
import { calculateDeliveryFee, checkDeliveryMinimum } from "./delivery-calculations";
import { DeliveryOptions } from "@/types/service-types";
import { CustomAdjustment } from "@/types/adjustments";
import { getTaxRateByLocation } from "@/utils/tax-calculation";
import { calculateCateringPrice, extractCateringItems } from "./catering-price-calculation";

/**
 * Unified price calculation system for consistency across the entire application
 */

interface CalculationResult {
  subtotal: number;
  tax: number;
  taxData?: {
    rate: number;
    description: string;
    jurisdiction?: string;
    details?: any[];
    stripeCalculationId?: string;
  };
  serviceFee: number;
  deliveryFee: number;
  deliveryDetails?: {
    eligible: boolean;
    range: string;
    reason?: string;
    minimumWarnings?: Array<{ vendor: string; required: number; current: number }>;
  };
  // New fields for adjustments visibility
  adjustments?: CustomAdjustment[];
  adjustmentsTotal?: number;
  adjustmentsBreakdown?: Array<{
    id: string;
    label: string;
    amount: number;
    taxable: boolean;
    mode: 'surcharge' | 'discount';
    type: 'fixed' | 'percentage';
    value: number;
  }>;
  total: number;
  // Admin override flags
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
}

/**
 * Convert any price format to a consistent number
 */
export const normalizePrice = (price: string | number | undefined): number => {
  if (price === undefined || price === null) return 0;
  if (typeof price === 'number') return isNaN(price) ? 0 : Math.max(0, price);
  
  // Clean string price and convert to number
  const cleanedPrice = String(price).replace(/[^0-9.-]/g, '');
  const numPrice = parseFloat(cleanedPrice);
  return isNaN(numPrice) ? 0 : Math.max(0, numPrice);
};

/**
 * Calculate the total for a single service including quantity and duration
 */
export const calculateServiceTotal = (
  service: ServiceSelection,
  selectedItems: Record<string, number> = {},
  guestCount: number = 1
): number => {

  // Base service price
  const basePrice = normalizePrice(service.price || service.servicePrice);
  const quantity = Math.max(1, service.quantity || 1);

  // Determine service context
  const serviceId = service.id || service.serviceId;
  const details = service.service_details;
  const serviceType = service.serviceType || service.type || '';

  // Determine available selectable items for this service - handle legacy formats
  let items: any[] = [];
  if (details) {
    if (serviceType === 'catering') {
      items = details.menuItems || 
              details.catering?.menuItems || 
              details.menu?.items ||
              details.menu?.menu_items ||
              details.items ||
              details.menu_items ||
              details.menu || [];
      
      // Add combo items if they exist
      if (details.catering?.combos && Array.isArray(details.catering.combos)) {
        items = [...items, ...details.catering.combos];
      }
    } else if (serviceType === 'party-rental' || serviceType === 'party-rentals') {
      items = details.rentalItems || 
              details.rental?.items || 
              details.rental_items ||
              details.items || [];
    } else if (serviceType === 'staff') {
      items = details.staffServices || details.services || [];
    } else if (serviceType === 'venue' || serviceType === 'venues') {
      items = details.venueOptions || details.options || [];
    }
  }

  // Treat staff as itemized even if items array is empty,
  // so we don't show base/hourly pricing until a staff role/qty is selected
  const isStaff = serviceType === 'staff';

  // Check if any items have been selected for this service
  const hasSelectedItemsForThisService = (() => {
    if (!selectedItems || !serviceId) return false;
    for (const [itemKey, qty] of Object.entries(selectedItems)) {
      if (qty <= 0) continue;
      if (itemKey.endsWith('_duration')) continue;
      // Prefixed keys clearly belong to this service
      if (itemKey.startsWith(serviceId + '_')) return true;
      // Unprefixed keys: attempt to match against this service's items
      if (items.length > 0) {
        const match = items.find((it) => it?.id === itemKey || it?.name === itemKey || it?.title === itemKey);
        if (match) return true;
      }
    }
    return false;
  })();

  // For services with totalPrice already set (from API), use that directly
  if (service.totalPrice && typeof service.totalPrice === 'number' && service.totalPrice > 0) {
    console.debug('[Pricing] Using pre-calculated totalPrice:', {
      serviceId,
      serviceName: service.name || service.serviceName,
      totalPrice: service.totalPrice
    });
    return service.totalPrice;
  }

  // Use catering price calculation for catering services
  if (serviceType === 'catering' && details && Object.keys(selectedItems).length > 0) {
    const { baseItems, additionalChargeItems, comboCategoryItems } = extractCateringItems(
      selectedItems,
      details
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
      additionalCharge: item.additionalCharge
    }));

    const cateringCalculation = calculateCateringPrice(
      basePricePerPerson,
      additionalCharges,
      guestCount,
      comboCategoryItems
    );

    console.debug('[Pricing] Using catering price calculation:', {
      serviceId,
      serviceName: service.name || service.serviceName,
      guestCount,
      basePricePerPerson,
      finalTotal: cateringCalculation.finalTotal
    });

    return cateringCalculation.finalTotal;
  }

  // Include base price logic:
  // - Always include base service price for all services EXCEPT staff, rentals, and catering
  // - Catering services DO NOT include base price - only items are priced
  const isItemOnlyService = isStaff || 
                           serviceType === 'party-rental' || 
                           serviceType === 'party-rentals' ||
                           serviceType === 'catering';
  
  let serviceTotal = 0;
  if (!isItemOnlyService) {
    serviceTotal = basePrice * quantity;
    // Apply duration multiplier for time-based services (like staff)
    if (service.duration && service.duration > 1) {
      const duration = Math.max(1, service.duration);
      serviceTotal = serviceTotal * duration;
    }
    
    console.debug('[Pricing] Including base price:', {
      serviceId,
      serviceName: service.name || service.serviceName,
      serviceType,
      basePrice,
      quantity,
      serviceTotal,
      isItemOnlyService
    });
  }

  // Debug info for pricing decisions
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[Pricing] calculateServiceTotal decision', {
        serviceId,
        serviceName: service.name || service.serviceName,
        serviceType,
        basePrice,
        quantity,
        itemsCount: items.length,
        hasSelectedItemsForThisService,
        includeBase,
        initialServiceTotal: serviceTotal,
      });
    }
  } catch {}

  // Add selected menu items/add-ons
  if (serviceId && selectedItems && details) {
    // Calculate item totals - handle both prefixed and direct item IDs
    Object.entries(selectedItems).forEach(([itemId, itemQuantity]) => {
      // Skip duration entries here; we'll handle them when computing staff item totals
      if (itemId.endsWith('_duration') || itemQuantity <= 0) return;

      // Check if this is a combo category item (format: comboId_categoryId_itemId)
      if (itemId.includes('_') && itemId.split('_').length >= 3) {
        const parts = itemId.split('_');
        const comboId = parts[0];
        const categoryId = parts[1];
        const actualItemId = parts[2];
        
        // Find the combo and category to get the actual item details
        let categoryItem = null;
        
        // Look for the combo in available items
        const combo = items.find(item => 
          (item.id === comboId || item.itemId === comboId) && 
          (item.comboCategories || item.isCombo || item.comboCategoryItems)
        );
        
        if (combo) {
          // Check comboCategories first
          if (combo.comboCategories) {
            const category = combo.comboCategories.find((cat: any) => 
              cat.id === categoryId || cat.categoryId === categoryId
            );
            
            if (category && category.items) {
              categoryItem = category.items.find((item: any) => 
                item.id === actualItemId || item.itemId === actualItemId
              );
            }
          }
          
          // Also check comboCategoryItems (flat structure)
          if (!categoryItem && combo.comboCategoryItems) {
            categoryItem = combo.comboCategoryItems.find((item: any) => 
              (item.cateringId === actualItemId || item.id === actualItemId) &&
              (item.menuName === categoryId || item.categoryId === categoryId)
            );
          }
        }
        
        if (categoryItem) {
          const itemPrice = normalizePrice(categoryItem.price);
          const itemTotal = itemPrice * itemQuantity;
          serviceTotal += itemTotal;
          
          console.debug('[Pricing] Added combo category item:', {
            serviceId,
            itemId,
            itemPrice,
            itemQuantity,
            itemTotal
          });
        }
        return; // Skip further processing for combo category items
      }

      let foundItem: any | undefined;
      let actualItemId: string | undefined;

      // Try with service prefix first
      if (itemId.startsWith(serviceId + '_')) {
        actualItemId = itemId.replace(serviceId + '_', '');
        foundItem = items.find(item => 
          item.id === actualItemId || 
          item.name === actualItemId ||
          item.title === actualItemId
        );
      } else {
        // Try direct match (for catering services that don't use prefixes)
        actualItemId = itemId;
        foundItem = items.find(item => 
          item.id === itemId || 
          item.name === itemId ||
          item.title === itemId
        );
      }
      
      if (foundItem) {
        // Handle combo items with pricePerPerson field
        const price = foundItem.pricePerPerson || foundItem.price;
        const itemPrice = normalizePrice(price);

        // Enforce per-item minimum quantity when selected (>0)
        const declaredMinQty = typeof foundItem.minQuantity === 'number' ? foundItem.minQuantity : 1;
        const effectiveQty = itemQuantity > 0 ? Math.max(itemQuantity, declaredMinQty) : 0;

        if (serviceType === 'staff') {
          // Determine duration per staff item; fall back to service-level duration or minimum hours
          const detailsForMin = (details as any)?.staff || details;
          const serviceMinHours = normalizePrice((detailsForMin as any)?.minimumHours) || 1;
          const durationKeyDirect = `${actualItemId}_duration`;
          const durationKeyPrefixed = `${itemId}_duration`;
          const selectedDuration = (selectedItems as any)[durationKeyDirect] || (selectedItems as any)[durationKeyPrefixed] || service.duration || serviceMinHours;
          const effectiveDuration = effectiveQty > 0 ? Math.max(selectedDuration || serviceMinHours, serviceMinHours) : 0;

          const itemTotal = itemPrice * effectiveQty * effectiveDuration;
          
          console.debug('[Staff Calc Debug]', {
            serviceId,
            serviceName: service.name,
            itemId,
            actualItemId,
            itemPrice,
            effectiveQty,
            selectedDuration,
            effectiveDuration,
            serviceMinHours,
            itemTotal
          });
          
          serviceTotal += itemTotal;
        } else {
          const itemTotal = itemPrice * effectiveQty;
          serviceTotal += itemTotal;
          
          console.debug('[Pricing] Added regular item:', {
            serviceId,
            serviceName: service.name || service.serviceName,
            itemId,
            itemPrice,
            effectiveQty,
            itemTotal
          });
        }
      }
    });
  }
  
  // Staff fallback: if no defined staff items in details, use service's hourly rate with selected quantity/duration
  if (isStaff) {
    const staffItemCount = (selectedItems as any)?.[serviceId as string] || 0;
    if (staffItemCount > 0) {
      const detailsForMin = (details as any)?.staff || details;
      const serviceMinHours = normalizePrice((detailsForMin as any)?.minimumHours) || 1;
      const selectedDuration = (selectedItems as any)[`${serviceId}_duration`] || service.duration || serviceMinHours;
      const effectiveDuration = Math.max(selectedDuration || serviceMinHours, serviceMinHours);
      serviceTotal += basePrice * staffItemCount * effectiveDuration;
    }
  }

  // NEW: Add combo selections to service total
  if (service.comboSelectionsList && service.comboSelectionsList.length > 0) {
    const comboTotal = service.comboSelectionsList.reduce((sum, combo) => {
      console.debug('[Pricing] Adding combo to service total:', {
        serviceId,
        comboName: combo.comboName,
        comboPrice: combo.totalPrice
      });
      return sum + (combo.totalPrice || 0);
    }, 0);
    
    console.debug('[Pricing] Combo total for service:', {
      serviceId,
      comboCount: service.comboSelectionsList.length,
      comboTotal
    });
    
    serviceTotal += comboTotal;
  }


  
  // Legacy support for single combo (TEMPORARY - for backward compatibility)
  if (service.comboSelections && !service.comboSelectionsList) {
    console.warn('[Pricing] Using legacy comboSelections - migrate to comboSelectionsList');
    serviceTotal += service.comboSelections.totalPrice || 0;
  }

  console.debug('[Pricing] Final service total:', {
    serviceId,
    serviceName: service.name || service.serviceName,
    basePrice,
    quantity,
    hasSelectedItems: hasSelectedItemsForThisService,
    finalTotal: serviceTotal
  });
  
  return serviceTotal;
};

/**
 * Calculate order totals with consistent tax, delivery, and fee calculations
 */
export const calculateUnifiedOrderTotals = (
  services: ServiceSelection[],
  selectedItems: Record<string, number> = {},
  deliveryAddress?: string,
  adminSettings?: {
    serviceFeePercentage?: number;
    serviceFeeFixed?: number;
    serviceFeeType?: string;
  },
  actualDistanceMiles?: number,
  customAdjustments?: CustomAdjustment[],
  actualDistancesByService?: Record<string, number>,
  isTaxExempt?: boolean,
  isServiceFeeWaived?: boolean,
  guestCount: number = 1
): CalculationResult => {
  // Calculate subtotal from all services and keep per-service subtotals for delivery minimums
  let subtotal = 0;
  const serviceSubtotals: Record<string, number> = {};
  
  console.log('[UnifiedCalculations] Calculating totals for services:', services.length);
  
  services.forEach((service, index) => {
    const serviceId = service.id || service.serviceId || Math.random().toString(36).slice(2);
    
    // For services with totalPrice already calculated (from API), use that instead of recalculating
    let serviceTotal;
    if (service.totalPrice && typeof service.totalPrice === 'number' && service.totalPrice > 0) {
      serviceTotal = service.totalPrice;
      console.log(`[UnifiedCalculations] Using pre-calculated totalPrice for service ${index + 1}:`, {
        serviceName: service.name || service.serviceName,
        serviceId,
        totalPrice: service.totalPrice
      });
    } else {
      serviceTotal = calculateServiceTotal(service, selectedItems, guestCount);
      console.log(`[UnifiedCalculations] Calculated service total for service ${index + 1}:`, {
        serviceName: service.name || service.serviceName,
        serviceId,
        serviceType: service.serviceType || service.type,
        basePrice: service.price || service.servicePrice,
        quantity: service.quantity,
        guestCount: guestCount,
        calculatedTotal: serviceTotal
      });
    }
    
    serviceSubtotals[serviceId] = (serviceSubtotals[serviceId] || 0) + serviceTotal;
    subtotal += serviceTotal;
  });
  
  console.log('[UnifiedCalculations] Final subtotal calculation:', {
    subtotal,
    serviceSubtotals,
    servicesCount: services.length,
    services: services.map(s => ({
      id: s.id || s.serviceId,
      name: s.name || s.serviceName,
      type: s.serviceType || s.type,
      price: s.price || s.servicePrice,
      totalPrice: s.totalPrice,
      quantity: s.quantity
    }))
  });

  // Calculate service fee based on admin settings or default to 5%
  let serviceFee = subtotal * 0.05; // Default fallback
  
  if (adminSettings) {
    const feeType = adminSettings.serviceFeeType || 'percentage';
    const feePercentage = adminSettings.serviceFeePercentage || 5.0;
    const feeFixed = adminSettings.serviceFeeFixed || 0.00;

    if (feeType === 'percentage') {
      serviceFee = subtotal * (feePercentage / 100);
    } else if (feeType === 'fixed') {
      serviceFee = feeFixed;
    } else if (feeType === 'hybrid') {
      serviceFee = (subtotal * (feePercentage / 100)) + feeFixed;
    }
  }

  // Admin override: waive service fee
  if (isServiceFeeWaived) {
    serviceFee = 0;
  }

  // Custom Adjustments
  const adjustments = (customAdjustments || []).filter(a => a && !isNaN(Number(a.value)));
  let taxableAdjustmentsAmount = 0;
  let nonTaxableAdjustmentsAmount = 0;
  const adjustmentsBreakdown: Array<{
    id: string;
    label: string;
    amount: number;
    taxable: boolean;
    mode: 'surcharge' | 'discount';
    type: 'fixed' | 'percentage';
    value: number;
  }> = [];

  console.log('[UnifiedCalculations] Processing custom adjustments:', {
    adjustmentsCount: adjustments.length,
    adjustments: adjustments.map(a => ({
      label: a.label,
      type: a.type,
      mode: a.mode,
      value: a.value,
      taxable: a.taxable
    }))
  });

  for (const adj of adjustments) {
    const isPercentage = adj.type === 'percentage';
    const base = subtotal; // percentage is applied on subtotal only (service costs)
    let amount = isPercentage ? base * (Number(adj.value) / 100) : Number(adj.value);
    if (adj.mode === 'discount') amount = -amount;

    console.log('[UnifiedCalculations] Adjustment calculation:', {
      label: adj.label,
      isPercentage,
      base,
      value: adj.value,
      mode: adj.mode,
      calculatedAmount: amount
    });

    if (adj.taxable !== false) {
      taxableAdjustmentsAmount += amount;
    } else {
      nonTaxableAdjustmentsAmount += amount;
    }

    adjustmentsBreakdown.push({
      id: adj.id,
      label: adj.label,
      amount,
      taxable: adj.taxable !== false,
      mode: adj.mode,
      type: adj.type,
      value: Number(adj.value),
    });
  }
  const adjustmentsTotal = taxableAdjustmentsAmount + nonTaxableAdjustmentsAmount;
  
  console.log('[UnifiedCalculations] Adjustments totals:', {
    taxableAdjustmentsAmount,
    nonTaxableAdjustmentsAmount,
    adjustmentsTotal,
    adjustmentsBreakdown
  });

  // Calculate delivery fee across all services that offer delivery
  let deliveryFee = 0;
  let deliveryDetails = {
    eligible: false,
    range: 'N/A',
    reason: 'No delivery services selected',
    minimumWarnings: [] as Array<{ vendor: string; required: number; current: number }>
  } as { 
    eligible: boolean; 
    range: string; 
    reason?: string;
    minimumWarnings?: Array<{ vendor: string; required: number; current: number }>;
  };

  if (deliveryAddress && services.length > 0) {
    let anyDeliveryFound = false;
    let overallDistanceEligible = true;
    let notedRange: string | undefined;
    let notedReason: string | undefined;
    const minimumWarnings: Array<{ vendor: string; required: number; current: number }> = [];

    for (const service of services) {
      const serviceId = service.id || service.serviceId || '';
      // Handle legacy delivery options formats
      const serviceDeliveryOptions = service.service_details?.deliveryOptions || 
                                     service.service_details?.catering?.deliveryOptions ||
                                     service.service_details?.delivery_options;
      if (!serviceDeliveryOptions?.delivery) continue;
      anyDeliveryFound = true;

      const svcSubtotal = serviceSubtotals[serviceId] ?? 0;
      const distance = (actualDistancesByService && serviceId) ? actualDistancesByService[serviceId] : actualDistanceMiles;

      const deliveryCalc = calculateDeliveryFee(deliveryAddress, serviceDeliveryOptions, distance);
      const minimumCheck = checkDeliveryMinimum(svcSubtotal, serviceDeliveryOptions);

      notedRange = notedRange || deliveryCalc.range;

      // Always add delivery fee if distance/location allows it
      if (deliveryCalc.eligible) {
        deliveryFee += deliveryCalc.fee;
      } else {
        overallDistanceEligible = false;
        notedReason = deliveryCalc.reason || notedReason;
      }

      // Track minimum order warnings separately
      if (deliveryCalc.eligible && !minimumCheck.eligible && minimumCheck.minimumRequired) {
        const vendorName = service.vendorName || service.name || 'Unknown Vendor';
        minimumWarnings.push({
          vendor: vendorName,
          required: minimumCheck.minimumRequired,
          current: svcSubtotal
        });
      }
    }

    if (anyDeliveryFound) {
      deliveryDetails = {
        eligible: overallDistanceEligible,
        range: notedRange || 'varies',
        reason: overallDistanceEligible ? undefined : notedReason || 'Delivery not available to this location',
        minimumWarnings
      };
    }
  }

  // Calculate tax based on location if not exempt
  let tax = 0;
  let taxData = {
    rate: 0,
    description: 'No tax',
    jurisdiction: 'None'
  };

  if (!isTaxExempt && deliveryAddress) {
    const taxInfo = getTaxRateByLocation(deliveryAddress);
    
    if (taxInfo && taxInfo.rate > 0) {
      const taxableBase = subtotal + serviceFee + deliveryFee + taxableAdjustmentsAmount;
      tax = taxableBase * taxInfo.rate;
      taxData = {
        rate: taxInfo.rate,
        description: taxInfo.description || `Sales Tax (${(taxInfo.rate * 100).toFixed(3)}%)`,
        jurisdiction: taxInfo.jurisdiction || 'Local'
      };
      
      console.log('[UnifiedCalculations] Local tax calculated:', {
        location: deliveryAddress,
        rate: (taxInfo.rate * 100).toFixed(3) + '%',
        taxableBase: taxableBase.toFixed(2),
        taxAmount: tax.toFixed(2)
      });
    } else {
      console.warn('[UnifiedCalculations] No tax rate found for location:', deliveryAddress);
    }
  } else if (isTaxExempt) {
    taxData = {
      rate: 0,
      description: 'Tax Exempt - No tax applicable',
      jurisdiction: 'Tax Exempt'
    };
    console.log('[UnifiedCalculations] Tax exempt order');
  }

  // Calculate total WITH tax (tax is now calculated locally)
  const total = subtotal + serviceFee + deliveryFee + taxableAdjustmentsAmount + nonTaxableAdjustmentsAmount + tax;
  
  console.log('[UnifiedCalculations] Final total breakdown:', {
    subtotal: subtotal.toFixed(2),
    serviceFee: serviceFee.toFixed(2),
    deliveryFee: deliveryFee.toFixed(2),
    taxableAdjustments: taxableAdjustmentsAmount.toFixed(2),
    nonTaxableAdjustments: nonTaxableAdjustmentsAmount.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2)
  });

  return {
    subtotal,
    tax,
    taxData,
    serviceFee,
    deliveryFee,
    deliveryDetails,
    adjustments,
    adjustmentsTotal,
    adjustmentsBreakdown,
    total,
    // Include override flags for UI display
    isTaxExempt,
    isServiceFeeWaived
  };
};

/**
 * Legacy compatibility function for useOrderCalculations
 */
export const calculateLegacyOrderTotals = (
  orderItems: Array<{ price: number; quantity: number; duration?: number; name: string }>,
  guestOrders: Array<{ items: Array<{ price: number; quantity: number; duration?: number; name: string }> }> = []
) => {
  const calculateSubtotal = (items: typeof orderItems) => {
    return items.reduce((total, item) => {
      let itemTotal = item.price * item.quantity;
      
      // Apply duration multiplier for time-based services
      if (item.duration && item.duration > 1) {
        itemTotal = itemTotal * item.duration;
      }
      
      return total + itemTotal;
    }, 0);
  };

  const hostOrderSubtotal = calculateSubtotal(orderItems);
  const guestsTotal = guestOrders.reduce((total, guest) => {
    return total + calculateSubtotal(guest.items);
  }, 0);
  
  const subtotal = hostOrderSubtotal + guestsTotal;
  // Tax should be calculated by Stripe Tax API - set to 0 here
  const tax = 0;
  const deliveryFee = 2.99;
  const total = subtotal + tax + deliveryFee;

  return {
    hostOrderSubtotal,
    guestsTotal,
    subtotal,
    tax,
    deliveryFee,
    total
  };
};

