
import React from 'react';
import { ServiceFormData } from '@/hooks/vendor/types/form-types';
import ServiceTypeDetails from '@/components/vendor/services/form/ServiceTypeDetails';

interface ServiceTypeStepProps {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  showErrors?: boolean;
}

const ServiceTypeStep: React.FC<ServiceTypeStepProps> = ({ 
  formData, 
  updateFormData,
  showErrors = false
}) => {
  return (
    <ServiceTypeDetails 
      serviceType={formData.type} 
      formData={formData} 
      updateFormData={updateFormData} 
      showErrors={showErrors}
    />
  );
};

export default ServiceTypeStep;
