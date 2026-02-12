
import { useEffect, useState } from 'react';
import { VendorInfo } from './types/form-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useVendorValidation(
  vendorIdParam: string | null,
  setVendorInfo: (info: VendorInfo) => void,
  setIsInitialized: (value: boolean) => void,
  adminContext: boolean = false
) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationAttempts, setValidationAttempts] = useState(0);
  
  useEffect(() => {
    // Skip validation if we've already completed it earlier in this session
    if (sessionStorage.getItem('vendor_validation_complete') === 'true') {
      console.log("[useVendorValidation] Skipping validation - already completed");
      return;
    }
    
    const validateVendorId = async () => {
      // Try to get vendor ID from different sources
      const effectiveVendorId = vendorIdParam || sessionStorage.getItem('selected_vendor_id');
      
      // Log the effective vendor ID for debugging
      console.log("[useVendorValidation] Effective vendor ID:", {
        fromParam: vendorIdParam,
        fromSession: sessionStorage.getItem('selected_vendor_id'),
        used: effectiveVendorId
      });
      
      // Only proceed if we have a vendor ID
      if (!effectiveVendorId) {
        console.log("No vendor ID available from any source, skipping validation");
        return;
      }
      
      // Prevent double validation
      if (isValidating) {
        console.log("[useVendorValidation] Already validating, skipping duplicate attempt");
        return;
      }
      
      try {
        setIsValidating(true);
        console.log(`[Attempt ${validationAttempts + 1}] Validating vendor ID:`, effectiveVendorId);
        
        // Fetch vendor details from database
        const { data: vendor, error } = await supabase
          .from('vendors')
          .select('id, company_name')
          .eq('id', effectiveVendorId)
          .single();
          
        if (error) {
          console.error("Error validating vendor ID:", error);
          
          if (!adminContext) {
            toast({
              title: "Invalid Vendor ID",
              description: "The specified vendor could not be found.",
              variant: "destructive"
            });
          }
          
          return;
        }
        
        if (vendor) {
          console.log("Vendor found:", vendor);
          
          // Ensure we never use 'Unknown Vendor' as a vendor name
          const vendorName = vendor.company_name || 
                           sessionStorage.getItem('selected_vendor_name') || 
                           `Vendor ${vendor.id.substring(0, 8)}`;
          
          // Set the vendor info in form context with complete information
          setVendorInfo({
            vendorId: vendor.id,
            vendorName: vendorName
          });
          
          // Save to session storage for resilience
          sessionStorage.setItem('selected_vendor_id', vendor.id);
          sessionStorage.setItem('selected_vendor_name', vendorName);
          sessionStorage.setItem('vendor_validation_complete', 'true');
          
          // Mark as initialized to prevent overriding by auth context
          setIsInitialized(true);
          
          console.log("Vendor info set successfully:", {
            id: vendor.id,
            name: vendorName
          });
          
          // Success message in admin context
          if (adminContext) {
            toast({
              title: "Vendor Validated",
              description: `Creating service for ${vendorName}`,
            });
          }
        } else {
          console.warn("No vendor found with ID:", effectiveVendorId);
          // Don't set partial vendor info
        }
      } catch (error) {
        console.error("Error in validateVendorId:", error);
        
        // Retry validation a few times if it fails, with exponential backoff
        if (validationAttempts < 2) {
          console.log("Retrying vendor validation...");
          setValidationAttempts(prev => prev + 1);
          setTimeout(() => validateVendorId(), 1000 * (validationAttempts + 1)); // Increased backoff
        }
      } finally {
        setIsValidating(false);
      }
    };
    
    // Run validation with any available vendor ID
    validateVendorId();
  }, [vendorIdParam, setVendorInfo, setIsInitialized, adminContext, validationAttempts, isValidating]);
  
  return { isValidating };
}
