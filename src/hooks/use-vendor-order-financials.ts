import { useMemo } from 'react';
import { calculateOrderFinancialBreakdown, OrderFinancialBreakdown } from '@/utils/financial-calculations';

/**
 * Hook to calculate vendor-specific financial breakdown from order data
 * Uses SSOT financial calculation utility
 */
export const useVendorOrderFinancials = (order: {
  price: number;
  location: string;
  pricing_snapshot?: any;
  service_details?: any;
}): OrderFinancialBreakdown => {
  return useMemo(() => {
    return calculateOrderFinancialBreakdown(order);
  }, [order.price, order.location, order.pricing_snapshot, order.service_details]);
};
