
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { VendorInfo } from '@/hooks/vendor/types/form-types';

interface ServiceFormHeaderProps {
  mode: 'create' | 'edit';
  currentStep: number;
  totalSteps: number;
  serviceType: string;
  adminContext?: boolean;
  vendorInfo: VendorInfo;
}

const ServiceFormHeader: React.FC<ServiceFormHeaderProps> = ({
  mode,
  currentStep,
  totalSteps,
  serviceType,
  adminContext = false,
  vendorInfo
}) => {
  // Calculate the display step number based on service type and current step
  const getDisplayStep = (step: number, serviceType: string): string => {
    if (serviceType === 'catering') {
      // For catering, we skip step 2 (pricing), so adjust the displayed step
      if (step === 1) return "1";
      if (step === 2) return "2 (Service Details)";
      if (step === 3) return "3 (Media)";
      if (step === 4) return "4 (Review)";
    }
    
    // For other service types, display the normal step number
    return step.toString();
  };

  return (
    <CardTitle>
      {mode === 'create' ? 'Create New Service' : 'Edit Service'} - Step {getDisplayStep(currentStep, serviceType)} of {totalSteps}
      {adminContext && <span className="text-green-600 ml-2">(Admin Mode)</span>}
      {vendorInfo.vendorName && (
        <span className="block text-sm font-normal mt-1">
          Vendor: {vendorInfo.vendorName}
        </span>
      )}
    </CardTitle>
  );
};

export default ServiceFormHeader;
