
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import vendorsService from '@/services/api/admin/vendors.Service';
import { VendorStatus } from './types';

export function useVendorsData() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Type guard to validate vendor status
  function isValidVendorStatus(status: string): status is VendorStatus {
    return ['pending', 'approved', 'rejected', 'active', 'inactive'].includes(status);
  }
  
  // Fetch vendors data
  useEffect(() => {
    let isMounted = true;
    
    const fetchVendors = async () => {
      try {
        console.log("VendorManagement: Attempting to fetch vendors");
        setLoading(true);
        
        const result = await vendorsService.getVendors();
        
        if (result.status !== 200 || !result.data) {
          throw new Error(result.message || 'Failed to fetch vendors');
        }
        
        // Only update state if component is still mounted
        if (isMounted) {
          // Filter and transform API data
          const processedVendors = result.data
            .filter((vendor: any) => {
              // Only include vendors with valid data
              return vendor && 
                     vendor.id && 
                     vendor.businessName && 
                     vendor.businessName.trim() !== '' &&
                     vendor.user && 
                     vendor.user.email &&
                     vendor.user.email.trim() !== '';
            })
            .map((vendor: any) => ({
              id: vendor.id,
              userId: vendor.user?.id, // Add user ID for deletion
              company_name: vendor.businessName,
              email: vendor.user?.email,
              is_verified: vendor.user?.isVerified || false,
              status: isValidVendorStatus(vendor.vendorStatus) ? vendor.vendorStatus : 'pending',
              is_managed: false,
              commission_rate: vendor.commissionRate ? parseFloat(vendor.commissionRate) : null,
              commissionRate: vendor.commissionRate ? parseFloat(vendor.commissionRate) : null,
              date_joined: vendor.user?.createdAt,
              created_at: vendor.user?.createdAt,
              service_count: vendor.servicesCount || 0,
              servicesCount: vendor.servicesCount || 0,
              is_ghost_brand: false,
              phone: vendor.phone,
              address: vendor.fullAddress,
              businessLicense: vendor.businessLicense,
              foodHandlerCertification: vendor.foodHandlerCertification,
              healthPermit: vendor.healthPermit,
              liabilityInsurance: vendor.liabilityInsurance,
              firstName: vendor.user?.firstName,
              lastName: vendor.user?.lastName
            }));
          
          setVendors(processedVendors);
          console.log("VendorManagement: Vendors data loaded", processedVendors);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching vendors:", error);
          const errorMessage = error.response?.data?.message || "Failed to load vendors";
          toast.error(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchVendors();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    vendors,
    loading,
    setVendors,
    isValidVendorStatus
  };
}
