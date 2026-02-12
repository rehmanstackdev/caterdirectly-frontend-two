
import { useEffect, useState } from 'react';
import { VendorInfo } from './types/form-types';
import { useCurrentVendorContext } from './use-current-vendor-context';
import { toast } from '@/hooks/use-toast';

export function useEnhancedVendorValidation(
  vendorIdParam: string | null,
  setVendorInfo: (info: VendorInfo) => void,
  setIsInitialized: (value: boolean) => void,
  adminContext: boolean = false
) {
  const [isValidating, setIsValidating] = useState(false);
  const { vendorInfo: currentVendorInfo, isLoading: contextLoading, hasVendorAccess } = useCurrentVendorContext();
  
  useEffect(() => {
    // Skip if still loading context (but allow if we have vendorIdParam to process)
    if (contextLoading && !vendorIdParam) {
      console.log("[useEnhancedVendorValidation] Waiting for context to load");
      return;
    }

    const validateVendor = async () => {
      if (isValidating) return;
      
      setIsValidating(true);
      
      try {
        // Priority 1: Use vendor ID from URL parameter (admin context)
        if (vendorIdParam) {
          console.log("[useEnhancedVendorValidation] Using vendor ID from URL:", vendorIdParam);
          
          // Check if vendorInfo is already set for this vendorId
          const storedVendorId = sessionStorage.getItem('selected_vendor_id');
          const storedVendorName = sessionStorage.getItem('selected_vendor_name');
          
          if (storedVendorId === vendorIdParam && storedVendorName) {
            // Already validated, just set the info
            console.log("[useEnhancedVendorValidation] Using stored vendor info");
            setVendorInfo({
              vendorId: vendorIdParam,
              vendorName: storedVendorName
            });
            setIsInitialized(true);
          } else {
            // For admin context with vendorIdParam, set vendorInfo directly
            // The vendor ID was already validated in CreateVendorService component
            const vendorName = storedVendorName || `Vendor ${vendorIdParam.substring(0, 8)}`;
            
            setVendorInfo({
              vendorId: vendorIdParam,
              vendorName: vendorName
            });
            setIsInitialized(true);
            
            sessionStorage.setItem('selected_vendor_id', vendorIdParam);
            if (vendorName) {
              sessionStorage.setItem('selected_vendor_name', vendorName);
            }
            sessionStorage.setItem('vendor_validation_complete', 'true');
          }
          
          console.log("[useEnhancedVendorValidation] Vendor info set for admin context:", {
            vendorId: vendorIdParam,
            vendorName: storedVendorName || `Vendor ${vendorIdParam.substring(0, 8)}`
          });
          
          setIsValidating(false);
          return;
        }
        
        // Priority 2: Use current user's vendor context (vendor users)
        if (currentVendorInfo.vendorId) {
          console.log("[useEnhancedVendorValidation] Using current user's vendor context:", currentVendorInfo);
          
          setVendorInfo(currentVendorInfo);
          setIsInitialized(true);
          
          sessionStorage.setItem('selected_vendor_id', currentVendorInfo.vendorId);
          sessionStorage.setItem('selected_vendor_name', currentVendorInfo.vendorName);
          sessionStorage.setItem('vendor_validation_complete', 'true');
          
          if (!adminContext) {
            toast({
              title: "Vendor Context Loaded",
              description: `Creating service for ${currentVendorInfo.vendorName}`,
            });
          }
          
          return;
        }
        
        // Priority 3: Check if user has vendor access but no context (admin users)
        if (hasVendorAccess && adminContext) {
          console.log("[useEnhancedVendorValidation] Admin user - waiting for vendor selection");
          // Admin users will need to select a vendor via URL or other means
          return;
        }
        
        // No vendor context available
        console.warn("[useEnhancedVendorValidation] No vendor context available");
        
      } catch (error) {
        console.error("[useEnhancedVendorValidation] Error in validation:", error);
      } finally {
        setIsValidating(false);
      }
    };

    validateVendor();
  }, [vendorIdParam, currentVendorInfo.vendorId, contextLoading, hasVendorAccess, setVendorInfo, setIsInitialized, adminContext, isValidating]);
  
  return { 
    isValidating: isValidating || contextLoading,
    hasVendorAccess,
    currentVendorInfo
  };
}
