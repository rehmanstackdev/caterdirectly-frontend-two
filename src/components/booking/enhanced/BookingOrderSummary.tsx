import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ServiceSelection } from '@/types/order';
import { calculateUnifiedOrderTotals } from '@/utils/unified-calculations';
import { DeliveryFeeDisplay } from '@/components/shared/delivery/DeliveryFeeDisplay';
import { formatCurrency } from '@/lib/utils';
import { useAddressDistance } from '@/hooks/use-address-distance';
import { CustomAdjustment } from '@/types/adjustments';

interface BookingOrderSummaryProps {
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  deliveryAddress: string;
  className?: string;
  customAdjustments?: CustomAdjustment[];
}

export const BookingOrderSummary = ({
  selectedServices,
  selectedItems,
  deliveryAddress,
  className = '',
  customAdjustments = []
}: BookingOrderSummaryProps) => {
  // Calculate totals using the unified system
  // Determine vendor origin (fallback to service location if available)
  const deliveryService = selectedServices.find(service => 
    service.service_details?.deliveryOptions?.delivery ||
    service.service_details?.catering?.deliveryOptions?.delivery
  );
  const vendorOriginAddress = (deliveryService as any)?.location || (deliveryService as any)?.service_details?.location || '';

  const { distanceMiles } = useAddressDistance(vendorOriginAddress, deliveryAddress);

  const calculations = calculateUnifiedOrderTotals(
    selectedServices,
    selectedItems,
    deliveryAddress,
    undefined,
    distanceMiles || undefined,
    customAdjustments
  );

  // Get delivery options from the first service that offers delivery
  const deliveryOptions = deliveryService?.service_details?.deliveryOptions || 
                         deliveryService?.service_details?.catering?.deliveryOptions;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selected Services */}
          <div className="space-y-2">
            {selectedServices.map((service, index) => (
              <div key={service.id || index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {service.quantity || 1}
                    {service.duration && service.duration > 1 && ` × ${service.duration} hours`}
                  </p>
                </div>
                <p className="font-medium">
                  {formatCurrency(parseFloat(String(service.price || '0')) * (service.quantity || 1) * (service.duration || 1))}
                </p>
              </div>
            ))}

            {/* Custom line items (admin-defined adjustments) as part of main list */}
            {calculations.adjustments && calculations.adjustments.length > 0 && (
              <>
                {calculations.adjustments.map((a) => {
                  const base = calculations.subtotal;
                  const raw = a.type === 'percentage' ? base * (Number(a.value) / 100) : Number(a.value);
                  const amount = a.mode === 'discount' ? -raw : raw;
                  const signBadge = a.mode === 'discount' ? '-' : '+';
                  const valueText = a.type === 'percentage' ? `${a.value}%` : formatCurrency(Number(a.value));
                  return (
                    <div key={a.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium">{a.label}</p>
                        <p className="text-sm text-gray-500">
                          Custom {a.mode === 'discount' ? 'Discount' : 'Surcharge'} • {signBadge}{valueText}{a.taxable === false ? ' • non-taxable' : ''}
                        </p>
                      </div>
                      <p className="font-medium">{formatCurrency(amount)}</p>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          <Separator />

          {/* Cost Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(calculations.subtotal)}</span>
            </div>

            {calculations.serviceFee > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Service Fee</span>
                <span>{formatCurrency(calculations.serviceFee)}</span>
              </div>
            )}


            {calculations.deliveryFee > 0 && (
              <div className="flex justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <span>Delivery Fee</span>
                  {calculations.deliveryDetails?.range && (
                    <Badge variant="outline" className="text-xs">
                      {calculations.deliveryDetails.range}
                    </Badge>
                  )}
                </span>
                <span>{formatCurrency(calculations.deliveryFee)}</span>
              </div>
            )}

            {calculations.tax > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Tax
                  {calculations.taxData && (
                    <span className="text-xs ml-1">
                      ({(calculations.taxData.rate * 100).toFixed(1)}%)
                    </span>
                  )}
                </span>
                <span>{formatCurrency(calculations.tax)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(calculations.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Information */}
      {deliveryAddress && deliveryOptions && (
        <DeliveryFeeDisplay
          deliveryAddress={deliveryAddress}
          serviceDeliveryOptions={deliveryOptions}
          orderSubtotal={calculations.subtotal}
          vendorOriginAddress={vendorOriginAddress}
          showDetails={true}
        />
      )}

      {/* Delivery Warning/Info */}
      {calculations.deliveryDetails && !calculations.deliveryDetails.eligible && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <div className="text-amber-600">
                <svg className="h-5 w-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-amber-800">Delivery Notice</h4>
                <p className="text-sm text-amber-700 mt-1">
                  {calculations.deliveryDetails.reason}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
