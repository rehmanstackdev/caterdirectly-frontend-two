import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

class VendorsService extends BaseRequestService {
  getVendors() {
    return this.get(`${API_URL}users/vendors`, {
      headers: getAuthHeader(),
    });
  }

  updateVendorStatus(vendorId: string, status: string) {
    return this.patch(`${API_URL}users/vendors/${vendorId}/status`, { vendorStatus: status }, {
      headers: getAuthHeader(),
    });
  }

  deleteVendor(userId: string) {
    return this.delete(`${API_URL}users/${userId}`, {
      headers: getAuthHeader(),
    });
  }

  getVendorProfile(vendorId: string) {
    return this.get(`${API_URL}users/vendors/${vendorId}`, {
      headers: getAuthHeader(),
    });
  }

  createVendor(data: any) {
    return this.post(`${API_URL}users/vendors/create`, data, {
      headers: getAuthHeader(),
    });
  }

  // For public vendor registration
  registerVendor(data: any) {
    return this.post(`${API_URL}auth/register`, data, {
      headers: getAuthHeader(),
    });
  }

  // For admin-created verified vendors
  createVerifiedVendor(data: any) {
    return this.post(`${API_URL}auth/create-verified-user`, data, {
      headers: getAuthHeader(),
    });
  }

  // Update vendor commission rate
  updateCommissionRate(vendorId: string, commissionRate: number) {
    return this.patch(`${API_URL}users/vendors/${vendorId}/commission-rate`, { commissionRate }, {
      headers: getAuthHeader(),
    });
  }

  // Update vendor profile (business info and payment & payout)
  updateVendorProfile(vendorId: string, data: any) {
    return this.patch(`${API_URL}users/vendors/${vendorId}/profile`, data, {
      headers: getAuthHeader(),
    });
  }

  // Stripe Connect Account Management
  /**
   * Create a Stripe Connect account for a vendor
   * @param vendorId - Vendor ID
   * @param data - Account creation data (email, businessName, country, type)
   */
  createStripeConnectAccount(vendorId: string, data: {
    email: string;
    businessName: string;
    country?: string;
    type?: 'express' | 'standard';
  }) {
    return this.post(`${API_URL}users/vendors/${vendorId}/stripe-connect/create`, data, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Get Stripe Connect account details for a vendor
   * @param vendorId - Vendor ID
   */
  getStripeConnectAccount(vendorId: string) {
    return this.get(`${API_URL}users/vendors/${vendorId}/stripe-connect`, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Create an account link for Stripe Connect onboarding
   * @param vendorId - Vendor ID
   * @param returnUrl - URL to redirect after onboarding completion
   * @param refreshUrl - URL to redirect if link expires
   */
  createStripeAccountLink(vendorId: string, returnUrl: string, refreshUrl: string) {
    return this.post(`${API_URL}users/vendors/${vendorId}/stripe-connect/account-link`, {
      returnUrl,
      refreshUrl,
    }, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Create a login link for Stripe Connect dashboard access
   * @param vendorId - Vendor ID
   */
  createStripeLoginLink(vendorId: string) {
    return this.post(`${API_URL}users/vendors/${vendorId}/stripe-connect/login-link`, {}, {
      headers: getAuthHeader(),
    });
  }

  /**
   * Update Stripe Connect account details
   * @param vendorId - Vendor ID
   * @param data - Update data (businessName, email, metadata)
   */
  updateStripeConnectAccount(vendorId: string, data: {
    businessName?: string;
    email?: string;
    metadata?: Record<string, string>;
  }) {
    return this.patch(`${API_URL}users/vendors/${vendorId}/stripe-connect`, data, {
      headers: getAuthHeader(),
    });
  }
}

export default new VendorsService();