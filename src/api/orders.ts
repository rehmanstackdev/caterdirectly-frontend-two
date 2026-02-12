import { Order, Review, Dispute } from '@/types/order-types';
import HostService from '@/services/api/host/host.Service';

export const OrdersAPI = {
  // Get all orders
  getOrders: async (hostId?: string): Promise<Order[]> => {
    try {
      if (!hostId) {
        console.warn('No host ID provided, returning empty orders');
        return [];
      }
      
      console.log('OrdersAPI - Calling getOrdersByHost with hostId:', hostId);
      const response = await HostService.getOrdersByHost(hostId);
      console.log('OrdersAPI - Response:', response);
      const ordersData = response.data?.data || response.data || {};
      
      // Map backend orders to frontend format and add category info
      // Both upcoming and past orders use invoice.eventDate as the primary date source
      const upcomingOrders = (ordersData.upcoming || []).map((order: any) => ({
        ...order,
        category: 'upcoming',
        status: 'active', // Map upcoming orders to active status
        title: order.invoice?.eventName || 'Untitled Order',
        location: order.invoice?.eventLocation || '',
        date: order.invoice?.eventDate || '', // Use invoice.eventDate from API
        price: parseFloat(order.amountPaid || '0'),
        guests: order.invoice?.guestCount || 0,
        additionalTip: order.invoice?.additionalTip || null,
        created_at: order.createdAt,
        order_number: order.id,
        image: null // Use placeholder
      }));
      
      const pastOrders = (ordersData.past || []).map((order: any) => ({
        ...order,
        category: 'past',
        status: 'ended', // Map past orders to ended status
        title: order.invoice?.eventName || 'Untitled Order',
        location: order.invoice?.eventLocation || '',
        date: order.invoice?.eventDate || '', // Use invoice.eventDate from API
        price: parseFloat(order.amountPaid || '0'),
        guests: order.invoice?.guestCount || 0,
        additionalTip: order.invoice?.additionalTip || null,
        created_at: order.createdAt,
        order_number: order.id,
        image: null // Use placeholder
      }));
      
      const allOrders = [...upcomingOrders, ...pastOrders];
      console.log('OrdersAPI - Final orders:', allOrders);
      return allOrders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },
  
  // Get order by ID
  getOrder: async (orderId: string): Promise<Order> => {
    console.log('API Call: GET', { url: `/orders/${orderId}`, orderId });
    const result: Order = {
      id: orderId,
      title: '',
      location: '',
      date: new Date().toISOString(),
      price: 0,
      guests: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      order_number: `ORD-${Date.now()}`,
      revision_number: 0
    };
    console.log('API Call Complete: GET', { url: `/orders/${orderId}`, result });
    return result;
  },
  
  // Create new order
  createOrder: async (order: Omit<Order, 'id'>): Promise<Order> => {
    console.log('API Call: POST', { url: '/orders', data: order });
    const result: Order = {
      ...order,
      id: `order-${Date.now()}`,
      created_at: new Date().toISOString(),
      order_number: `ORD-${Date.now()}`,
      revision_number: 0
    };
    console.log('API Call Complete: POST', { url: '/orders', result });
    return result;
  },
  
  // Update order
  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    console.log('API Call: PUT', { url: `/orders/${orderId}`, orderId, updates });
    const result: Order = {
      id: orderId,
      title: '',
      location: '',
      date: new Date().toISOString(),
      price: 0,
      guests: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      order_number: `ORD-${Date.now()}`,
      revision_number: 0,
      ...updates
    };
    console.log('API Call Complete: PUT', { url: `/orders/${orderId}`, result });
    return result;
  },
  
  // Submit a review for an order
  submitReview: async (orderId: string, review: Review): Promise<Order> => {
    console.log('API Call: POST', { url: `/orders/${orderId}/review`, orderId, review });
    const result: Order = {
      id: orderId,
      title: '',
      location: '',
      date: new Date().toISOString(),
      price: 0,
      guests: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      order_number: `ORD-${Date.now()}`,
      revision_number: 0,
      needs_review: false
    };
    console.log('API Call Complete: POST', { url: `/orders/${orderId}/review`, result });
    return result;
  },
  
  // Submit a dispute for an order
  submitDispute: async (orderId: string, reason: string, details: string): Promise<Order> => {
    console.log('API Call: POST', { url: `/orders/${orderId}/dispute`, orderId, reason, details });
    const result: Order = {
      id: orderId,
      title: '',
      location: '',
      date: new Date().toISOString(),
      price: 0,
      guests: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      order_number: `ORD-${Date.now()}`,
      revision_number: 0
    };
    console.log('API Call Complete: POST', { url: `/orders/${orderId}/dispute`, result });
    return result;
  },

  // Submit reviews per service for an order
  submitOrderServiceReviews: async (
    orderId: string,
    reviews: { serviceId: string; rating: number; comment?: string }[]
  ): Promise<void> => {
    console.log('API Call: POST', { url: `/orders/${orderId}/service-reviews`, orderId, reviews });
    console.log('API Call Complete: POST', { url: `/orders/${orderId}/service-reviews` });
  }
};
