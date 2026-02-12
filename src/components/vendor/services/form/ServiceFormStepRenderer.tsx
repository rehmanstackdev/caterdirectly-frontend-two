
import React from 'react';
import { ServiceFormData, VendorInfo } from '@/hooks/vendor/types/form-types';
import BasicInfoStep from './steps/BasicInfoStep';
import PricingStep from './steps/PricingStep';
import ServiceTypeStep from './steps/ServiceTypeStep';
import MediaStep from './steps/MediaStep';
import ReviewStep from './steps/ReviewStep';
import CateringMenuStep from './steps/CateringMenuStep';
import CateringPackagingStep from './steps/CateringPackagingStep';
import CateringDeliveryStep from './steps/CateringDeliveryStep';
import CateringAdditionsStep from './steps/CateringAdditionsStep';

interface ServiceFormStepRendererProps {
  currentStep: number;
  formData: ServiceFormData;
  updateFormData: (data: Partial<ServiceFormData>) => void;
  handleSubmitForApproval: (formData: ServiceFormData, vendorInfo: VendorInfo, adminContext?: boolean) => void;
  vendorInfo: VendorInfo;
  adminContext?: boolean;
  displayStep?: number;
  showErrors?: boolean;
}

/**
 * Renders the appropriate form step based on current step and service type
 */
const ServiceFormStepRenderer: React.FC<ServiceFormStepRendererProps> = ({
  currentStep,
  formData,
  updateFormData,
  handleSubmitForApproval,
  vendorInfo,
  adminContext = false,
  showErrors = false,
}) => {
  // For catering services, we skip pricing and media steps (use menuImage instead)
  const isCatering = formData.type === 'catering';
  
  // Common handler for submission
  const handleSubmit = () => handleSubmitForApproval(formData, vendorInfo, adminContext);
  
  console.log(`Rendering step ${currentStep} for service type ${formData.type}`);
  
  if (isCatering) {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} vendorId={vendorInfo.vendorId} />;
      case 2:
        return <CateringMenuStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} />;
      case 3:
        return <CateringPackagingStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} />;
      case 4:
        return <CateringDeliveryStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} />;
      case 5:
        return <CateringAdditionsStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} />;
      case 6:
        return <ReviewStep formData={formData} vendorInfo={vendorInfo} onSubmit={handleSubmit} adminContext={adminContext} />;
      default:
        return <div>Catering Step {currentStep} not found</div>;
    }
  } else {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} vendorId={vendorInfo.vendorId} />;
      case 2:
        return <PricingStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} />;
      case 3:
        return <ServiceTypeStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} />;
      case 4:
        return <MediaStep formData={formData} updateFormData={updateFormData} showErrors={showErrors} />;
      case 5:
        return <ReviewStep formData={formData} vendorInfo={vendorInfo} onSubmit={handleSubmit} adminContext={adminContext} />;
      default:
        return <div>Step {currentStep} not found</div>;
    }
  }
};

export default ServiceFormStepRenderer;
