
import React from 'react';
import { ServiceFormData } from '@/hooks/vendor/types/form-types';
import ServicePricing from '@/components/vendor/services/form/ServicePricing';

interface PricingStepProps {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  showErrors?: boolean;
}

const PricingStep: React.FC<PricingStepProps> = ({ 
  formData, 
  updateFormData,
  showErrors = false
}) => {
  return (
    <ServicePricing 
      formData={formData} 
      updateFormData={updateFormData} 
      showErrors={showErrors}
    />
  );
};

export default PricingStep;
