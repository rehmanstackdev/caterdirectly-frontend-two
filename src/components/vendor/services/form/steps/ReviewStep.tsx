
import React from 'react';
import { ServiceFormData, VendorInfo } from '@/hooks/vendor/types/form-types';
import ServiceReviewSubmit from '@/components/vendor/services/form/ServiceReviewSubmit';

interface ReviewStepProps {
  formData: ServiceFormData;
  vendorInfo: VendorInfo;
  onSubmit: () => void;
  adminContext?: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  formData, 
  vendorInfo, 
  onSubmit, 
  adminContext = false 
}) => {
  return (
    <ServiceReviewSubmit 
      formData={formData} 
      isValid={true} 
      onSubmit={onSubmit} 
      submitForApproval={true}
      vendorInfo={vendorInfo}
      adminContext={adminContext}
    />
  );
};

export default ReviewStep;
