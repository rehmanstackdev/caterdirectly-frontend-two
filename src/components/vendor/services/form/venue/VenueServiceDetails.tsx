
import React, { useEffect } from 'react';
import { VenueServiceDetails as VenueDetails } from '@/types/service-types';
import VenueCapacity from './VenueCapacity';
import VenueType from './VenueType';
import VenueAmenities from './VenueAmenities';
import VenueRestrictions from './VenueRestrictions';
import VenueAccessibility from './VenueAccessibility';
import VenueInsuranceRequirements from './VenueInsuranceRequirements';
import VenueLicenseRequirements from './VenueLicenseRequirements';
import VenueVendorPolicy from './VenueVendorPolicy';

interface VenueServiceDetailsProps {
  formData: Partial<VenueDetails>;
  updateFormData: (data: Partial<VenueDetails>) => void;
}

const VenueServiceDetails: React.FC<VenueServiceDetailsProps> = ({ formData, updateFormData }) => {
  // Log the formData to help with debugging
  useEffect(() => {
    console.log('VenueServiceDetails formData:', formData);
  }, [formData]);

  // Create a safe update method to ensure we're properly updating data
  const safeUpdateFormData = (key: string, value: any) => {
    console.log(`VenueServiceDetails updating ${key}:`, value);
    const update = { [key]: value };
    updateFormData(update);
  };

  return (
    <div className="space-y-6">
      <VenueCapacity 
        seatedCapacity={formData.capacity?.seated !== undefined ? formData.capacity.seated : ''}
        standingCapacity={formData.capacity?.standing !== undefined ? formData.capacity.standing : ''}
        updateCapacity={(seated, standing) => {
          const seatedNumber = typeof seated === 'string' ? parseInt(seated) || 0 : seated;
          const standingNumber = typeof standing === 'string' ? parseInt(standing) || 0 : standing;
          
          updateFormData({
            capacity: {
              seated: seatedNumber,
              standing: standingNumber
            }
          });
          console.log('Updated venue capacity:', { seated: seatedNumber, standing: standingNumber });
        }}
      />
      
      <VenueType 
        indoorOutdoor={formData.indoorOutdoor || 'both'}
        updateIndoorOutdoor={(value) => {
          safeUpdateFormData('indoorOutdoor', value);
        }}
      />
      
      <VenueAmenities 
        amenities={formData.amenities || []}
        updateAmenities={(amenities) => {
          safeUpdateFormData('amenities', amenities);
        }}
      />
      
      <VenueRestrictions 
        restrictions={formData.restrictions || []}
        updateRestrictions={(restrictions) => {
          safeUpdateFormData('restrictions', restrictions);
        }}
      />
      
      <VenueAccessibility 
        accessibilityFeatures={formData.accessibilityFeatures || []}
        updateAccessibilityFeatures={(accessibilityFeatures) => {
          safeUpdateFormData('accessibilityFeatures', accessibilityFeatures);
        }}
      />
      
      <VenueInsuranceRequirements 
        insuranceRequirements={formData.insuranceRequirements || []}
        updateInsuranceRequirements={(insuranceRequirements) => {
          safeUpdateFormData('insuranceRequirements', insuranceRequirements);
        }}
      />
      
      <VenueLicenseRequirements 
        licenseRequirements={formData.licenseRequirements || []}
        updateLicenseRequirements={(licenseRequirements) => {
          safeUpdateFormData('licenseRequirements', licenseRequirements);
        }}
      />
      
      <VenueVendorPolicy 
        vendorPolicy={formData.vendorPolicy || 'platform_open'}
        updateVendorPolicy={(vendorPolicy) => {
          safeUpdateFormData('vendorPolicy', vendorPolicy);
        }}
      />
    </div>
  );
};

export default VenueServiceDetails;
