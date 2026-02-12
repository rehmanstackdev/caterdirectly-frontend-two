import React from 'react';
import { ServiceFormData } from '@/hooks/vendor/types/form-types';
import DeliveryOptionsForm from '../catering/DeliveryOptionsForm';

interface CateringDeliveryStepProps {
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  showErrors?: boolean;
}

const CateringDeliveryStep: React.FC<CateringDeliveryStepProps> = ({
  formData,
  updateFormData,
  showErrors = false
}) => {
  const handleUpdateDelivery = (deliveryOptions: any) => {
    updateFormData({
      cateringDetails: {
        ...formData.cateringDetails,
        deliveryOptions
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Delivery Options</h2>
        <p className="text-gray-600 mt-2">
          Set up your delivery and pickup options.
        </p>
      </div>
      
      <DeliveryOptionsForm
        deliveryOptions={formData.cateringDetails?.deliveryOptions || {
          delivery: true,
          pickup: true,
          deliveryRanges: [{ range: '0-5 miles', fee: 0 }],
          deliveryMinimum: 0
        }}
        onUpdate={handleUpdateDelivery}
      />
    </div>
  );
};

export default CateringDeliveryStep;