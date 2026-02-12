
import React from 'react';
import { CateringServiceDetails } from '@/types/service-types';
import CateringServiceStyles from './CateringServiceStyles';
import CateringMinimumOrder from './CateringMinimumOrder';
import CateringGuestLimits from './CateringGuestLimits';
import CateringLeadTime from './CateringLeadTime';
import CateringCuisineTypes from './CateringCuisineTypes';

interface CateringBasicInfoProps {
  formData: Partial<CateringServiceDetails>;
  updateFormData: (data: Partial<CateringServiceDetails>) => void;
}

const CateringBasicInfo: React.FC<CateringBasicInfoProps> = ({
  formData,
  updateFormData
}) => {
  return (
    <>
      <CateringServiceStyles 
        serviceStyles={formData.serviceStyles || []} 
        onServiceStyleChange={(styles) => updateFormData({ serviceStyles: styles })} 
      />

      <CateringCuisineTypes
        cuisineTypes={formData.cuisineTypes || []}
        onCuisineTypesChange={(types) => updateFormData({ cuisineTypes: types })}
      />
      
      <CateringMinimumOrder 
        minimumOrderAmount={formData.minimumOrderAmount} 
        onMinOrderChange={(value) => updateFormData({ minimumOrderAmount: value })}
      />
      
      <CateringGuestLimits 
        minGuests={formData.minGuests}
        maxGuests={formData.maxGuests}
        onMinGuestsChange={(value) => updateFormData({ minGuests: value })}
        onMaxGuestsChange={(value) => updateFormData({ maxGuests: value })}
      />
      
      <CateringLeadTime 
        leadTimeHours={formData.leadTimeHours}
        onLeadTimeChange={(value) => updateFormData({ leadTimeHours: value })}
      />
    </>
  );
};

export default CateringBasicInfo;
