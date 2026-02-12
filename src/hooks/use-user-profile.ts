import { useState, useEffect } from 'react';
import UsersService from '@/services/api/admin/users.Service';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  jobTitle?: string | null;
  userType?: string | null;
  imageUrl?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  roles?: Array<{
    id: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  }>;
  permissions?: any[];
  vendor?: {
    id?: string;
    businessName?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    fullAddress?: string;
    einTin?: string;
    website?: string | null;
    coordinates?: {
      lat: number;
      lng: number;
    };
    licenses?: string[];
    insurance_policies?: string[];
    serviceTypes?: string[];
    certifications?: string | null;
    service_area_certifications?: string | null;
    businessLicense?: string;
    foodHandlerCertification?: string | null;
    healthPermit?: string | null;
    liabilityInsurance?: string;
    termsAccepted?: boolean;
    vendorStatus?: string;
    commissionRate?: number | null;
    accountHolderName?: string | null;
    bankName?: string | null;
    accountType?: string | null;
    routingNumber?: string | null;
    accountNumber?: string | null;
    businessDescription?: string | null;
  };
  [key: string]: any;
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsersService.getProfile();
      // Handle response structure: { status, response, message, data: {...} }
      const profileData = response?.data || response;
      setProfile(profileData);
      return profileData;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch profile';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}

