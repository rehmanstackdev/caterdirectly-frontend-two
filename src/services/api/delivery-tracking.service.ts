import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class DeliveryTrackingService extends BaseRequestService {
  setDeliveryTime(invoiceId: string, data: { promisedDeliveryTime: string; notes?: string }) {
    return this.post(`${API_URL}delivery/set-time/${invoiceId}`, data, {
      headers: getAuthHeader(),
    });
  }

  confirmDelivery(invoiceId: string, data?: { notes?: string }) {
    return this.post(`${API_URL}delivery/confirm/${invoiceId}`, data || {}, {
      headers: getAuthHeader(),
    });
  }

  getDeliveryStatus(invoiceId: string) {
    return this.get(`${API_URL}delivery/status/${invoiceId}`, {
      headers: getAuthHeader(),
    });
  }

  getVendorDeliveries() {
    return this.get(`${API_URL}delivery/vendor`, {
      headers: getAuthHeader(),
    });
  }

  getAdminDeliveries(page = 1, limit = 20, timing?: string) {
    const params: any = { page, limit };
    if (timing) params.timing = timing;
    return this.get(`${API_URL}delivery/admin/all`, {
      headers: getAuthHeader(),
      params,
    });
  }
}

export default new DeliveryTrackingService();
