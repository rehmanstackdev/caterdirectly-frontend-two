
import React from 'react';
import { ServiceFormData, VendorInfo } from '@/hooks/vendor/types/form-types';
import ServiceBasicInfo from '@/components/vendor/services/form/ServiceBasicInfo';

interface BasicInfoStepProps {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  showErrors?: boolean;
  vendorId?: string;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ 
  formData, 
  updateFormData,
  showErrors = false,
  vendorId
}) => {
  return (
    <ServiceBasicInfo 
      formData={formData} 
      updateFormData={updateFormData} 
      showErrors={showErrors}
      vendorId={vendorId}
    />
  );
};

export default BasicInfoStep;
