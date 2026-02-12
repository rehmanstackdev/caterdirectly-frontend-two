import React from 'react';
import { ServiceFormData } from '@/hooks/vendor/types/form-types';
import CateringServiceDetails from '../catering/CateringServiceDetails';

interface CateringMenuStepProps {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  showErrors?: boolean;
}

const CateringMenuStep: React.FC<CateringMenuStepProps> = ({
  formData,
  updateFormData,
  showErrors = false
}) => {
  const handleUpdateCateringDetails = (cateringDetails: any) => {
    updateFormData({ 
      cateringDetails: {
        ...formData.cateringDetails,
        ...cateringDetails
      },
      // Also update main form combo fields if they exist in cateringDetails
      ...(cateringDetails.hasCombo !== undefined && { hasCombo: cateringDetails.hasCombo }),
      ...(cateringDetails.combos !== undefined && { combos: cateringDetails.combos })
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Menu Items</h2>
        <p className="text-gray-600 mt-2">
          Add your menu items with pricing, dietary information, and images.
        </p>
      </div>
      
      <CateringServiceDetails
        formData={formData.cateringDetails || {}}
        updateFormData={handleUpdateCateringDetails}
      />
    </div>
  );
};

export default CateringMenuStep;