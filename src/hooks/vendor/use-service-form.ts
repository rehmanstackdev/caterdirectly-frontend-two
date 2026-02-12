
import { useFormState } from './use-form-state';
import { useVendorInfo } from './use-vendor-info';
import { ServiceFormData, VendorInfo } from './types/form-types';

export type { ServiceFormData, VendorInfo };

export function useServiceForm() {
  const {
    formData,
    updateFormData,
    currentStep,
    setCurrentStep,
    isSubmitting,
    setIsSubmitting,
    handleNextStep,
    handlePreviousStep
  } = useFormState();

  const {
    vendorInfo,
    setVendorInfo,
    isInitialized,
    setIsInitialized
  } = useVendorInfo();

  return {
    formData,
    updateFormData,
    currentStep,
    setCurrentStep,
    isSubmitting,
    setIsSubmitting,
    vendorInfo,
    setVendorInfo,
    isInitialized,
    setIsInitialized,
    handleNextStep,
    handlePreviousStep
  };
}
