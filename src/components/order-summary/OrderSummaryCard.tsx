import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface OrderSummaryCardProps {
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
}

const OrderSummaryCard = ({ 
  subtotal, 
  tax, 
  serviceFee, 
  total 
}: OrderSummaryCardProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Service Cost</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tax (8%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Service Fee</span>
            <span>{formatCurrency(serviceFee)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummaryCard;
