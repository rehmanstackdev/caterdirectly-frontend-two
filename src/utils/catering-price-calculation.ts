/**
 * Catering Service Price Calculation
 * 
 * Formula: Total = ((base_price × guest_count) + (additional_charges × guest_count))
 * 
 * Where:
 * - base_price: Total of all selected menu items, combo items, and combo category items (no additional charges)
 * - additional_charges: Sum of all items with additional charges (premium items, upcharges)
 * - guest_count: Number of guests
 * 
 * Combo Category Items:
 * - Base price: quantity × item_price (added to base total)
 * - Premium items: additional_charge × guest_count (added separately)
 */

export interface CateringItemBreakdown {
  name: string;
  quantity: number;
  unitPrice: number;
  additionalCharge?: number;
  totalPrice: number;
  isAdditionalCharge: boolean;
  isMenuItem?: boolean;
}

export interface CateringPriceCalculation {
  basePrice: number;
  basePricePerPerson: number;
  guestCount: number;
  basePriceTotal: number;
  
  additionalCharges: CateringItemBreakdown[];
  additionalChargesPerPerson: number;
  additionalChargesTotal: number;
  
  finalTotal: number;
  
  breakdown: {
    baseItems: CateringItemBreakdown[];
    additionalChargeItems: CateringItemBreakdown[];
  };
}

/**
 * Calculate catering service total price
 * 
 * @param basePrice - Base price per person (sum of all menu items without additional charges)
 * @param additionalCharges - Array of items with additional charges
 * @param guestCount - Number of guests
 * @param comboCategoryItems - Array of combo category items with their prices and additional charges
 * @returns Calculated pricing breakdown
 */
export const calculateCateringPrice = (
  basePrice: number,
  additionalCharges: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    additionalCharge: number;
    isMenuItem?: boolean;
  }> = [],
  guestCount: number = 1,
  comboCategoryItems: Array<{
    name: string;
    quantity: number;
    price: number;
    additionalCharge?: number;
  }> = []
): CateringPriceCalculation => {
  // Validate inputs
  const validBasePrice = Math.max(0, parseFloat(String(basePrice)) || 0);
  const validGuestCount = Math.max(1, parseInt(String(guestCount)) || 1);

  // Calculate base price total: base_price only (no guest count multiplication)
  // Note: Combo category items are NOT added here - they are displayed separately
  // The base price is only the combo's base price, not multiplied by guest count
  const basePriceTotal = validBasePrice;

  // Process additional charges
  const additionalChargeItems: CateringItemBreakdown[] = [];
  let totalAdditionalCharges = 0;

  additionalCharges.forEach(item => {
    const quantity = Math.max(0, parseInt(String(item.quantity)) || 0);
    const unitPrice = Math.max(0, parseFloat(String(item.unitPrice)) || 0);
    const additionalCharge = Math.max(0, parseFloat(String(item.additionalCharge)) || 0);

    // Additional charge per item: (unit_price + additional_charge) × quantity (no guest count)
    const itemTotal = (unitPrice + additionalCharge) * quantity;

    additionalChargeItems.push({
      name: item.name,
      quantity,
      unitPrice,
      additionalCharge,
      totalPrice: itemTotal,
      isAdditionalCharge: true,
      isMenuItem: item.isMenuItem
    });

    totalAdditionalCharges += itemTotal;
  });

  // Track simple items total (combo category items without premium charge)
  let simpleItemsTotal = 0;

  // Process combo category items
  comboCategoryItems.forEach(item => {
    const quantity = Math.max(0, parseInt(String(item.quantity)) || 0);
    const price = Math.max(0, parseFloat(String(item.price)) || 0);
    const additionalCharge = Math.max(0, parseFloat(String(item.additionalCharge)) || 0);

    // Simple items: items without premium charge - add their price × quantity (no guest count)
    if (additionalCharge === 0 && price > 0) {
      simpleItemsTotal += price * quantity;
    }

    // Premium items: (price + additionalCharge) × quantity
    // The price shown in green in the UI already includes the base price
    // The additionalCharge is the upcharge, so total = (price + additionalCharge) × quantity
    if (additionalCharge > 0) {
      // Total per item = base price + upcharge
      const itemTotal = (price + additionalCharge) * quantity;

      additionalChargeItems.push({
        name: item.name,
        quantity: quantity,
        unitPrice: price,
        additionalCharge,
        totalPrice: itemTotal,
        isAdditionalCharge: true
      });

      totalAdditionalCharges += itemTotal;
    }
  });

  // Calculate per-person additional charges
  const additionalChargesPerPerson = validGuestCount > 0
    ? totalAdditionalCharges / validGuestCount
    : 0;

  // Final total: base_price + simple_items_total + additional_charges (no guest count multiplication)
  // Where simple_items_total = sum of (combo category items without premium charge × quantity)
  const finalTotal = basePriceTotal + simpleItemsTotal + totalAdditionalCharges;
  
  return {
    basePrice: validBasePrice,
    basePricePerPerson: validBasePrice,
    guestCount: validGuestCount,
    basePriceTotal,
    
    additionalCharges: additionalChargeItems,
    additionalChargesPerPerson,
    additionalChargesTotal: totalAdditionalCharges,
    
    finalTotal,
    
    breakdown: {
      baseItems: [{
        name: 'Base Menu Items',
        quantity: validGuestCount,
        unitPrice: validBasePrice,
        totalPrice: basePriceTotal,
        isAdditionalCharge: false
      }],
      additionalChargeItems
    }
  };
};

/**
 * Format catering calculation for display
 */
export const formatCateringCalculation = (
  calculation: CateringPriceCalculation
): string => {
  const lines: string[] = [];
  
  lines.push(`Base Price: $${calculation.basePrice.toFixed(2)} × ${calculation.guestCount} guests = $${calculation.basePriceTotal.toFixed(2)}`);
  
  if (calculation.additionalCharges.length > 0) {
    lines.push('');
    lines.push('Additional Charges:');
    calculation.additionalCharges.forEach(item => {
      lines.push(`  • ${item.name} (+$${item.additionalCharge.toFixed(2)}) × ${item.quantity} × ${calculation.guestCount} guests = $${item.totalPrice.toFixed(2)}`);
    });
  }
  
  lines.push('');
  lines.push(`TOTAL: $${calculation.finalTotal.toFixed(2)}`);
  
  return lines.join('\n');
};

/**
 * Extract catering items from service selections
 * Separates base items (combos only), additional charge items, and combo category items
 * Individual menu items are treated as additional charges (not included in base price)
 */
export const extractCateringItems = (
  selectedItems: Record<string, number>,
  serviceDetails: any
): {
  baseItems: Array<{ id: string; name: string; price: number; quantity: number; isCombo: boolean }>;
  additionalChargeItems: Array<{ id: string; name: string; price: number; additionalCharge: number; quantity: number; isMenuItem?: boolean }>;
  comboCategoryItems: Array<{ name: string; quantity: number; price: number; additionalCharge?: number }>;
} => {
  const baseItems: Array<{ id: string; name: string; price: number; quantity: number; isCombo: boolean }> = [];
  const additionalChargeItems: Array<{ id: string; name: string; price: number; additionalCharge: number; quantity: number }> = [];
  const comboCategoryItems: Array<{ name: string; quantity: number; price: number; additionalCharge?: number }> = [];

  const menuItems = serviceDetails?.menuItems || serviceDetails?.catering?.menuItems || [];
  const combos = serviceDetails?.catering?.combos || [];
  const allItems = [...menuItems, ...combos];

  Object.entries(selectedItems).forEach(([itemId, quantity]) => {
    if (!quantity || quantity <= 0) return;

    // Check if this is a combo category item (format: comboId_categoryId_itemId)
    if (itemId.includes('_') && itemId.split('_').length >= 3) {
      const parts = itemId.split('_');
      const comboId = parts[0];
      const categoryId = parts[1];
      const actualItemId = parts[2];

      const combo = allItems.find((it: any) =>
        (it.id === comboId || it.itemId === comboId) && it.comboCategories
      );

      if (combo && combo.comboCategories) {
        const category = combo.comboCategories.find((cat: any) =>
          cat.id === categoryId || cat.categoryId === categoryId
        );

        if (category && category.items) {
          const categoryItem = category.items.find((item: any) =>
            item.id === actualItemId || item.itemId === actualItemId
          );

          if (categoryItem) {
            const price = parseFloat(String(categoryItem.price || 0)) || 0;
            const additionalCharge = parseFloat(String(categoryItem.additionalCharge || 0)) || 0;

            comboCategoryItems.push({
              name: categoryItem.name || categoryItem.itemName || actualItemId,
              quantity: quantity as number,
              price,
              additionalCharge: additionalCharge > 0 ? additionalCharge : undefined
            });
          }
        }
      }
      return;
    }

    const item = allItems.find(
      (it: any) => it.id === itemId || it.itemId === itemId
    );

    if (!item) return;

    // Check if this is a combo item
    const isCombo = item.isCombo || item.comboCategories || item.pricePerPerson !== undefined;
    const price = parseFloat(String(item.price || item.pricePerPerson || 0)) || 0;
    const additionalCharge = parseFloat(String(item.additionalCharge || 0)) || 0;

    if (isCombo) {
      // Combos go to base items (even if they have additional charges)
      baseItems.push({
        id: itemId,
        name: item.name || item.itemName || itemId,
        price,
        quantity: quantity as number,
        isCombo: true
      });
    } else {
      // Regular menu items are treated as additional charges
      // If they have an explicit additional charge, use it; otherwise use the full price as additional charge
      additionalChargeItems.push({
        id: itemId,
        name: item.name || item.itemName || itemId,
        price: 0, // Individual menu items don't contribute to base price
        additionalCharge: additionalCharge > 0 ? additionalCharge : price,
        quantity: quantity as number,
        isMenuItem: true
      });
    }
  });

  return { baseItems, additionalChargeItems, comboCategoryItems };
};
