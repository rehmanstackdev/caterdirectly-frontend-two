
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useBackendVendorProfile } from '@/hooks/use-backend-vendor-profile';

// Cache invalidation function for service caches
const invalidateServiceCaches = (vendorId: string) => {
  // Clear unified marketplace cache
  if (typeof window !== 'undefined' && (window as any).clearServiceCaches) {
    (window as any).clearServiceCaches(vendorId);
  }
  
  // Dispatch custom event for cache invalidation
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('vendor-address-updated', { 
      detail: { vendorId } 
    }));
  }
};

export function useVendorProfile(vendorId: string) {
  const { data: backendVendor, isLoading: loading, error: queryError } = useBackendVendorProfile(vendorId);
  const [error, setError] = useState<string | null>(null);
  
  // Transform backend vendor data to match existing interface
  const vendor = backendVendor ? {
    id: backendVendor.id,
    business_name: backendVendor.businessName,
    phone: backendVendor.phone,
    address: backendVendor.address,
    city: backendVendor.city,
    state: backendVendor.state,
    zip_code: backendVendor.zipCode,
    full_address: backendVendor.fullAddress,
    ein_tin: backendVendor.einTin,
    licenses: backendVendor.licenses,
    insurance_policies: backendVendor.insurance_policies,
    service_types: backendVendor.serviceTypes,
    website: backendVendor.website,
    coordinates_lat: backendVendor.coordinates?.lat,
    coordinates_lng: backendVendor.coordinates?.lng,
    certifications: backendVendor.certifications,
    service_area_certifications: backendVendor.service_area_certifications,
    business_license: backendVendor.businessLicense,
    food_handler_certification: backendVendor.foodHandlerCertification,
    health_permit: backendVendor.healthPermit,
    liability_insurance: backendVendor.liabilityInsurance,
    terms_accepted: backendVendor.termsAccepted,
    vendor_status: backendVendor.vendorStatus,
    commissionRate: backendVendor.commissionRate,
    commission_rate: backendVendor.commissionRate,
    accountHolderName: backendVendor.accountHolderName,
    bankName: backendVendor.bankName,
    accountType: backendVendor.accountType,
    routingNumber: backendVendor.routingNumber,
    accountNumber: backendVendor.accountNumber,
    businessDescription: backendVendor.businessDescription,
    stripeConnectAccountId: backendVendor.stripeConnectAccountId,
    user: backendVendor.user,
    // Support both snake_case and camelCase for status
    status: backendVendor.vendorStatus,
    vendorStatus: backendVendor.vendorStatus
  } : null;
  
  useEffect(() => {
    if (queryError) {
      const errorMessage = (queryError as any)?.response?.data?.message || 'Failed to load vendor profile';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  }, [queryError]);

  const updateVendorAddress = async (addressData: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
    full_address: string;
    coordinates_lat: number;
    coordinates_lng: number;
  }) => {
    if (!vendor) return false;

    try {
      const { error } = await supabase
        .from('vendors')
        .update(addressData)
        .eq('id', vendorId);

      if (error) {
        console.error('Error updating vendor address:', error);
        toast({
          title: 'Error',
          description: 'Failed to update vendor address',
          variant: 'destructive'
        });
        return false;
      }

      // Update local state
      setVendor(prev => prev ? { ...prev, ...addressData } : null);
      
      // Invalidate service caches to ensure address updates appear everywhere
      invalidateServiceCaches(vendorId);
      
      toast({
        title: 'Success',
        description: 'Vendor address updated successfully'
      });
      return true;
    } catch (err) {
      console.error('Unexpected error updating vendor address:', err);
      toast({
        title: 'Error',
        description: 'Failed to update vendor address',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    vendor,
    loading,
    error,
    updateVendorAddress
  };
}
