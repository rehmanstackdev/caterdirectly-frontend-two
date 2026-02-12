import { useState, useEffect } from 'react';
import deliveryService, { DeliveryFeeRequest, DeliveryFeeResponse } from '@/services/api/delivery.service';
import { useDeliveryCalculations } from './use-delivery-calculations';
import { DeliveryOptions } from '@/types/service-types';

/**
 * Hook for calculating delivery fees using API with fallback to local calculations
 */
export const useApiDeliveryCalculations = (
  deliveryAddress: string,
  serviceDeliveryOptions: DeliveryOptions,
  orderSubtotal: number,
  actualDistanceMiles?: number,
  serviceId?: string,
  vendorId?: string
) => {
  const [apiResult, setApiResult] = useState<DeliveryFeeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback to local calculations
  const localResult = useDeliveryCalculations(
    deliveryAddress,
    serviceDeliveryOptions,
    orderSubtotal,
    actualDistanceMiles
  );

  useEffect(() => {
    const calculateApiDeliveryFee = async () => {
      if (!deliveryAddress || !serviceDeliveryOptions?.delivery) {
        setApiResult(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const request: DeliveryFeeRequest = {
          deliveryAddress,
          orderSubtotal,
          serviceId,
          vendorId,
          distanceMiles: actualDistanceMiles
        };

        const response = await deliveryService.calculateDeliveryFee(request);
        setApiResult(response);
      } catch (err) {
        console.warn('[useApiDeliveryCalculations] API call failed, using local calculations:', err);
        setError(err instanceof Error ? err.message : 'Failed to calculate delivery fee');
        setApiResult(null);
      } finally {
        setIsLoading(false);
      }
    };

    calculateApiDeliveryFee();
  }, [deliveryAddress, orderSubtotal, serviceId, vendorId, actualDistanceMiles, serviceDeliveryOptions?.delivery]);

  // Return API result if available, otherwise fallback to local calculations
  const result = apiResult || {
    fee: localResult.deliveryFee,
    eligible: localResult.isDeliveryEligible,
    range: localResult.deliveryRange,
    reason: localResult.deliveryReason,
    minimumRequired: localResult.minimumRequired,
    distanceEligible: localResult.distanceEligible,
    minimumEligible: localResult.minimumEligible
  };

  return {
    deliveryFee: result.fee,
    isDeliveryEligible: result.eligible,
    deliveryRange: result.range || localResult.deliveryRange,
    deliveryReason: result.reason || localResult.deliveryReason,
    minimumRequired: result.minimumRequired,
    distanceEligible: result.distanceEligible,
    minimumEligible: result.minimumEligible,
    deliveryOptionsDisplay: localResult.deliveryOptionsDisplay,
    isLoadingApi: isLoading,
    apiError: error,
    usingApiResult: !!apiResult
  };
};