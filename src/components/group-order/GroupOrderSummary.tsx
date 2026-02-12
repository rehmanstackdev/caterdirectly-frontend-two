
import { OrderItem, GuestOrder } from "@/types/order";
import { useCutoffTime } from "@/hooks/use-cutoff-time";
import { useOrderCalculations } from "@/hooks/use-order-calculations";
import OrderHeader from './group-summary/OrderHeader';
import HostOrderItems from './group-summary/HostOrderItems';
import GuestOrdersTable from './group-summary/GuestOrdersTable';
import OrderSummaryCard from './group-summary/OrderSummaryCard';
import PaymentMethodCard from './group-summary/PaymentMethodCard';
import ActionButtons from './group-summary/ActionButtons';
import SelectedVendorCard from './SelectedVendorCard';

interface GroupOrderSummaryProps {
  orderItems: OrderItem[];
  guestOrders: GuestOrder[];
  cutoffTime?: Date;
  paymentMethod: string;
  vendorName: string;
  vendorImage: string;
  onConfirmOrder: () => void;
  onEditOrder: () => void;
}

function GroupOrderSummary({
  orderItems = [],
  guestOrders = [],
  cutoffTime,
  paymentMethod = "host-pays",
  vendorName,
  vendorImage,
  onConfirmOrder,
  onEditOrder
}: GroupOrderSummaryProps) {
  const timeRemaining = useCutoffTime(cutoffTime);
  const calculations = useOrderCalculations(orderItems, guestOrders);
  
  return (
    <div className="space-y-8">
      <OrderHeader timeRemaining={timeRemaining} />
      <SelectedVendorCard 
        vendorName={vendorName} 
        vendorImage={vendorImage} 
        onChangeVendor={onEditOrder} 
      />
      <HostOrderItems orderItems={orderItems} />
      
      {guestOrders.length > 0 && (
        <GuestOrdersTable 
          guestOrders={guestOrders}
          calculateSubtotal={(items) => items.reduce((total, item) => total + (item.price * item.quantity), 0)}
        />
      )}
      
      <OrderSummaryCard {...calculations} />
      <PaymentMethodCard paymentMethod={paymentMethod} />
      <ActionButtons
        onConfirmOrder={onConfirmOrder}
        onEditOrder={onEditOrder}
      />
    </div>
  );
};

export default GroupOrderSummary;
