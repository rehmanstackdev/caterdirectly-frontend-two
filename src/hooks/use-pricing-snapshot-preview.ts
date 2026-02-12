import { useMemo } from 'react';
import { ServiceSelection } from '@/types/order';
import { CustomAdjustment } from '@/types/adjustments';
import { calculateInvoicePricing, InvoicePricingSnapshot } from '@/utils/invoice-calculations';

interface UsePricingSnapshotPreviewParams {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  formData: any;
  adminSettings?: any;
  customAdjustments?: CustomAdjustment[];
  distancesByService?: Record<string, number>;
}

/**
 * Hook that generates a pricing snapshot preview - the exact same snapshot
 * that will be saved when creating/copying a proposal.
 * 
 * This ensures Order Summary displays exactly what will be saved to the database,
 * establishing a true Single Source of Truth (SSOT).
 */
export const usePricingSnapshotPreview = ({
  selectedServices,
  selectedItems,
  formData,
  adminSettings,
  customAdjustments,
  distancesByService
}: UsePricingSnapshotPreviewParams): InvoicePricingSnapshot | null => {
  
  const snapshot = useMemo(() => {
    // Don't calculate if missing essential data
    if (!selectedServices || selectedServices.length === 0) {
      return null;
    }

    if (!formData || typeof formData !== 'object') {
      return null;
    }

    console.info('[PricingSnapshotPreview] Generating preview snapshot', {
      servicesCount: selectedServices.length,
      selectedItemsCount: Object.keys(selectedItems || {}).length,
      customAdjustmentsCount: customAdjustments?.length || 0,
      location: formData?.location,
      adminOverrides: formData?.adminOverrides || null
    });

    // Use the same calculation function that use-proposal-creation uses
    const pricingSnapshot = calculateInvoicePricing(
      selectedServices,
      selectedItems || {},
      formData,
      adminSettings,
      customAdjustments || formData?.customAdjustments || [],
      distancesByService
    );

    console.info('[PricingSnapshotPreview] Preview snapshot generated', {
      subtotal: pricingSnapshot.subtotal,
      serviceFee: pricingSnapshot.serviceFee,
      deliveryFee: pricingSnapshot.deliveryFee,
      adjustmentsTotal: pricingSnapshot.adjustmentsTotal,
      tax: pricingSnapshot.tax,
      total: pricingSnapshot.total,
      overridesUsed: formData?.adminOverrides || null
    });

    return pricingSnapshot;
  }, [selectedServices, selectedItems, formData, adminSettings, customAdjustments, distancesByService, JSON.stringify(formData?.adminOverrides || {})]);

  return snapshot;
};
