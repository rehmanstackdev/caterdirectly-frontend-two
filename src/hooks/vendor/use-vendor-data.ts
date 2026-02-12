import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/useAuth';
import { usersService } from '@/services/users.service';
import VendorsService from '@/services/api/admin/vendors.Service';

interface VendorData {
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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export function useVendorData() {
  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log('useVendorData: Fetching vendor data for user:', user.id);
        
        // Try to get vendor data from stored user data first
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          if (userData.vendor) {
            console.log('useVendorData: Found vendor data in localStorage:', userData.vendor);
            setVendorData(userData.vendor);
            setLoading(false);
            return;
          }
        }
        
        // Fallback: try to get vendor by user ID from backend
        const vendorData = await usersService.getVendorByUserId(user.id);
        if (vendorData) {
          console.log('useVendorData: Found vendor data from backend:', vendorData);
          setVendorData(vendorData as VendorData);
        } else {
          console.log('useVendorData: No vendor data found');
          setError('No vendor profile found');
        }
      } catch (err: any) {
        console.error('useVendorData: Error fetching vendor data:', err);
        setError(err.message || 'Failed to fetch vendor data');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [user]);

  const updateVendorData = async (payload: any, vendorId?: string) => {
    if (!user) return false;

    try {
      // Get vendor ID from parameter, vendorData, or user data
      let finalVendorId = vendorId || vendorData?.id;
      
      if (!finalVendorId) {
        // Try to get from localStorage
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          finalVendorId = userData.vendor?.id || userData.vendorId;
        }
      }

      if (!finalVendorId) {
        console.error('Vendor ID not found');
        return false;
      }

      // Call the API to update vendor profile
      const response = await VendorsService.updateVendorProfile(finalVendorId, payload);
      
      // Update local state with response data if available
      if (response?.data) {
        setVendorData(prev => prev ? { ...prev, ...response.data } : null);
      }
      
      // Update localStorage as well
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        if (userData.vendor) {
          userData.vendor = { ...userData.vendor, ...payload };
          localStorage.setItem('user_data', JSON.stringify(userData));
        }
      }
      
      return true;
    } catch (err: any) {
      console.error('Error updating vendor data:', err);
      throw err; // Re-throw to let the component handle the error
    }
  };

  return {
    vendorData,
    loading,
    error,
    updateVendorData
  };
}