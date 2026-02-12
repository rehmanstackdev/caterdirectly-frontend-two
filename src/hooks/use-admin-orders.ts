import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AdminOrder {
  id: string;
  host_id: string;
  title: string;
  status: string;
  payment_status: string;
  price?: number;
  location?: string;
  date?: string;
  guests?: number;
  booking_details?: string;
  service_details?: string;
  vendor_assignments?: any[];
  order_splitting_details?: any;
  total_delivery_fees?: number;
  requires_vendor_approval?: boolean;
  created_at: string;
  updated_at?: string;
  client_name?: string;
  client_email?: string;
  client_company?: string;
  client_phone?: string;
  host?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
  vendor_orders?: Array<{
    id: string;
    vendor_id: string;
    vendor_name: string;
    services: any[];
    subtotal: number;
    vendor_fee: number;
    status: string;
    vendor_response?: string;
    responded_at?: string;
  }>;
}

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch all orders with related data
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendor_orders(
            id,
            vendor_id,
            vendor_name,
            services,
            subtotal,
            vendor_fee,
            status,
            vendor_response,
            responded_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles for all unique host_ids
      const hostIds = [...new Set((data || []).map(order => order.host_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', hostIds);

      // Create a map of profiles by id
      const profileMap = new Map(
        (profiles || []).map(p => [p.id, p])
      );

      // Fetch client data from orders_v2
      const orderIds = (data || []).map(o => o.id);
      const { data: ordersV2 } = await supabase
        .from('orders_v2')
        .select('id, client_name, client_email, client_company, client_phone')
        .in('id', orderIds);
      
      const clientDataMap = new Map((ordersV2 || []).map(o => [o.id, o]));

      setOrders((data || []).map(order => {
        const hostProfile = profileMap.get(order.host_id);
        const clientData = clientDataMap.get(order.id);
        
        return {
          ...order,
          host: hostProfile || { first_name: 'Unknown', last_name: '', email: 'unknown@example.com' },
          client_name: clientData?.client_name,
          client_email: clientData?.client_email,
          client_company: clientData?.client_company,
          client_phone: clientData?.client_phone,
          vendor_orders: Array.isArray(order.vendor_orders) ? order.vendor_orders : [],
          vendor_assignments: Array.isArray(order.vendor_assignments) ? order.vendor_assignments : 
            (order.vendor_assignments ? JSON.parse(order.vendor_assignments as string) : []),
          order_splitting_details: typeof order.order_splitting_details === 'string' ?
            JSON.parse(order.order_splitting_details) : order.order_splitting_details
        } as AdminOrder;
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders', { id: 'admin-orders-load-error' });
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      setUpdating(true);

      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      toast.success('Order status updated');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      setUpdating(true);

      const { error } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      toast.success('Payment status updated');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  // Delete order permanently
  const cancelOrder = async (orderId: string, reason?: string) => {
    try {
      setUpdating(true);

      const { data, error } = await supabase.rpc('delete_order_cascade', {
        p_order_id: orderId
      });

      if (error) throw error;

      await fetchOrders();
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } finally {
      setUpdating(false);
    }
  };

  // Refund order
  const refundOrder = async (orderId: string, amount?: number) => {
    try {
      setUpdating(true);

      // This would integrate with Stripe for actual refunds
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'refunded'
        })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      toast.success('Refund processed successfully');
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    } finally {
      setUpdating(false);
    }
  };

  // Get orders by status
  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  // Get orders requiring attention
  const getOrdersRequiringAttention = () => {
    return orders.filter(order => 
      order.status === 'pending' || 
      order.requires_vendor_approval ||
      order.vendor_orders?.some(vo => vo.status === 'pending')
    );
  };

  // Get payment issues
  const getPaymentIssues = () => {
    return orders.filter(order => 
      order.payment_status === 'failed' || 
      order.payment_status === 'disputed'
    );
  };

  // Get recent orders (last 24 hours)
  const getRecentOrders = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return orders.filter(order => 
      new Date(order.created_at) > yesterday
    );
  };

  // Calculate metrics
  const getMetrics = () => {
    const total = orders.length;
    const pending = getOrdersByStatus('pending').length;
    const active = getOrdersByStatus('active').length;
    const completed = getOrdersByStatus('completed').length;
    const cancelled = getOrdersByStatus('cancelled').length;
    
    const totalRevenue = orders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + (order.price || 0), 0);

    return {
      total,
      pending,
      active,
      completed,
      cancelled,
      totalRevenue,
      requiresAttention: getOrdersRequiringAttention().length,
      paymentIssues: getPaymentIssues().length
    };
  };

  // Real-time subscription to orders
  useEffect(() => {
    const ordersChannel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order change detected:', payload);
          fetchOrders(); // Refresh orders when changes occur
        }
      )
      .subscribe();

    const vendorOrdersChannel = supabase
      .channel('admin-vendor-orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_orders'
        },
        (payload) => {
          console.log('Vendor order change detected:', payload);
          fetchOrders(); // Refresh when vendor orders change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(vendorOrdersChannel);
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    updating,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    refundOrder,
    getOrdersByStatus,
    getOrdersRequiringAttention,
    getPaymentIssues,
    getRecentOrders,
    getMetrics,
    refetch: fetchOrders
  };
}