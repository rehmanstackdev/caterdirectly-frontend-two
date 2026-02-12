import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface VendorOrder {
  id: string;
  main_order_id: string;
  vendor_id: string;
  vendor_name: string;
  services: any[]; // Filtered from invoice.items (SSOT)
  subtotal: number;
  vendor_fee: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  vendor_response?: string;
  responded_at?: string;
  created_at: string;
  updated_at: string;
  main_order?: {
    id: string;
    title: string;
    host_id: string;
    location?: string;
    date?: string;
    guests?: number;
    booking_details?: string;
    payment_status?: string;
    status: string;
    price?: number;
    pricing_snapshot?: any; // SSOT for pricing and selected items
    service_details?: any; // SSOT for complete service data
  };
  invoice?: {
    id: string;
    items: any[]; // SSOT: Complete service objects with selected_items
    pricing_snapshot?: any; // SSOT: Complete pricing with adjustmentsBreakdown
    booking_details?: any; // SSOT: Form data
  };
}

export function useVendorOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  // Get vendor ID for current user
  const fetchVendorId = async () => {
    if (!user) return null;
    
    // Use stored user data instead of Supabase
    const storedUserData = localStorage.getItem('user_data');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      return userData.vendor?.id || user.id;
    }
    
    return user.id;
  };

  // Fetch vendor orders - disabled for now since backend doesn't have orders API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Return empty orders for now
      setOrders([]);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Respond to order
  const respondToOrder = async (
    orderId: string,
    action: 'accept' | 'decline' | 'counter',
    response?: string
  ) => {
    try {
      setResponding(true);

      const { data, error } = await supabase.functions.invoke('vendor-order-notification', {
        body: {
          vendorOrderId: orderId,
          action,
          response
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error);
      }

      await fetchOrders();
      toast.success(data.message);
      
      return data;
    } catch (error) {
      console.error('Error responding to order:', error);
      toast.error('Failed to respond to order');
      return null;
    } finally {
      setResponding(false);
    }
  };

  // Filter orders by status
  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  // Get orders requiring immediate attention
  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending');
  };

  // Get orders that need follow-up
  const getActiveOrders = () => {
    return orders.filter(order => order.status === 'accepted');
  };

  // Get completed orders
  const getCompletedOrders = () => {
    return orders.filter(order => order.status === 'completed');
  };

  // Get cancelled/declined orders
  const getCancelledOrders = () => {
    return orders.filter(order => ['declined', 'cancelled'].includes(order.status));
  };

  // Real-time subscription disabled for now
  useEffect(() => {
    // No subscription needed
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return {
    orders,
    loading,
    responding,
    respondToOrder,
    getOrdersByStatus,
    getPendingOrders,
    getActiveOrders,
    getCompletedOrders,
    getCancelledOrders,
    refetch: fetchOrders
  };
}