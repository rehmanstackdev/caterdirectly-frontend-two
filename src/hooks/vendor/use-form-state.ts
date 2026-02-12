
import { useState, useCallback } from 'react';
import { ServiceFormData } from './types/form-types';
import { ServiceType, PriceType } from '@/types/service-types';
import { getTotalSteps } from '@/utils/vendor/service-form-steps';

// Define the initial form state
const initialFormState: ServiceFormData = {
  name: '',
  type: 'catering',
  description: '',
  price: '',
  priceType: 'flat_rate',
  images: [],
  adminNotes: '',
  brandId: undefined,
  hasCombo: false,
  combos: [],
  manage: false,
  brand: '',
  // Initialize top-level catering fields
  menuItems: [],
  menuImage: '',
  packagingOptions: undefined,
  deliveryOptions: undefined,
  serviceAdditions: undefined,
  cateringDetails: {},
  venueDetails: {},
  rentalDetails: {},
  staffDetails: {},
};

export const useFormState = () => {
  const [formData, setFormData] = useState<ServiceFormData>(initialFormState);
  const [currentStep, setCurrentStep] = useState(1);
  const [vendorInfo, setVendorInfo] = useState({ vendorName: '', vendorId: '' });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to update form data
  const updateFormData = useCallback((data: Partial<ServiceFormData>) => {
    console.log('=== UPDATING FORM DATA ===');
    console.log('Data being updated:', data);
    setFormData((prev) => {
      const updated = { ...prev, ...data };
      console.log('Updated form data:', updated);
      console.log('Cover image in updated data:', updated.coverImage);
      console.log('Images array in updated data:', updated.images);
      console.log('Menu items in updated data:', updated.menuItems);
      console.log('Combos in updated data:', updated.combos);
      return updated;
    });
  }, []);

  // Function to reset form data
  const resetFormData = useCallback(() => {
    setFormData(initialFormState);
    setCurrentStep(1);
  }, []);

  // Function to go to the next step
  const handleNextStep = useCallback(() => {
    const maxSteps = getTotalSteps(formData.type);
    const nextStep = Math.min(currentStep + 1, maxSteps);
    console.log(`Step navigation: ${currentStep} -> ${nextStep} (max: ${maxSteps}, type: ${formData.type})`);
    setCurrentStep(nextStep);
  }, [formData.type, currentStep]);

  // Function to go to the previous step
  const handlePreviousStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);
  
  const getAvailablePriceTypes = (serviceType: ServiceType): { value: string; label: string }[] => {
    switch (serviceType) {
      case 'catering':
        return [
          { value: 'per_person', label: 'Per Person' },
          { value: 'flat_rate', label: 'Flat Rate' },
          { value: 'per_item', label: 'Per Item' }
        ];
      case 'venues':
        return [
          { value: 'flat_rate', label: 'Flat Rate' },
          { value: 'per_person', label: 'Per Person' },
          { value: 'per_hour', label: 'Per Hour' }
        ];
      case 'party-rentals':
        return [
          { value: 'flat_rate', label: 'Flat Rate' },
          { value: 'per_day', label: 'Per Day' },
          { value: 'per_item', label: 'Per Item' }
        ];
      case 'staff':
        return [
          { value: 'per_hour', label: 'Per Hour' },
          { value: 'flat_rate', label: 'Flat Rate' }
        ];
      default:
        return [];
    }
  };

  return {
    formData,
    updateFormData,
    resetFormData,
    currentStep,
    setCurrentStep,
    vendorInfo,
    setVendorInfo,
    isInitialized,
    setIsInitialized,
    isSubmitting,
    setIsSubmitting,
    handleNextStep,
    handlePreviousStep,
    getAvailablePriceTypes
  };
};
