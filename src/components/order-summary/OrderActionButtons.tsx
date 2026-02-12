
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react";

interface OrderActionButtonsProps {
  onEditOrder: () => void;
  isProcessing: boolean;
  paymentDisabled?: boolean;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

const OrderActionButtons = ({
  onEditOrder,
  isProcessing,
  paymentDisabled = false,
  onRefreshData,
  isRefreshing = false
}: OrderActionButtonsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
      <Button 
        variant="outline" 
        onClick={onEditOrder}
        disabled={isProcessing || isRefreshing}
        className="flex-1 sm:flex-none min-h-[48px] text-sm sm:text-base"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Edit Order
      </Button>
      
      {onRefreshData && (
        <Button 
          variant="outline" 
          onClick={onRefreshData}
          disabled={isProcessing || isRefreshing}
          className="flex-1 sm:flex-none min-h-[48px] text-sm sm:text-base"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      )}
      
      {!onRefreshData && (
        <div className="text-xs sm:text-sm text-muted-foreground text-center py-2 sm:py-3 px-2">
          Complete the payment form above to process your order
        </div>
      )}
    </div>
  );
};

export default OrderActionButtons;
