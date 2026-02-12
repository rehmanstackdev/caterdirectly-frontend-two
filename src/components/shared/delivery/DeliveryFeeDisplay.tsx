import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, MapPin, DollarSign, AlertCircle, Loader2 } from 'lucide-react';
import { useDeliveryCalculations } from '@/hooks/use-delivery-calculations';
import { useApiDeliveryCalculations } from '@/hooks/use-api-delivery-calculations';
import { DeliveryOptions } from '@/types/service-types';
import { useAddressDistance } from '@/hooks/use-address-distance';

interface DeliveryFeeDisplayProps {
  deliveryAddress: string;
  serviceDeliveryOptions: DeliveryOptions;
  orderSubtotal: number;
  vendorOriginAddress?: string;
  className?: string;
  showDetails?: boolean;
  serviceId?: string;
  vendorId?: string;
}

export const DeliveryFeeDisplay = ({
  deliveryAddress,
  serviceDeliveryOptions,
  orderSubtotal,
  vendorOriginAddress,
  className = '',
  showDetails = true,
  serviceId,
  vendorId
}: DeliveryFeeDisplayProps) => {
  const distanceResult = useAddressDistance(vendorOriginAddress, deliveryAddress);
  
  // Use API-based delivery calculations with fallback to local calculations
  const apiResult = useApiDeliveryCalculations(
    deliveryAddress,
    serviceDeliveryOptions,
    orderSubtotal,
    distanceResult.distanceMiles,
    serviceId,
    vendorId
  );
  
  // Fallback to local calculations for display options
  const localResult = useDeliveryCalculations(deliveryAddress, serviceDeliveryOptions, orderSubtotal, distanceResult.distanceMiles || undefined);
  
  const {
    deliveryFee,
    isDeliveryEligible,
    deliveryRange,
    deliveryReason,
    minimumRequired
  } = apiResult.usingApiResult ? apiResult : {
    deliveryFee: localResult.deliveryFee,
    isDeliveryEligible: localResult.isDeliveryEligible,
    deliveryRange: localResult.deliveryRange,
    deliveryReason: localResult.deliveryReason,
    minimumRequired: localResult.minimumRequired
  };
  
  const deliveryOptionsDisplay = localResult.deliveryOptionsDisplay;

  // Debug logging for delivery calculations
  console.log('[DeliveryFeeDisplay] Calculation inputs:', {
    deliveryAddress,
    vendorOriginAddress,
    orderSubtotal,
    distanceMiles: distanceResult.distanceMiles,
    serviceDeliveryOptions,
    deliveryFee,
    isDeliveryEligible,
    deliveryRange,
    deliveryReason
  });

  if (!serviceDeliveryOptions?.delivery) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <Truck className="h-4 w-4" />
            <span className="text-sm">Delivery not available - Pickup only</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-gray-200 ${className}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Delivery Fee</span>
          </div>
          <div className="flex items-center space-x-2">
            {apiResult.isLoadingApi && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            )}
            {isDeliveryEligible ? (
              <>
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-green-600">
                  {deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`}
                </span>
                {apiResult.usingApiResult && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                    API
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-200">
                Not Available
              </Badge>
            )}
          </div>
        </div>

        {showDetails && (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>Range: {deliveryRange}</span>
            </div>

            {!isDeliveryEligible && deliveryReason && (
              <div className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{deliveryReason}</span>
              </div>
            )}

            {minimumRequired && orderSubtotal < minimumRequired && (
              <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
                <strong>Minimum required:</strong> ${minimumRequired.toFixed(2)} 
                <span className="block">Current order: ${orderSubtotal.toFixed(2)}</span>
              </div>
            )}

            {deliveryOptionsDisplay.length > 0 && (
              <div className="text-xs text-gray-500 border-t pt-2 mt-2">
                <strong>Available options:</strong>
                <ul className="list-disc list-inside mt-1">
                  {deliveryOptionsDisplay.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};