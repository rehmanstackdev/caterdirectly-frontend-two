import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

interface BackendVendorProfile {
  id: string;
  businessName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  einTin: string;
  licenses: string[];
  insurance_policies: string[];
  serviceTypes: string[];
  website: string | null;
  coordinates: {
    lat: number;
    lng: number;
  };
  certifications: any;
  service_area_certifications: any;
  businessLicense: string | null;
  foodHandlerCertification: string | null;
  healthPermit: string | null;
  liabilityInsurance: string | null;
  termsAccepted: boolean;
  vendorStatus: string;
  commissionRate?: number;
  accountHolderName?: string;
  bankName?: string;
  accountType?: 'business' | 'personal';
  routingNumber?: string;
  accountNumber?: string;
  businessDescription?: string;
  stripeConnectAccountId?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    imageUrl: string | null;
    isVerified: boolean;
    verifyToken: string | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: string | null;
    phone: string | null;
    jobTitle: string | null;
    userType: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

interface BackendVendorProfileResponse {
  status: number;
  response: string;
  message: string;
  data: BackendVendorProfile;
}

export const useBackendVendorProfile = (vendorId: string) => {
  return useQuery({
    queryKey: ['backend-vendor-profile', vendorId],
    queryFn: async (): Promise<BackendVendorProfile> => {
      const response = await api.get<BackendVendorProfileResponse>(`/users/vendors/${vendorId}`);
      return response.data;
    },
    enabled: !!vendorId,
    staleTime: 300_000, // 5 minutes
    gcTime: 600_000, // 10 minutes
  });
};