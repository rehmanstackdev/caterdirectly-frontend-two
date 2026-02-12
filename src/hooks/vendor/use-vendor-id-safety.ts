
import { useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { VendorInfo } from './types/form-types';

/**
 * This hook enforces vendor ID safety by checking for a valid vendor ID
 * from different sources and storing it in session storage
 */
export function useVendorIdSafety(
  vendorIdParam: string | null,
  vendorInfo: VendorInfo,
  setVendorInfo: (info: VendorInfo) => void,
  setIsInitialized: (value: boolean) => void,
  adminContext: boolean
) {
  const [pendingValidation, setPendingValidation] = useState(false);

  // Enhanced safety check for vendorId at mount and whenever form data changes
  useEffect(() => {
    // Skip this process if we're already initialized with valid data
    if (vendorInfo.vendorId && !pendingValidation) {
      console.log("[useVendorIdSafety] Already initialized with vendorId:", vendorInfo.vendorId);
      return;
    }

    // Prevent duplicate validation calls
    if (pendingValidation) return;
    setPendingValidation(true);
    
    // Get vendorId from all possible sources
    const effectiveVendorId = vendorIdParam || 
                            sessionStorage.getItem('selected_vendor_id');
    
    // Check if we have a valid vendor ID from any source
    if (effectiveVendorId) {
      console.log("[useVendorIdSafety] Setting vendor ID from available sources:", effectiveVendorId);
      
      // Store in session for resilience
      sessionStorage.setItem('selected_vendor_id', effectiveVendorId);
      
      // Set the vendor ID directly to ensure it's available for submission
      setVendorInfo({
        vendorId: effectiveVendorId,
        vendorName: vendorInfo.vendorName || sessionStorage.getItem('selected_vendor_name') || "Loading vendor name..."
      });
      
      // Mark as initialized to prevent overriding
      setIsInitialized(true);
      
      // Mark validation process as complete
      sessionStorage.setItem('vendor_validation_complete', 'true');
      setPendingValidation(false);
    } else {
      // Last resort: If we're in admin context and still don't have a vendor ID, show an error
      if (adminContext) {
        console.error("[useVendorIdSafety] No vendor ID available from any source in admin context");
        toast({
          title: "Missing Vendor",
          description: "No vendor information available. Please return to vendor management.",
          variant: "destructive"
        });
      }
      setPendingValidation(false);
    }
  }, [vendorIdParam, vendorInfo.vendorId, setVendorInfo, setIsInitialized, adminContext, pendingValidation]);
}
