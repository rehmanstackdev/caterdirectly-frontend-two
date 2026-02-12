
import { useState } from 'react';
import { ServiceFormData, VendorInfo } from './types/form-types';
import { useServiceHandlers } from './service-handlers';

import { toast } from 'sonner';

export function useServiceSubmission() {
  const {
    isSubmitting,
    handleSaveDraft,
    handleSubmitForApproval
  } = useServiceHandlers();

  const [vendorError, setVendorError] = useState<boolean>(false);
  
  // Wrapper for handleSaveDraft with additional vendor validation
  const saveAsDraft = async (
    formData: ServiceFormData, 
    vendorInfo: VendorInfo,
    adminContext: boolean = false
  ) => {
    // Use vendorId from vendorInfo (set by admin interface or vendor context)
    const vendorId = vendorInfo.vendorId;
    if (!vendorId) {
      console.error("Cannot save draft: Missing vendorId in vendorInfo", vendorInfo);
      toast.error("Vendor information is required to save a draft.");
      setVendorError(true);
      return false;
    }
    
    console.log("Saving draft with vendor info:", vendorInfo);
    setVendorError(false);
    
    try {
      // Call the original handler
      await handleSaveDraft(formData, vendorInfo, adminContext);
      
      // Success toast notification
      toast.success("Your service has been saved as a draft.");
      
      return true;
    } catch (error: any) {
      console.error("Error saving draft:", error);
      const message = error?.response?.data?.message || error?.message || "An unexpected error occurred.";
      toast.error(message);
      return false;
    }
  };
  
  // Wrapper for handleSubmitForApproval with additional vendor validation
  const submitForApproval = async (
    formData: ServiceFormData,
    vendorInfo: VendorInfo,
    adminContext: boolean = false,
    isEditMode: boolean = false
  ) => {
    // Use vendorId from vendorInfo (set by admin interface or vendor context)
    const vendorId = vendorInfo.vendorId;
    if (!vendorId) {
      console.error("Cannot submit: Missing vendorId in vendorInfo", vendorInfo);
      toast.error("Vendor information is required to submit a service.");
      setVendorError(true);
      return false;
    }

    console.log("Submitting for approval with vendor info:", vendorInfo);
    setVendorError(false);

    try {
      // Call the original handler with vendorId override
      // Toast is shown in use-approval-handler.ts with API response message
      await handleSubmitForApproval(formData, vendorInfo, adminContext, vendorId);

      return true;
    } catch (error: any) {
      console.error("Error submitting for approval:", error);
      const message = error?.response?.data?.message || error?.message || "An unexpected error occurred.";
      toast.error(message);
      return false;
    }
  };

  return {
    isSubmitting,
    handleSaveDraft: saveAsDraft,
    handleSubmitForApproval: submitForApproval,
    vendorError
  };
}
