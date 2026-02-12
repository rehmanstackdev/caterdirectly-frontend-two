import React from 'react';
import { ServiceFormData } from '@/hooks/vendor/types/form-types';
import ServiceAdditionsForm from '../catering/ServiceAdditionsForm';

interface CateringAdditionsStepProps {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  showErrors?: boolean;
}

const CateringAdditionsStep: React.FC<CateringAdditionsStepProps> = ({
  formData,
  updateFormData,
  showErrors = false
}) => {
  const handleUpdateAdditions = (serviceAdditions: any) => {
    updateFormData({
      cateringDetails: {
        ...formData.cateringDetails,
        serviceAdditions
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Service Additions</h2>
        <p className="text-gray-600 mt-2">
          Configure additional services and fees.
        </p>
      </div>
      
      <ServiceAdditionsForm
        serviceAdditions={formData.cateringDetails?.serviceAdditions || {
          providesUtensils: true,
          utensilsFee: 0,
          providesPlates: true,
          platesFee: 0,
          providesNapkins: true,
          napkinsFee: 0,
          providesServingUtensils: true,
          servingUtensilsFee: 0,
          providesLabels: false
        }}
        onUpdate={handleUpdateAdditions}
      />
    </div>
  );
};

export default CateringAdditionsStep;