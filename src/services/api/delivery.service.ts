import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface DeliveryFeeRequest {
  deliveryAddress: string;
  orderSubtotal: number;
  serviceId?: string;
  vendorId?: string;
  distanceMiles?: number;
}

export interface DeliveryFeeResponse {
  fee: number;
  eligible: boolean;
  range?: string;
  reason?: string;
  minimumRequired?: number;
  distanceEligible: boolean;
  minimumEligible: boolean;
}

class DeliveryService extends BaseRequestService {
  /**
   * Calculate delivery fee from API
   */
  calculateDeliveryFee(request: DeliveryFeeRequest): Promise<DeliveryFeeResponse> {
    return this.post(`${API_URL}delivery/calculate-fee`, request, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Get delivery options for a service
   */
  getDeliveryOptions(serviceId: string) {
    return this.get(`${API_URL}delivery/options/${serviceId}`, {
      headers: getAuthHeader(),
    });
  }
}

export default new DeliveryService();