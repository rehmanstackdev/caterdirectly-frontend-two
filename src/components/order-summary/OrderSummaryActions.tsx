
import { Button } from "@/components/ui/button";
import { Check, Edit } from "lucide-react";

interface OrderSummaryActionsProps {
  onConfirmOrder: () => void;
  onEditOrder: () => void;
  isProcessing?: boolean;
}

const OrderSummaryActions = ({
  onConfirmOrder,
  onEditOrder,
  isProcessing = false
}: OrderSummaryActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button 
        variant="outline"
        className="w-full sm:w-auto" 
        onClick={onEditOrder}
        disabled={isProcessing}
      >
        <Edit className="mr-2 h-4 w-4" />
        Edit Order
      </Button>
      
      <Button 
        className="w-full sm:w-auto bg-[#F07712] hover:bg-[#F07712]/90" 
        onClick={onConfirmOrder}
        disabled={isProcessing}
      >
        {isProcessing ? (
          "Processing..."
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            Confirm Order
          </>
        )}
      </Button>
    </div>
  );
};

export default OrderSummaryActions;
