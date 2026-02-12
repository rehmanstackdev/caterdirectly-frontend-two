
import { OrderItem, GuestOrder } from "@/types/order";
import { calculateLegacyOrderTotals } from "@/utils/unified-calculations";

interface OrderCalculations {
  hostOrderSubtotal: number;
  guestsTotal: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

export const useOrderCalculations = (
  orderItems: OrderItem[],
  guestOrders: GuestOrder[]
): OrderCalculations => {
  // Use the unified calculation system for consistency
  return calculateLegacyOrderTotals(orderItems, guestOrders);
};
