import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface OrderInvoice {
  id: string;
  invoiceId: string;
  stripePaymentIntentId: string;
  paymentStatus: string;
  amountPaid: number;
  currency: string;
  paymentMethodType?: string;
  paymentMethodId?: string;
  stripeChargeId?: string;
  stripeCustomerId?: string;
  paymentDetails?: Record<string, any>;
  receiptUrl?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    createdBy?: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
}

class OrdersService extends BaseRequestService {
  /**
   * Get all orders (Admin and Super Admin only)
   */
  getAllOrders() {
    return this.get(`${API_URL}orders/admin/all`, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Get orders by creator ID
   */
  getOrdersByCreator(createdBy: string) {
    return this.get(`${API_URL}orders`, {
      headers: getAuthHeader(),
      params: { createdBy },
    });
  }

  acceptInvitation(token: string) {
    return this.get(`${API_URL}invoices/accept-invitation`, {
      headers: getAuthHeader(),
      params: {
        token,
        acceptanceStatus: 'accepted'
      }
    });
  }

  declineInvitation(token: string) {
    return this.get(`${API_URL}invoices/accept-invitation`, {
      headers: getAuthHeader(),
      params: {
        token,
        acceptanceStatus: 'cancelled'
      }
    });
  }

  /**
   * Get order details by invoice ID
   */
  getOrderDetailsByInvoiceId(invoiceId: string) {
    return this.get(`${API_URL}orders/invoice/${invoiceId}`, {
      headers: getAuthHeader(),
    });
  }
}

export default new OrdersService();
