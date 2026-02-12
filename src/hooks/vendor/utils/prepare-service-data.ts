
import { ServiceFormData, VendorInfo } from '../types/form-types';
import { ServiceStatus } from '@/types/service-types';
import { getTypeSpecificDetails } from './service-type-utils';

export const prepareServiceData = (
  formData: ServiceFormData, 
  vendorInfo: VendorInfo, 
  status: ServiceStatus
) => {
  console.log('Preparing service data from form data:', formData);
  console.log('Using vendor info:', vendorInfo);

  // Verify vendor info is complete
  if (!vendorInfo.vendorId) {
    console.error('Vendor ID is missing, cannot create service without vendor association');
    throw new Error('Vendor ID is required to create a service');
  }

  if (!vendorInfo.vendorName || vendorInfo.vendorName === 'Unknown Vendor') {
    console.warn('Vendor name is missing or Unknown Vendor, attempting to use fallback name');
  }

  // Store only the numeric price value - let the unified formatter handle display formatting
  const numericPrice = formData.price ? `$${formData.price}` : '$0';

  // Get type-specific details with proper handling of nested objects
  const typeSpecificDetails = getTypeSpecificDetails(formData);
  console.log('Type-specific details:', typeSpecificDetails);

  // Use a safer fallback pattern for vendor name
  const safeVendorName = (vendorInfo.vendorName && vendorInfo.vendorName !== 'Unknown Vendor') 
    ? vendorInfo.vendorName 
    : `Vendor ${vendorInfo.vendorId.substring(0, 8)}`;

// Create service data object for database
  const serviceData = {
    name: formData.name,
    type: formData.type,
    description: formData.description || '',
    price: numericPrice, // Store clean price without suffixes
    price_type: formData.priceType || 'flat_rate',
    image: formData.coverImage || formData.images[0] || formData.cateringDetails?.menuImage || null,
    status: status,
    active: status === 'approved', // Only approved services are active by default
    vendor_id: vendorInfo.vendorId,
    vendor_name: safeVendorName, // Use our safer vendor name
    brand_id: formData.brandId || null,
    service_details: {
      images: formData.images,
      minGuests: formData.minGuests,
      maxGuests: formData.maxGuests,
      ...(formData.type === 'catering' && formData.cateringDetails?.menuImage ? { menuImage: formData.cateringDetails.menuImage } : {}),
      // Ensure menu items are stored in the unified structure for catering services
      ...(formData.type === 'catering' && {
        catering: {
          serviceStyles: formData.cateringDetails?.serviceStyles || [],
          cuisineTypes: formData.cateringDetails?.cuisineTypes || [],
          menuItems: formData.cateringDetails?.menuItems || [],
          menuImage: formData.cateringDetails?.menuImage,
          // Preserve any existing catering details from type-specific details
          ...(typeSpecificDetails && 
              typeof typeSpecificDetails === 'object' && 
              'catering' in typeSpecificDetails && 
              (typeSpecificDetails as any).catering
            ? (typeSpecificDetails as any).catering
            : {})
        }
      }),
      // Add type-specific details (excluding catering to avoid duplication)
      ...(typeSpecificDetails && formData.type !== 'catering' ? typeSpecificDetails : {})
    },
    admin_feedback: formData.adminNotes || null,
  };

  console.log('Prepared service data for database:', serviceData);

  // Always preserve the ID if it exists in the form data
  if (formData.id) {
    console.log(`Preserving existing service ID: ${formData.id}`);
    return {
      id: formData.id,
      ...serviceData
    };
  }

  return serviceData;
};
