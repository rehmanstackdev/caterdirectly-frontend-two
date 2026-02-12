import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface VendorBlockDate {
  id: string;
  vendorId: string;
  date: string;
  reason: string;
  status: 'full' | 'partial';
  startTime?: string;
  endTime?: string;
}

class VendorBlockDatesService extends BaseRequestService {
  async getByVendorId(vendorId: string): Promise<VendorBlockDate[]> {
    const response = await this.get(`${API_URL}vendor-block-dates/vendor/${vendorId}`, {
      headers: getAuthHeader(),
    });
    return Array.isArray(response.data) ? response.data : (response.data || []);
  }

  async create(data: Omit<VendorBlockDate, 'id'>): Promise<VendorBlockDate> {
    const response = await this.post(`${API_URL}vendor-block-dates`, data, {
      headers: getAuthHeader(),
    });
    return response.data || response;
  }

  async update(id: string, data: Partial<Omit<VendorBlockDate, 'id' | 'vendorId'>>): Promise<VendorBlockDate> {
    const response = await this.patch(`${API_URL}vendor-block-dates/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data || response;
  }

  async deleteBlockDate(id: string): Promise<void> {
    await super.delete(`${API_URL}vendor-block-dates/${id}`, {
      headers: getAuthHeader(),
    });
  }
}

export default new VendorBlockDatesService();
