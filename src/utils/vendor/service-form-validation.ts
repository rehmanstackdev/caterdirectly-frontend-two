import { ServiceFormData } from '@/hooks/vendor/types/form-types';

const validateBasicInfo = (formData: ServiceFormData): boolean => {
  return !!formData.name && !!formData.type && !!formData.description;
};

const validatePricing = (formData: ServiceFormData): boolean => {
  return !!formData.price && !!formData.priceType;
};

const validateCateringDetails = (formData: ServiceFormData): boolean => {
  return !!formData.cateringDetails && !!formData.cateringDetails.serviceStyles && formData.cateringDetails.serviceStyles.length > 0;
};

const validateCateringBasicInfo = (formData: ServiceFormData): boolean => {
  if (!formData.cateringDetails) return true; // Allow empty for now
  const details = formData.cateringDetails;
  return (!details.serviceStyles || details.serviceStyles.length > 0);
};

const validateVenueDetails = (formData: ServiceFormData): boolean => {
  return !!formData.venueDetails;
};

const validateRentalDetails = (formData: ServiceFormData): boolean => {
  return !!formData.rentalDetails;
};

const validateStaffDetails = (formData: ServiceFormData): boolean => {
  return !!formData.staffDetails;
};

const validateMedia = (formData: ServiceFormData): boolean => {
  const count = formData.images ? formData.images.length : 0;
  if (formData.type === 'venues') {
    return count >= 1 && count <= 10;
  }
  return count > 0;
};

export const validateCurrentStep = (formData: ServiceFormData, currentStep: number): boolean => {
  if (formData.type === 'catering') {
    switch (currentStep) {
      case 1: // Basic Info
        return validateBasicInfo(formData);
      case 2: // Menu Items (includes basic catering info)
        return validateCateringBasicInfo(formData)
      case 3: // Packaging
        return true; // Packaging options are optional
      case 4: // Delivery
        return true; // Delivery options are optional
      case 5: // Additions
        return true; // Service additions are optional
      case 6: // Review
        return true;
      default:
        return true;
    }
  } else {
    switch (currentStep) {
      case 1: // Basic Info
        return validateBasicInfo(formData);
      case 2: // Pricing
        return validatePricing(formData);
      case 3: // Service Details
        switch (formData.type) {
          case 'venues':
            return validateVenueDetails(formData);
          case 'party-rentals':
            return validateRentalDetails(formData);
          case 'staff':
            return validateStaffDetails(formData);
          default:
            return true;
        }
      case 4: // Media
        return validateMedia(formData);
      case 5: // Review
        return true;
      default:
        return true;
    }
  }
};
