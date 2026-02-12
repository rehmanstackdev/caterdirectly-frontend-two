import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

type VendorStatus = 'pending' | 'accepted' | 'declined';

class VendorInvoicesService extends BaseRequestService {
  getVendorInvoices(vendorId: string, vendorStatus?: VendorStatus) {
    const params = new URLSearchParams();
    if (vendorStatus) {
      params.append('vendorStatus', vendorStatus);
    }

    const queryString = params.toString();
    const url = `${API_URL}invoices/vendor/${vendorId}${queryString ? `?${queryString}` : ''}`;
    
    return this.get(url, {
      headers: getAuthHeader(),
    });
  }
  updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    return this.put(`${API_URL}invoices/${invoiceId}/invoice-status`, { invoiceStatus: status });
  }
}

export default new VendorInvoicesService();