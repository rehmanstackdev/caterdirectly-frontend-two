import BaseRequestService from "./baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL || '';
// Ensure API_URL ends with a single slash
const API_URL = ApiUrl.endsWith('/') ? ApiUrl : `${ApiUrl}/`;

export interface CreateReviewRequest {
  invoiceId: string;
  vendorId: string;
  serviceId?: string;
  serviceType: 'catering' | 'venue' | 'party_rental' | 'event_staff';
  rating: number;
  comment?: string;
}

export interface BulkReviewItem {
  vendorId: string;
  rating: number;
  comment?: string;
  serviceType: string;
}

export interface BulkCreateReviewRequest {
  invoiceId: string;
  reviews: BulkReviewItem[];
}

export interface VendorInfo {
  vendorId: string;
  vendorName: string;
  serviceType: string;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  alreadyReviewed: boolean;
  review?: any;
}

export interface InvoiceVendorsResponse {
  invoice: {
    id: string;
    eventName: string;
    eventDate: string;
    contactName: string;
  };
  vendors: VendorInfo[];
}

class ReviewService extends BaseRequestService {
  /**
   * Submit a single review for a vendor (Public endpoint - no auth required)
   */
  submitReview(data: CreateReviewRequest) {
    return this.post(`${API_URL}reviews`, data).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  /**
   * Submit multiple reviews at once (Public endpoint - no auth required)
   */
  submitBulkReviews(data: BulkCreateReviewRequest) {
    return this.post(`${API_URL}reviews/bulk`, data).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  /**
   * Get vendors for an invoice with review status (Public endpoint - no auth required)
   */
  getInvoiceVendors(invoiceId: string): Promise<InvoiceVendorsResponse> {
    const url = `${API_URL}reviews/invoice/${invoiceId}/vendors`;
    console.log('[ReviewService] Fetching invoice vendors:', url);
    console.log('[ReviewService] API_URL:', API_URL);
    
    return this.get(url).then((response: any) => {
      console.log('[ReviewService] Raw response:', response);
      // BaseRequestService already extracts result.data, so response is the backend's response object
      // Backend returns { status, response, message, data }
      if (response && typeof response === 'object') {
        // Check if it's the backend response structure
        if ('data' in response && response.data) {
          console.log('[ReviewService] Extracted data:', response.data);
          return response.data;
        }
        // If response itself is the data (shouldn't happen but handle it)
        if ('vendors' in response && 'invoice' in response) {
          return response;
        }
      }
      console.warn('[ReviewService] Unexpected response structure:', response);
      return response;
    }).catch((error: any) => {
      console.error('[ReviewService] Error fetching invoice vendors:', error);
      console.error('[ReviewService] Error message:', error.message);
      console.error('[ReviewService] Error response:', error.response?.data);
      console.error('[ReviewService] Error status:', error.response?.status);
      console.error('[ReviewService] Full error:', error);
      throw error;
    });
  }

  /**
   * Get reviews for a vendor (Public endpoint - no auth required)
   */
  getVendorReviews(vendorId: string, page = 1, limit = 10) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    return this.get(`${API_URL}reviews/vendor/${vendorId}?${params.toString()}`).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  /**
   * Get reviews by invoice ID (Public endpoint - no auth required)
   */
  getInvoiceReviews(invoiceId: string) {
    return this.get(`${API_URL}reviews/invoice/${invoiceId}`).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  /**
   * Get a single review by ID (Public endpoint - no auth required)
   */
  getReviewById(reviewId: string) {
    return this.get(`${API_URL}reviews/${reviewId}`).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  // ========== AUTHENTICATED ENDPOINTS ==========

  /**
   * Get current user's reviews (Authenticated endpoint)
   */
  getMyReviews() {
    return this.get(`${API_URL}reviews/my-reviews/all`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  /**
   * Update own review (Authenticated endpoint)
   */
  updateReview(reviewId: string, data: { rating?: number; comment?: string }) {
    return this.patch(`${API_URL}reviews/${reviewId}`, data, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  /**
   * Delete own review (Authenticated endpoint)
   */
  deleteReview(reviewId: string) {
    return this.delete(`${API_URL}reviews/${reviewId}`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  // ========== ADMIN ENDPOINTS ==========

  /**
   * Get all reviews with filters (Admin only)
   */
  getAllReviews(filters?: {
    page?: number;
    limit?: number;
    vendorId?: string;
    status?: 'pending' | 'approved' | 'rejected';
    minRating?: number;
    maxRating?: number;
  }) {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.vendorId) params.append('vendorId', filters.vendorId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.maxRating) params.append('maxRating', filters.maxRating.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_URL}reviews/admin/all?${queryString}` : `${API_URL}reviews/admin/all`;

    return this.get(url, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  /**
   * Approve or reject review (Admin only)
   */
  updateReviewStatus(reviewId: string, reviewStatus: 'pending' | 'approved' | 'rejected') {
    return this.patch(`${API_URL}reviews/admin/${reviewId}/status`, { reviewStatus }, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }

  /**
   * Delete any review (Admin only)
   */
  deleteReviewByAdmin(reviewId: string) {
    return this.delete(`${API_URL}reviews/admin/${reviewId}`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }
}

export default new ReviewService();

