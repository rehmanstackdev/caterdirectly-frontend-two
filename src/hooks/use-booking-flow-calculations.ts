import { useState, useMemo } from 'react';
import { ServiceSelection } from '@/types/order';
import { calculateUnifiedOrderTotals } from '@/utils/unified-calculations';

interface UseBookingFlowCalculationsProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  location?: string;
  adminSettings?: {
    serviceFeePercentage?: number;
    serviceFeeFixed?: number;
    serviceFeeType?: string;
  };
  isTaxExempt?: boolean;
  isServiceFeeWaived?: boolean;
  customAdjustments?: any[];
}

export interface BookingFlowCalculations {
  subtotal: number;
  serviceFee: number;
  tax: number;
  taxData?: {
    rate: number;
    description: string;
    jurisdiction?: string;
    details?: any[];
    stripeCalculationId?: string;
  };
  total: number;
  isCalculating: boolean;
  hasError: boolean;
  errorMessage?: string;
}

export function useBookingFlowCalculations({
  selectedServices,
  selectedItems,
  location,
  adminSettings,
  isTaxExempt = false,
  isServiceFeeWaived = false,
  customAdjustments = []
}: UseBookingFlowCalculationsProps): BookingFlowCalculations {
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  // Memoized calculations for performance
  const calculations = useMemo(() => {
    setIsCalculating(true);
    setHasError(false);
    setErrorMessage(undefined);

    try {
      const result = calculateUnifiedOrderTotals(
        selectedServices,
        selectedItems,
        location,
        adminSettings,
        undefined, // actualDistanceMiles
        customAdjustments,
        undefined, // actualDistancesByService  
        isTaxExempt,
        isServiceFeeWaived
      );

      setIsCalculating(false);
      return result;
    } catch (error) {
      console.error('Calculation error:', error);
      setHasError(true);
      setErrorMessage(error instanceof Error ? error.message : 'Calculation failed');
      setIsCalculating(false);
      
      // Return safe fallback values
      return {
        subtotal: 0,
        serviceFee: 0,
        tax: 0,
        total: 0
      };
    }
  }, [selectedServices, selectedItems, location, adminSettings, isTaxExempt, isServiceFeeWaived, customAdjustments]);

  return {
    ...calculations,
    isCalculating,
    hasError,
    errorMessage
  };
}