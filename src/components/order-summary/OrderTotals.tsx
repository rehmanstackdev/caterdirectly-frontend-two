import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface OrderTotalsProps {
  subtotal: number;
  tax?: number;
  delivery?: number;
  total: number;
}

const OrderTotals = ({
  subtotal,
  tax = 0,
  delivery = 0,
  total
}: OrderTotalsProps) => {
  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <h3 className="text-xl font-semibold">Order Total</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          {delivery > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span>{formatCurrency(delivery)}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderTotals;
