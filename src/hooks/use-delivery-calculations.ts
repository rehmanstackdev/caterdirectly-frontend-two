import { useMemo } from 'react';
import { DeliveryOptions } from '@/types/service-types';
import { calculateDeliveryFee, checkDeliveryMinimum, getDeliveryOptionsDisplay } from '@/utils/delivery-calculations';

/**
 * Hook for calculating delivery fees and checking delivery eligibility
 */
export const useDeliveryCalculations = (
  deliveryAddress: string,
  serviceDeliveryOptions: DeliveryOptions,
  orderSubtotal: number,
  actualDistanceMiles?: number
) => {
  const deliveryCalculation = useMemo(() => {
    console.log(`[useDeliveryCalculations] Calculating delivery for:`, {
      deliveryAddress,
      serviceDeliveryOptions,
      orderSubtotal,
      actualDistanceMiles
    });
    
    if (!deliveryAddress || !serviceDeliveryOptions) {
      const result = {
        fee: 0,
        eligible: false,
        range: 'N/A',
        reason: 'No delivery information provided',
        minimumRequired: undefined,
        distanceEligible: false,
        minimumEligible: false
      };
      console.log(`[useDeliveryCalculations] Missing required data:`, result);
      return result;
    }

    const feeCalc = calculateDeliveryFee(deliveryAddress, serviceDeliveryOptions, actualDistanceMiles);
    const minimumCheck = checkDeliveryMinimum(orderSubtotal, serviceDeliveryOptions);

    const result = {
      fee: feeCalc.eligible ? feeCalc.fee : 0, // Always show fee if delivery is geographically available
      eligible: feeCalc.eligible && minimumCheck.eligible, // Overall eligibility considers both distance and minimum
      range: feeCalc.range,
      reason: feeCalc.eligible ? minimumCheck.reason : feeCalc.reason, // Show distance reason first, then minimum
      minimumRequired: minimumCheck.minimumRequired,
      distanceEligible: feeCalc.eligible,
      minimumEligible: minimumCheck.eligible
    };
    
    console.log(`[useDeliveryCalculations] Final calculation result:`, {
      ...result,
      feeCalculation: feeCalc,
      minimumCheck: minimumCheck
    });
    
    return result;
  }, [deliveryAddress, serviceDeliveryOptions, orderSubtotal, actualDistanceMiles]);

  const deliveryOptionsDisplay = useMemo(() => {
    const display = getDeliveryOptionsDisplay(serviceDeliveryOptions);
    console.log(`[useDeliveryCalculations] Display options:`, display);
    return display;
  }, [serviceDeliveryOptions]);

  return {
    deliveryFee: deliveryCalculation.fee,
    isDeliveryEligible: deliveryCalculation.eligible,
    deliveryRange: deliveryCalculation.range,
    deliveryReason: deliveryCalculation.reason,
    minimumRequired: deliveryCalculation.minimumRequired,
    distanceEligible: deliveryCalculation.distanceEligible,
    minimumEligible: deliveryCalculation.minimumEligible,
    deliveryOptionsDisplay
  };
};