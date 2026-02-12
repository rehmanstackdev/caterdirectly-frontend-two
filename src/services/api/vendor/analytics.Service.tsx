import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface VendorAnalytics {
  vendor: {
    id: string;
    businessName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fullAddress?: string;
    commissionRate: number;
    website?: string;
    businessDescription?: string;
    createdAt?: string | null;
  };
  reviews: {
    totalReviews: number;
    averageRating: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
    recentReviews: Array<{
      id: string;
      rating: number;
      comment?: string;
      serviceType: string;
      createdAt: string;
      customer: {
        firstName?: string;
        lastName?: string;
        imageUrl?: string;
        email?: string;
      } | null;
    }>;
  };
  orders: {
    totalOrders: number;
    fulfilledOrders: number;
    fulfillmentRate: number;
    totalRevenue: number;
    totalEarnings: number;
  };
  performance: {
    averageRating: number;
    fulfillmentRate: number;
    totalRevenue: number;
    totalEarnings: number;
  };
}

class VendorAnalyticsService extends BaseRequestService {
  /**
   * Get vendor analytics including average rating, fulfilled orders, commission rate, and performance metrics
   * Vendor ID is extracted from the JWT token
   */
  getVendorAnalytics(): Promise<VendorAnalytics> {
    return this.get(`${API_URL}vendor/analytics`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }


}

export default new VendorAnalyticsService();

