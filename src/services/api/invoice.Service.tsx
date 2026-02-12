import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class InvoiceService extends BaseRequestService {
  createInvoice(data: any) {
    return this.post(`${API_URL}invoices`, data, {
      headers: getAuthHeader(),
    }); 
  }
  getInvoiceOrderSummary(invoiceId: string) {
    return this.get(`${API_URL}invoices/${invoiceId}/summary`, {
      headers: getAuthHeader(),
    });
  }

  getGroupOrderHostSummary(invoiceId: string) {
    return this.get(`${API_URL}invoices/${invoiceId}/group-order-host-summary`);
  }

  getInvoiceById(invoiceId: string) {
    return this.get(`${API_URL}invoices/${invoiceId}`, {
      headers: getAuthHeader(),
    });
  }

  getInvoiceDetails(invoiceId: string) {
    return this.get(`${API_URL}invoices/${invoiceId}/details`, {
      headers: getAuthHeader(),
    });
  }
  markAsPaidStripe(invoiceId: string, data: any) {
    return this.post(`${API_URL}invoices/${invoiceId}/mark-paid`, data, {
      headers: getAuthHeader(),
    });
  }
  updatePaymentIntentAmount(invoiceId: string, data: { paymentIntentId: string; amount: number }) {
    return this.post(`${API_URL}invoices/${invoiceId}/update-payment-intent`, data, {
      headers: getAuthHeader(),
    });
  }
 updateInvoiceStatus(invoiceId: string, status: string) {
    return this.patch(`${API_URL}invoices/${invoiceId}/invoice-status`, { invoiceStatus: status }, {
      headers: getAuthHeader(),
    });
  } 

updateInvoice(invoiceId: string, data: any) {
    return this.patch(`${API_URL}invoices/${invoiceId}`, data, {
    headers: getAuthHeader(),
    });
  }

  updateVendorStatus(invoiceId: string, vendorStatus: string) {
    return this.patch(`${API_URL}invoices/${invoiceId}/vendor-status`, { vendorStatus }, {
      headers: getAuthHeader(),
    });
  }

}

export default new InvoiceService();
