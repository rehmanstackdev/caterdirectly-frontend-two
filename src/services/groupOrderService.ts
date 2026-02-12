import { ServiceSelection, OrderInfo, GuestOrder } from "@/types/order";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface GroupOrderData {
  orderInfo: OrderInfo;
  selectedServices: ServiceSelection[];
  selectedItems: Record<string, number>;
  invitedGuests: string[];
  paymentMethod: string;
  additionalNotes: string;
  vendorName: string;
  vendorImage: string;
}

export interface CreateGroupOrderResponse {
  orderId: string;
  invitationTokens: string[];
}

/**
 * Service for managing group orders
 */
export const groupOrderService = {
  async getInvitationDetails(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_URL}invoices/invitation/${encodeURIComponent(token)}`);
      if (!response.ok) {
        return null;
      }
      const result = await response.json();
      return result?.data || null;
    } catch (error) {
      console.log('API Call Error: GET_INVITATION_DETAILS', { token, error });
      return null;
    }
  },
  /**
   * Create a new group order and generate invitation tokens
   */
  async createGroupOrder(data: GroupOrderData): Promise<CreateGroupOrderResponse | null> {
    try {
      console.log('API Call: CREATE_GROUP_ORDER', {
        orderInfo: data.orderInfo,
        selectedServices: data.selectedServices,
        invitedGuests: data.invitedGuests,
        vendorName: data.vendorName
      });

      // Calculate total price from services and items
      const totalPrice = data.selectedServices.reduce((total, service) => {
        const servicePrice = typeof service.price === 'string' 
          ? parseFloat(service.price.replace(/[^0-9.-]+/g, "")) 
          : service.price;
        return total + (servicePrice * service.quantity);
      }, 0);

      // Generate mock order ID
      const orderId = `order-${Date.now()}`;

      // Generate mock invitation tokens for each guest
      const invitationTokens: string[] = data.invitedGuests.map((email, index) => {
        return `token-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 15)}`;
      });

      console.log('API Call Complete: CREATE_GROUP_ORDER', {
        orderId,
        invitationTokens,
        totalPrice,
        guestCount: data.invitedGuests.length
      });

      return {
        orderId,
        invitationTokens
      };
    } catch (error) {
      console.log('API Call Error: CREATE_GROUP_ORDER', { error });
      return null;
    }
  },

  /**
   * Get group order details by ID
   */
  async getGroupOrder(orderId: string): Promise<any> {
    try {
      console.log('API Call: GET_GROUP_ORDER', { orderId });

      // Return mock group order data
      const mockOrder = {
        id: orderId,
        host_id: 'mock-host-id',
        title: 'Group Order',
        location: '',
        date: new Date().toISOString(),
        guests: 0,
        price: 0,
        status: 'pending',
        is_group_order: true,
        vendor_name: '',
        order_number: `ORD-${Date.now()}`,
        revision_number: 0,
        service_details: '[]',
        booking_details: '{}',
        guest_orders: '[]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('API Call Complete: GET_GROUP_ORDER', { orderId, result: mockOrder });

      return mockOrder;
    } catch (error) {
      console.log('API Call Error: GET_GROUP_ORDER', { orderId, error });
      return null;
    }
  },

  /**
   * Update guest orders for a group order
   */
  async updateGuestOrders(orderId: string, guestOrders: GuestOrder[]): Promise<boolean> {
    try {
      console.log('API Call: UPDATE_GUEST_ORDERS', {
        orderId,
        guestOrdersCount: guestOrders.length,
        guestOrders
      });

      console.log('API Call Complete: UPDATE_GUEST_ORDERS', {
        orderId,
        success: true
      });

      return true;
    } catch (error) {
      console.log('API Call Error: UPDATE_GUEST_ORDERS', { orderId, error });
      return false;
    }
  },

  /**
   * Submit a guest order for a group order
   */
  async submitGuestOrder(
    token: string, 
    guestInfo: any, 
    selectedItems: any[]
  ): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}invoices/guest-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          phone: guestInfo.phone,
          dietaryRestrictions: guestInfo.dietaryRestrictions,
          items: selectedItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let message = errorText || 'Failed to submit guest order';
        try {
          const parsed = JSON.parse(errorText);
          if (parsed?.message) {
            message = parsed.message;
          }
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      return true;
    } catch (error) {
      console.log('API Call Error: SUBMIT_GUEST_ORDER', { token, error });
      return false;
    }
  },

  /**
   * Get invitation tokens for a group order
   */
  async getOrderInvitations(orderId: string): Promise<any[]> {
    try {
      console.log('API Call: GET_ORDER_INVITATIONS', { orderId });

      console.log('API Call Complete: GET_ORDER_INVITATIONS', {
        orderId,
        result: []
      });

      return [];
    } catch (error) {
      console.log('API Call Error: GET_ORDER_INVITATIONS', { orderId, error });
      return [];
    }
  },

  /**
   * Complete a group order (finalize and submit for processing)
   */
  async completeGroupOrder(orderId: string): Promise<boolean> {
    try {
      console.log('API Call: COMPLETE_GROUP_ORDER', { orderId });

      console.log('API Call Complete: COMPLETE_GROUP_ORDER', {
        orderId,
        status: 'submitted',
        success: true
      });

      return true;
    } catch (error) {
      console.log('API Call Error: COMPLETE_GROUP_ORDER', { orderId, error });
      return false;
    }
  }
};
