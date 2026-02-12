/**
 * Utility functions for managing order data - stubbed
 */

import { ServiceSelection, OrderInfo } from '@/types/order';

export interface OrderDraft {
  orderId?: string;
  orderName?: string;
  location?: string;
  date?: string;
  selectedServices: any[];
  selectedItems: Record<string, number>;
  formData?: any;
  estimatedTotal?: number;
  customAdjustments?: any[];
}

/**
 * Save order draft - stubbed
 */
export async function saveOrderDraft(draft: OrderDraft, userId: string): Promise<string | null> {
  const method = draft.orderId ? 'PUT' : 'POST';
  const url = draft.orderId ? `/orders/${draft.orderId}` : '/orders';
  console.log(`API Call: ${method}`, { url, data: draft, userId });
  const mockId = draft.orderId || `order-${Date.now()}`;
  console.log(`API Call Complete: ${method}`, { url, result: { id: mockId } });
  return mockId;
}

/**
 * Load order draft - stubbed
 */
export async function loadOrderDraft(orderId: string): Promise<OrderDraft | null> {
  console.log('API Call: GET', { url: `/orders/${orderId}`, status: 'draft' });
  console.log('API Call Complete: GET', { url: `/orders/${orderId}`, result: null });
  return null;
}

/**
 * Delete order draft - stubbed
 */
export async function deleteOrderDraft(orderId: string, userId: string): Promise<boolean> {
  console.log('API Call: DELETE', { url: `/orders/${orderId}`, userId, status: 'draft' });
  console.log('API Call Complete: DELETE', { url: `/orders/${orderId}`, result: true });
  return true;
}

/**
 * Clear old session/localStorage data (cleanup function)
 */
export function clearLegacyStorage(): void {
  try {
    // Clear old session storage keys
    sessionStorage.removeItem('eventify_services');
    sessionStorage.removeItem('orders');
    sessionStorage.removeItem('selectedServices');
    sessionStorage.removeItem('selectedItems');
    sessionStorage.removeItem('orderInfo');
    
    // Clear old local storage keys
    localStorage.removeItem('eventify_services');
    localStorage.removeItem('orders');
    localStorage.removeItem('selectedServices');
    localStorage.removeItem('selectedItems');
    localStorage.removeItem('orderInfo');
    
    console.log('[OrderStorage] Legacy storage cleared');
  } catch (error) {
    console.error('[OrderStorage] Error clearing legacy storage:', error);
  }
}
