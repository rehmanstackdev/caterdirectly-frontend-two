import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

type VendorStatus = 'pending' | 'accepted' | 'declined';

class VendorOrdersService extends BaseRequestService {
  getVendorOrders(vendorId: string, vendorStatus?: VendorStatus) {
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
}

export default new VendorOrdersService();