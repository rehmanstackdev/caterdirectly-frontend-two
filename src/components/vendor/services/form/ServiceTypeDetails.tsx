
import React, { useEffect } from 'react';
import { ServiceType } from '@/types/service-types';
import CateringServiceDetails from './catering/CateringServiceDetails';
import VenueServiceDetails from './venue/VenueServiceDetails';
import PartyRentalServiceDetails from './rental/PartyRentalServiceDetails';
import StaffServiceDetails from './staff/StaffServiceDetails';

interface ServiceTypeDetailsProps {
  serviceType: ServiceType;
  formData: any;
  updateFormData: (data: any) => void;
  showErrors?: boolean;
}

const ServiceTypeDetails: React.FC<ServiceTypeDetailsProps> = ({
  serviceType,
  formData,
  updateFormData,
  showErrors = false
}) => {
  useEffect(() => {
    console.log(`ServiceTypeDetails rendering with serviceType: ${serviceType}`);
    console.log('Current formData:', formData);
  }, [serviceType, formData]);

  // Enhanced update handlers for each service type
  const handleCateringUpdate = (data: any) => {
    console.log('Updating catering details:', data);
    // Create a new object reference for the cateringDetails to ensure React detects the change
    const updatedDetails = { ...formData.cateringDetails, ...data };
    updateFormData({ cateringDetails: updatedDetails });
  };

  const handleVenueUpdate = (data: any) => {
    console.log('=== VENUE UPDATE HANDLER ===');
    console.log('Updating venue details with:', data);
    console.log('Current venue details:', formData.venueDetails);
    // Create a new object reference for the venueDetails to ensure React detects the change
    const updatedDetails = { ...formData.venueDetails, ...data };
    console.log('Updated venue details:', updatedDetails);
    updateFormData({ venueDetails: updatedDetails });
    console.log('=== END VENUE UPDATE ===');
  };

  const handleRentalUpdate = (data: any) => {
    console.log('Updating rental details:', data);
    // Create a new object reference for the rentalDetails to ensure React detects the change
    const updatedDetails = { ...formData.rentalDetails, ...data };
    updateFormData({ rentalDetails: updatedDetails });
  };

  const handleStaffUpdate = (data: any) => {
    console.log('Updating staff details:', data);
    // Create a new object reference for the staffDetails to ensure React detects the change
    const updatedDetails = { ...formData.staffDetails, ...data };
    updateFormData({ staffDetails: updatedDetails });
  };

  console.log('=== SERVICE TYPE SWITCH DEBUG ===');
  console.log('serviceType value:', serviceType);
  console.log('serviceType type:', typeof serviceType);
  console.log('=== END SWITCH DEBUG ===');

  switch (serviceType) {
    case 'catering':
      return (
        <div className="space-y-2">
          {showErrors && (!formData.cateringDetails || !formData.cateringDetails.serviceStyles || formData.cateringDetails.serviceStyles.length === 0) && (
            <p className="text-sm text-destructive">Select at least one service style</p>
          )}
          <CateringServiceDetails
            formData={formData.cateringDetails || {}}
            updateFormData={handleCateringUpdate}
          />
        </div>
      );
    case 'venues':
      console.log('=== RENDERING VENUE SERVICE DETAILS ===');
      console.log('Venue details being passed:', formData.venueDetails);
      console.log('=== END VENUE RENDER DEBUG ===');
      return (
        <VenueServiceDetails
          formData={formData.venueDetails || {}}
          updateFormData={handleVenueUpdate}
        />
      );
    case 'party_rentals':
    case 'party-rentals':
      console.log('=== RENDERING PARTY RENTAL SERVICE DETAILS ===');
      return (
        <PartyRentalServiceDetails
          formData={formData.rentalDetails || {}}
          updateFormData={handleRentalUpdate}
        />
      );
    case 'events_staff':
    case 'events-staff':
    case 'staff':
      return (
        <StaffServiceDetails
          formData={formData.staffDetails || {}}
          updateFormData={handleStaffUpdate}
        />
      );
    default:
      console.log('=== DEFAULT CASE HIT ===');
      console.log('Unrecognized serviceType:', serviceType);
      return <div>Please select a service type first (serviceType: {serviceType})</div>;
  }
};

export default ServiceTypeDetails;
