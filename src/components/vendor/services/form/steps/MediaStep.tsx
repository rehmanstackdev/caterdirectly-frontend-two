
import React from 'react';
import { ServiceFormData } from '@/hooks/vendor/types/form-types';
import ServiceMedia from '@/components/vendor/services/form/ServiceMedia';

interface MediaStepProps {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  showErrors?: boolean;
}

const MediaStep: React.FC<MediaStepProps> = ({ 
  formData, 
  updateFormData,
  showErrors = false
}) => {
  const isVenue = formData.type === 'venues';
  return (
    <ServiceMedia 
      formData={formData} 
      updateFormData={updateFormData} 
      showErrors={showErrors}
      minImages={1}
      maxImages={isVenue ? 10 : 1}
      serviceType={formData.type}
    />
  );
};

export default MediaStep;
