
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface OrderSummaryCardProps {
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  hostOrderSubtotal: number;
  guestsTotal: number;
  taxRate?: number;
}

const OrderSummaryCard = ({ 
  subtotal, 
  tax, 
  deliveryFee, 
  total,
  hostOrderSubtotal,
  guestsTotal,
  taxRate
}: OrderSummaryCardProps) => {
  const getTaxLabel = () => {
    return taxRate ? `Tax (${taxRate.toFixed(2)}%)` : 'Tax';
  };
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Host Order Total</span>
            <span>${hostOrderSubtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Guest Orders Total</span>
            <span>${guestsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{getTaxLabel()}</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummaryCard;
