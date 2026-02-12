import BaseRequestService from "../baseRequest.service";
import { getAuthHeader } from "@/utils/utils";

const ApiUrl = import.meta.env.VITE_API_URL;
const API_URL = `${ApiUrl}`;

export interface Vendor {
  id: string;
  businessName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  commissionRate?: number;
  vendorStatus?: 'pending' | 'approved' | 'rejected';
  accountHolderName?: string;
  bankName?: string;
  accountType?: 'business' | 'personal';
  routingNumber?: string;
  accountNumber?: string;
  businessDescription?: string;
  stripeConnectAccountId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string | null;
    isVerified: boolean;
    phone: string | null;
    createdAt: string;
    updatedAt: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

class VendorService extends BaseRequestService {
  /**
   * Get vendor by user ID
   */
  getVendorByUserId(userId: string): Promise<Vendor | null> {
    return this.get(`${API_URL}users/${userId}`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      const userData = response.data || response;
      return userData?.vendor || null;
    }).catch((error) => {
      console.error('Error fetching vendor by user ID:', error);
      return null;
    });
  }

  /**
   * Get vendor by ID
   */
  getVendorById(vendorId: string): Promise<Vendor> {
    return this.get(`${API_URL}users/vendors/${vendorId}`, {
      headers: getAuthHeader(),
    }).then((response: any) => {
      // Backend returns { status, response, message, data }
      return response.data || response;
    });
  }
}

export default new VendorService();

