
import { useState } from 'react';
import { ServiceFormData, VendorInfo } from '../types/form-types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useDraftHandler() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const handleSaveDraft = async (
    formData: ServiceFormData, 
    vendorInfo: VendorInfo,
    adminContext: boolean = false
  ) => {
    console.log("Draft functionality not implemented with backend APIs yet");
    
    toast.info("Draft functionality will be implemented in the next update");
    
    // For now, redirect without saving
    if (adminContext) {
      navigate('/admin/services');
    } else {
      navigate('/vendor/services');
    }
  };
  
  return {
    isSubmitting,
    handleSaveDraft
  };
}
