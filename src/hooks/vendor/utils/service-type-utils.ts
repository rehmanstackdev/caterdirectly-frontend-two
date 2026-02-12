
import { ServiceFormData } from '../types/form-types';

/**
 * Gets the type-specific details based on the service type in the form data
 * @param formData The service form data
 * @returns An object containing the type-specific details
 */
export const getTypeSpecificDetails = (formData: ServiceFormData) => {
  console.log('Getting type-specific details for service type:', formData.type);
  
  // Function to safely clone an object to avoid reference issues
  const safeClone = (obj: any) => {
    if (!obj) return {};
    try {
      // Create a deep copy to avoid reference issues
      return JSON.parse(JSON.stringify(obj));
    } catch (e) {
      console.error('Error cloning object:', e);
      return {};
    }
  };
  
  let result = {};
  switch (formData.type) {
    case 'catering':
      result = { catering: safeClone(formData.cateringDetails) };
      break;
    case 'venues':
      result = { venue: safeClone(formData.venueDetails) };
      break;
    case 'party-rentals':
      result = { rental: safeClone(formData.rentalDetails) };
      break;
    case 'staff':
      result = { staff: safeClone(formData.staffDetails) };
      break;
    default:
      result = {};
  }
  
  console.log('Processed type-specific details:', result);
  return result;
};

// Function to extract type-specific details from service data
export const extractTypeSpecificDetails = (serviceDetails: any, serviceType: string) => {
  if (!serviceDetails) return {};
  
  // Handle both camelCase and snake_case type names
  const normalizedType = serviceType.replace('-', '_').toLowerCase();

  switch (normalizedType) {
    case 'catering':
      return serviceDetails.catering || {};
    case 'venue':
    case 'venues':
      return serviceDetails.venue || {};
    case 'party_rentals':
    case 'rental':
    case 'party-rentals':
    case 'party-rental':
      return serviceDetails.rental || {};
    case 'staff':
    case 'staffing':
      return serviceDetails.staff || {};
    default:
      return {};
  }
};
