
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { VendorInfo } from './types/form-types';
import vendorService from '@/services/api/vendor/vendor.Service';

interface VendorContextResult {
  vendorInfo: VendorInfo;
  isLoading: boolean;
  error: string | null;
  hasVendorAccess: boolean;
}

export function useCurrentVendorContext(): VendorContextResult {
  const { user, userRole } = useAuth();
  const [vendorInfo, setVendorInfo] = useState<VendorInfo>({ vendorName: '', vendorId: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasVendorAccess, setHasVendorAccess] = useState(false);

  useEffect(() => {
    const fetchVendorContext = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if user has vendor role
        if (userRole === 'vendor') {
          console.log('[useCurrentVendorContext] User has vendor role, fetching vendor data');
          
          try {
            // Get vendor data from backend API
            const vendorData = await vendorService.getVendorByUserId(user.id);
            
            if (vendorData && vendorData.id) {
              console.log('[useCurrentVendorContext] Found vendor:', vendorData);
              setVendorInfo({
                vendorId: vendorData.id,
                vendorName: vendorData.businessName || `Vendor ${vendorData.id.substring(0, 8)}`
              });
              
              // Store in session for persistence
              sessionStorage.setItem('selected_vendor_id', vendorData.id);
              sessionStorage.setItem('selected_vendor_name', vendorData.businessName || '');
              sessionStorage.setItem('vendor_validation_complete', 'true');
              
              setHasVendorAccess(true);
            } else {
              setError('No vendor account found for this user');
              setHasVendorAccess(false);
            }
          } catch (vendorError: any) {
            console.error('[useCurrentVendorContext] Error fetching vendor:', vendorError);
            setError('Unable to find vendor account for this user');
            setHasVendorAccess(false);
          }
        } else if (userRole === 'admin' || userRole === 'super_admin') {
          // Admin users have vendor access but no specific vendor context
          setHasVendorAccess(true);
          console.log('[useCurrentVendorContext] Admin user has vendor access');
        } else {
          // Regular users don't have vendor access
          setHasVendorAccess(false);
          console.log('[useCurrentVendorContext] User does not have vendor access');
        }
      } catch (err) {
        console.error('[useCurrentVendorContext] Unexpected error:', err);
        setError('Failed to fetch vendor context');
        setHasVendorAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorContext();
  }, [user, userRole]);

  return {
    vendorInfo,
    isLoading,
    error,
    hasVendorAccess
  };
}
