import { api } from '@/api/client';

export interface BackendUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  imageUrl?: string;
  isVerified: boolean;
  verifyToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  createdAt: string;
  updatedAt: string;
  userType: string;
  jobTitle?: string;
  roles: Array<{
    id: string;
    role: string; 
    createdAt: string;
    updatedAt: string;
  }>;
  permissions?: Array<{
    id: string;
    permission: string;
    createdAt: string;
    updatedAt: string;
  }>;
  vendor?: any;
  // Vendor specific fields
  businessName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  fullAddress?: string;
  einTin?: string;
  website?: string;
  serviceTypes?: string[];
  coordinates?: { lat: number; lng: number };
  licenses?: string[];
  insurance_policies?: string[];
  certifications?: string[];
  service_area_certifications?: string[];
  businessLicense?: string;
  foodHandlerCertification?: string;
  healthPermit?: string;
  liabilityInsurance?: string;
  termsAccepted?: boolean;
}

export interface BackendVendor extends BackendUser {
  vendor: {
    id: string;
    businessName: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fullAddress?: string;
    einTin?: string;
    website?: string;
    serviceTypes?: string[];
    coordinates?: { lat: number; lng: number };
    licenses?: string[];
    insurance_policies?: string[];
    certifications?: string[];
    service_area_certifications?: string[];
    businessLicense?: string;
    foodHandlerCertification?: string;
    healthPermit?: string;
    liabilityInsurance?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    updatedAt: string;
  };
}

export const usersService = {
  // Get all users (admin only)
  getAllUsers: async (): Promise<BackendUser[]> => {
    const response = await api.get<{data: BackendUser[]}>('/users');
    return response.data || [];
  },

  // Get all vendors (admin only)
  getAllVendors: async (): Promise<BackendVendor[]> => {
    const response = await api.get<{data: BackendVendor[]}>('/users/vendors');
    return response.data || [];
  },

  // Get vendor by ID (admin only)
  getVendorById: async (id: string): Promise<BackendVendor> => {
    const response = await api.get<{data: BackendVendor}>(`/users/vendors/${id}`);
    return response.data;
  },

  // Get vendor by user ID
  getVendorByUserId: async (userId: string): Promise<{id: string; businessName: string} | null> => {
    try {
      const response = await api.get<{data: BackendUser}>(`/users/${userId}`);
      return response.data?.vendor || null;
    } catch (error) {
      console.error('Error fetching vendor by user ID:', error);
      throw error;
    }
  },

  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<BackendUser> => {
    const response = await api.get<{data: BackendUser}>(`/users/${userId}`);
    return response.data;
  },

  // Create vendor profile
  createVendorProfile: async (vendorData: any) => {
    const response = await api.post('/users/create', vendorData);
    return response.data;
  },

  // Test endpoint
  testConnection: async () => {
    return api.get('/users/test');
  },

  // Update personal info
  updatePersonalInfo: async (userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    locationData?: {
      city?: string;
      state?: string;
      street?: string;
      zipCode?: string;
      lat?: number;
      lng?: number;
    };
  }): Promise<BackendUser> => {
    const response = await api.patch<{data: BackendUser}>(`/users/${userId}/personal-info`, data);
    return response.data;
  },

  // Get personal info
  getPersonalInfo: async (userId: string): Promise<BackendUser> => {
    const response = await api.get<{data: BackendUser}>(`/users/${userId}/personal-info`);
    return response.data;
  }
};