
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PAYMENT_METHODS, PAYMENT_METHOD_MESSAGES } from '@/constants/payment-methods';

interface PaymentMethodCardProps {
  paymentMethod: string;
}

const PaymentMethodCard = ({ paymentMethod }: PaymentMethodCardProps) => {
  const paymentMethodDetails = PAYMENT_METHOD_MESSAGES[paymentMethod as keyof typeof PAYMENT_METHOD_MESSAGES] || 
    PAYMENT_METHOD_MESSAGES[PAYMENT_METHODS.HOST_PAYS];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-[9px] h-[9px] border border-[#F07712] rounded-full">
                  <div className="w-[7px] h-[7px] absolute left-[1px] top-[1px] bg-[#F07712] rounded-full"></div>
                </div>
              </div>
              <div className="w-10 h-7 bg-gray-200 rounded"></div>
            </div>
            <div>
              <p className="font-medium">Credit Card ending in 4242</p>
              <p className="text-sm text-gray-500">Expires 12/24</p>
            </div>
          </div>
          
          <p className={`text-sm ${paymentMethodDetails.bgColor} px-3 py-2 rounded border ${paymentMethodDetails.borderColor}`}>
            {paymentMethodDetails.message}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethodCard;
