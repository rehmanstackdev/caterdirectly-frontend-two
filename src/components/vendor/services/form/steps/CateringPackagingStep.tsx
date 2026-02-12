import React from 'react';
import { ServiceFormData } from '@/hooks/vendor/types/form-types';
import PackagingOptionsForm from '../catering/PackagingOptionsForm';

interface CateringPackagingStepProps {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  showErrors?: boolean;
}

const CateringPackagingStep: React.FC<CateringPackagingStepProps> = ({
  formData,
  updateFormData,
  showErrors = false
}) => {
  const handleUpdatePackaging = (packagingOptions: any) => {
    updateFormData({
      cateringDetails: {
        ...formData.cateringDetails,
        packagingOptions
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Packaging Options</h2>
        <p className="text-gray-600 mt-2">
          Configure your packaging options and fees.
        </p>
      </div>
      
      <PackagingOptionsForm
        packagingOptions={formData.cateringDetails?.packagingOptions || {
          disposable: true,
          disposableFee: 0,
          reusable: false,
          reusableFeeType: 'flat_rate',
          reusableServiceFeePercentage: 0,
          reusableServiceFeeFlatRate: 0
        }}
        onUpdate={handleUpdatePackaging}
      />
    </div>
  );
};

export default CateringPackagingStep;