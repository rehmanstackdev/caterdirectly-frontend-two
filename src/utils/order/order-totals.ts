
import { ServiceSelection } from "@/types/order";
import { calculateUnifiedOrderTotals } from "../unified-calculations";
import { CustomAdjustment } from "@/types/adjustments";

export interface OrderTotals {
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
  total: number;
  // Expose adjustments for consumers that want to render them
  adjustments?: CustomAdjustment[];
  adjustmentsTotal?: number;
}

export const calculateOrderTotals = (
  services: ServiceSelection[], 
  selectedItems: Record<string, number> = {},
  location?: string,
  adminSettings?: { serviceFeePercentage?: number; serviceFeeFixed?: number; serviceFeeType?: string },
  customAdjustments?: CustomAdjustment[]
): OrderTotals => {
  // Use the unified calculation system for consistency
  return calculateUnifiedOrderTotals(services, selectedItems, location, adminSettings, undefined, customAdjustments);
};
