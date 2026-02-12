import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { calculateCateringPrice, extractCateringItems } from '@/utils/catering-price-calculation';
import { formatCurrency } from '@/lib/utils';

interface CateringPriceBreakdownProps {
  service: any;
  selectedItems: Record<string, number>;
  guestCount: number;
  showDetailed?: boolean;
}

const CateringPriceBreakdown = ({
  service,
  selectedItems,
  guestCount,
  showDetailed = true
}: CateringPriceBreakdownProps) => {
  const calculation = useMemo(() => {
    const { baseItems, additionalChargeItems, comboCategoryItems } = extractCateringItems(
      selectedItems,
      service.service_details
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
      additionalCharge: item.additionalCharge,
      isMenuItem: item.isMenuItem
    }));
    
    return calculateCateringPrice(basePricePerPerson, additionalCharges, guestCount, comboCategoryItems);
  }, [service, selectedItems, guestCount]);
  
  if (!showDetailed) {
    return (
      <div className="text-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(calculation.basePriceTotal)}</span>
        </div>
        {calculation.additionalChargesTotal > 0 && (
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Additional Charges</span>
            <span className="font-medium">{formatCurrency(calculation.additionalChargesTotal)}</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between font-semibold text-[#F07712]">
          <span>Total</span>
          <span>{formatCurrency(calculation.finalTotal)}</span>
        </div>
      </div>
    );
  }
  
  return (
    <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 shadow-lg">
      <CardHeader className="pb-4 bg-gradient-to-r from-orange-100 to-amber-100 border-b border-orange-200">
        <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
          <span className="text-2xl">🧮</span>
          <span className="font-bold">Catering Price Calculation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {/* Base Price Calculation */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</span>
            Base Price
          </h4>
          <div className="bg-white rounded-lg p-4 space-y-2 text-sm shadow-sm border border-orange-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price per person</span>
              <span className="font-semibold text-lg text-gray-900">{formatCurrency(calculation.basePricePerPerson)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">× Guest count</span>
              <span className="font-semibold text-lg text-gray-900">{calculation.guestCount}</span>
            </div>
            <Separator className="my-2 bg-orange-200" />
            <div className="flex justify-between items-center pt-1">
              <span className="font-semibold text-gray-900">Base Total</span>
              <span className="text-xl font-bold text-orange-600">{formatCurrency(calculation.basePriceTotal)}</span>
            </div>
          </div>
        </div>

        {/* Additional Charges */}
        {calculation.additionalCharges.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">2</span>
              Additional Charges
            </h4>
            <div className="bg-white rounded-lg p-4 space-y-3 text-sm shadow-sm border border-orange-100">
              {calculation.additionalCharges.map((item, idx) => (
                <div key={idx} className="space-y-2 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-gray-800 font-medium block">
                        {item.name}
                      </span>
                      {item.additionalCharge > 0 && !item.isMenuItem && (
                        <span className="text-orange-600 text-xs font-semibold bg-orange-50 px-2 py-0.5 rounded inline-block mt-1">
                          +{formatCurrency(item.additionalCharge)} upcharge
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 rounded px-3 py-2">
                    <span className="text-xs text-gray-600">
                      {item.additionalCharge > 0
                        ? `${formatCurrency(item.additionalCharge)} × ${calculation.guestCount} guests`
                        : `${formatCurrency(item.unitPrice + item.additionalCharge)} × ${item.quantity} × ${calculation.guestCount} guests`
                      }
                    </span>
                    <span className="font-semibold text-orange-600">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
              <Separator className="my-3 bg-orange-200" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-semibold text-gray-900">Additional Charges Total</span>
                <span className="text-xl font-bold text-orange-600">{formatCurrency(calculation.additionalChargesTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Final Total */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg p-5 shadow-lg border-2 border-orange-400">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white text-lg">TOTAL</span>
            <span className="text-3xl font-bold text-white drop-shadow-md">
              {formatCurrency(calculation.finalTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CateringPriceBreakdown;
