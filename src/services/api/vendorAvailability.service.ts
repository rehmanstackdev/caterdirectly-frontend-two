import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface VendorAvailability {
  id: string;
  vendorId: string;
  day: string;
  startTime: string;
  endTime: string;
  status: 'available' | 'closed';
  maxOrdersPerDay?: number;
}

class VendorAvailabilityService extends BaseRequestService {
  async getByVendorId(vendorId: string): Promise<VendorAvailability[]> {
    const response = await this.get(`${API_URL}vendor-availability/vendor/${vendorId}`, {
      headers: getAuthHeader(),
    });
    return Array.isArray(response.data) ? response.data : (response.data || []);
  }

  async create(data: Omit<VendorAvailability, 'id'>): Promise<VendorAvailability> {
    const response = await this.post(`${API_URL}vendor-availability`, data, {
      headers: getAuthHeader(),
    });
    return response.data || response;
  }

  async update(id: string, data: Partial<Omit<VendorAvailability, 'id' | 'vendorId'>>): Promise<VendorAvailability> {
    const response = await this.patch(`${API_URL}vendor-availability/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data || response;
  }

  async deleteAvailability(id: string): Promise<void> {
    await super.delete(`${API_URL}vendor-availability/${id}`, {
      headers: getAuthHeader(),
    });
  }
}

export default new VendorAvailabilityService();
