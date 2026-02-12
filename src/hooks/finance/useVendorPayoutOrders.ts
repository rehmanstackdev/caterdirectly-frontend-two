import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAuthHeader } from '@/utils/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface VendorPayoutOrder {
  vendorId: string;
  vendorName: string;
  orderNumber: string;
  orderTotal: number;
  subtotal: number;
  serviceFee: number;
  tax: number;
  delivery: number;
  commission: number;
  keptByCD: number;
  owedToVendor: number;
  status: string;
  invoiceId: string;
  eventDate: string;
  paymentTransferred: boolean;
}



const getDateFilter = (filter: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'today':
      return today;
    case 'week':
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return weekAgo;
    case 'month':
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return monthAgo;
    case 'quarter':
      const quarterAgo = new Date(today);
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      return quarterAgo;
    case 'year':
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return yearAgo;
    default:
      return null;
  }
};

export const useVendorPayoutOrders = (timeFilter: string = 'all', softLaunchDate: Date | null = null, fullLaunchDate: Date | null = null) => {
  const [orders, setOrders] = useState<VendorPayoutOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    grossProfit: 0,
    costOfRevenue: 0,
    accountsPayable: 0,
    salesPipeline: 0,
    averageDealSize: 0,
    conversionRate: 0,
    grossProfitMargin: 0,
  });
  const { toast } = useToast();

  const fetchVendorPayoutOrders = async () => {
    console.log('Fetching with dates:', { softLaunchDate, fullLaunchDate, timeFilter });
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}invoices/admin/vendor-payout-orders`, {
        headers: getAuthHeader()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendor payout orders');
      }

      const result = await response.json();
      
      if (result.status === 200 && result.data) {
        let ordersData = result.data;
        
        // Apply date range filter (soft launch to full launch)
        if (softLaunchDate && fullLaunchDate) {
          const startDate = new Date(softLaunchDate);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(fullLaunchDate);
          endDate.setHours(23, 59, 59, 999);
          
          console.log('Filtering with date range:', { startDate, endDate, totalOrders: ordersData.length });
          
          ordersData = ordersData.filter((o: VendorPayoutOrder) => {
            const eventDate = new Date(o.eventDate);
            eventDate.setHours(0, 0, 0, 0);
            const matches = eventDate >= startDate && eventDate <= endDate;
            console.log('Order:', o.eventDate, 'matches:', matches);
            return matches;
          });
          
          console.log('Filtered orders count:', ordersData.length);
        } else {
          // Apply time filter if no date range is set
          const filterDate = getDateFilter(timeFilter);
          if (filterDate) {
            ordersData = ordersData.filter((o: VendorPayoutOrder) => {
              const eventDate = new Date(o.eventDate);
              return eventDate >= filterDate;
            });
          }
        }
        
        setOrders(ordersData);
        
        // Calculate metrics
        const paidOrders = ordersData.filter((o: VendorPayoutOrder) => o.status === 'Paid');
        const totalRevenue = paidOrders.reduce((sum: number, o: VendorPayoutOrder) => sum + o.orderTotal, 0);
        const grossProfit = paidOrders.reduce((sum: number, o: VendorPayoutOrder) => sum + o.keptByCD, 0);
        const costOfRevenue = paidOrders.reduce((sum: number, o: VendorPayoutOrder) => sum + o.owedToVendor, 0);
        const accountsPayable = ordersData.filter((o: VendorPayoutOrder) => !o.paymentTransferred).reduce((sum: number, o: VendorPayoutOrder) => sum + o.owedToVendor, 0);
        const salesPipeline = ordersData.filter((o: VendorPayoutOrder) => o.status !== 'Paid').reduce((sum: number, o: VendorPayoutOrder) => sum + o.orderTotal, 0);
        const averageDealSize = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
        const conversionRate = ordersData.length > 0 ? (paidOrders.length / ordersData.length) * 100 : 0;
        const grossProfitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
        
        setMetrics({
          totalRevenue,
          grossProfit,
          costOfRevenue,
          accountsPayable,
          salesPipeline,
          averageDealSize,
          conversionRate,
          grossProfitMargin,
        });
      } else {
        throw new Error(result.message || 'Failed to load data');
      }
    } catch (err: any) {
      console.error('Error fetching vendor payout orders:', err);
      setError(err.message || 'Failed to load vendor payout orders');
      toast({
        title: 'Error',
        description: 'Failed to load vendor payout orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const markOrderPaid = async (invoiceId: string) => {
    const order = orders.find(o => o.invoiceId === invoiceId);
    if (!order) throw new Error('Order not found');

    try {
      toast({
        title: 'Payment Recorded',
        description: `Marked order ${order.orderNumber} as paid to ${order.vendorName}`,
      });

      await fetchVendorPayoutOrders();
    } catch (err: any) {
      console.error('Error marking order as paid:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to mark order as paid',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchVendorPayoutOrders();
  }, [timeFilter, softLaunchDate, fullLaunchDate]);

  return {
    orders,
    loading,
    error,
    metrics,
    markOrderPaid,
    refreshOrders: fetchVendorPayoutOrders,
  };
};
