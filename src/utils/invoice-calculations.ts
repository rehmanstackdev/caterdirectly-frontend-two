import { calculateUnifiedOrderTotals } from './unified-calculations';
import { ServiceSelection } from '@/types/order';
import { CustomAdjustment } from '@/types/adjustments';

export interface InvoicePricingSnapshot {
  subtotal: number;
  serviceFee: number;
  deliveryFee: number;
  adjustmentsTotal: number;
  adjustmentsBreakdown: Array<{
    id: string;
    label: string;
    amount: number;
    taxable: boolean;
    mode: 'surcharge' | 'discount';
    type: 'fixed' | 'percentage';
    value: number;
  }>;
  tax: number;
  taxRate: number;
  taxLocation: string;
  total: number;
  overrides: {
    isTaxExempt: boolean;
    isServiceFeeWaived: boolean;
  };
  calculatedAt: string; // ISO timestamp
}

/**
 * SINGLE SOURCE OF TRUTH for invoice pricing calculations
 * Used during invoice creation and display to ensure consistency
 * 
 * This function uses the unified calculation system to compute all pricing
 * components (subtotal, fees, adjustments, tax, total) and returns a complete
 * snapshot that can be stored with the invoice for future reference.
 * 
 * @param services - Array of selected services
 * @param selectedItems - Record of itemId -> quantity for selected items
 * @param formData - Form data containing location, overrides, and other booking details
 * @param adminSettings - Admin settings for service fees (optional)
 * @param customAdjustments - Custom adjustments like discounts/surcharges (optional)
 * @param distancesByService - Distance calculations for delivery fees (optional)
 * @returns Complete pricing snapshot with all components
 */
export const calculateInvoicePricing = (
  services: ServiceSelection[],
  selectedItems: Record<string, number>,
  formData: any,
  adminSettings?: any,
  customAdjustments?: CustomAdjustment[],
  distancesByService?: Record<string, number>
): InvoicePricingSnapshot => {
  
  // Extract admin overrides with robust fallback
  const isTaxExempt = Boolean(
    formData?.adminOverrides?.isTaxExempt ?? 
    formData?.isTaxExempt ?? 
    false
  );
  
  const isServiceFeeWaived = Boolean(
    formData?.adminOverrides?.isServiceFeeWaived ?? 
    formData?.isServiceFeeWaived ?? 
    false
  );

  console.info('[InvoiceCalculations] Calculating pricing snapshot', {
    servicesCount: services.length,
    selectedItemsCount: Object.keys(selectedItems).length,
    location: formData?.location,
    customAdjustmentsCount: customAdjustments?.length || 0,
    isTaxExempt,
    isServiceFeeWaived
  });

  // Use unified calculation system - SINGLE SOURCE OF TRUTH
  const orderTotals = calculateUnifiedOrderTotals(
    services,
    selectedItems,
    formData?.location,
    adminSettings,
    undefined,
    customAdjustments || formData?.customAdjustments || [],
    distancesByService,
    isTaxExempt,
    isServiceFeeWaived
  );

  // Build complete pricing snapshot
  const snapshot: InvoicePricingSnapshot = {
    subtotal: orderTotals.subtotal,
    serviceFee: orderTotals.serviceFee,
    deliveryFee: orderTotals.deliveryFee,
    adjustmentsTotal: orderTotals.adjustmentsTotal || 0,
    adjustmentsBreakdown: (orderTotals.adjustmentsBreakdown || []).map(adj => ({
      id: adj.id,
      label: adj.label,
      amount: adj.amount,
      taxable: adj.taxable !== false,
      mode: adj.mode,
      type: adj.type,
      value: adj.value
    })),
    tax: orderTotals.tax,
    taxRate: orderTotals.taxData?.rate || 0,
    taxLocation: formData?.location || '',
    total: orderTotals.total,
    overrides: {
      isTaxExempt,
      isServiceFeeWaived
    },
    calculatedAt: new Date().toISOString()
  };

  console.info('[InvoiceCalculations] Pricing snapshot created', {
    subtotal: snapshot.subtotal,
    serviceFee: snapshot.serviceFee,
    deliveryFee: snapshot.deliveryFee,
    adjustmentsTotal: snapshot.adjustmentsTotal,
    tax: snapshot.tax,
    total: snapshot.total,
    calculatedAt: snapshot.calculatedAt
  });

  return snapshot;
};
