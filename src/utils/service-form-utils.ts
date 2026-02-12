import { CateringService, VenueService, PartyRentalService, EventStaffService } from '@/types/services';

// Helper function to append files to FormData
export const appendFilesToFormData = (formData: FormData, files: { [key: string]: File | File[] }) => {
  Object.entries(files).forEach(([key, file]) => {
    if (Array.isArray(file)) {
      file.forEach((f) => {
        console.log(`Appending array file ${key}:`, f.name, f.size);
        formData.append(key, f);
      });
    } else if (file) {
      console.log(`Appending single file ${key}:`, file.name, file.size);
      formData.append(key, file);
    }
  });
};

// Create FormData for catering service
export const createCateringServiceFormData = (
  data: CateringService,
  files?: {
    serviceImage?: File;
    menuItems?: File[];
    comboImage?: File[];
    comboItems?: File[];
  }
): FormData => {
  const formData = new FormData();
  
  // Only exclude menuPhoto if it's a blob URL
  const processedData = { ...data };
  if (data.menuPhoto && data.menuPhoto.startsWith('blob:')) {
    delete processedData.menuPhoto;
  }
  
  // Basic service fields
  formData.append('vendorId', processedData.vendorId);
  formData.append('serviceName', processedData.serviceName);
  formData.append('serviceType', processedData.serviceType);
  if (processedData.brand) formData.append('brand', processedData.brand);
  formData.append('description', processedData.description);
  
  // Catering specific fields
  formData.append('serviceStyles', JSON.stringify(processedData.serviceStyles));
  if (processedData.cuisineTypes) formData.append('cuisineTypes', JSON.stringify(processedData.cuisineTypes));
  formData.append('minimumOrderAmount', processedData.minimumOrderAmount.toString());
  formData.append('minimumGuests', processedData.minimumGuests.toString());
  formData.append('maximumGuests', processedData.maximumGuests.toString());
  
  if (processedData.leadTimeHours) formData.append('leadTimeHours', processedData.leadTimeHours.toString());
  if (processedData.menuPhoto) formData.append('menuPhoto', processedData.menuPhoto);
  
  // Packaging options
  formData.append('offerDisposablePackaging', processedData.offerDisposablePackaging.toString());
  if (processedData.disposablePackagingFee) formData.append('disposablePackagingFee', processedData.disposablePackagingFee.toString());
  formData.append('offerReusablePackaging', processedData.offerReusablePackaging.toString());
  if (processedData.reusablePackagingType) formData.append('reusablePackagingType', processedData.reusablePackagingType);
  if (processedData.reusablePackagingAmount) formData.append('reusablePackagingAmount', processedData.reusablePackagingAmount.toString());
  
  // Delivery options
  formData.append('offerDelivery', processedData.offerDelivery.toString());
  formData.append('offerPickup', processedData.offerPickup.toString());
  if (processedData.deliveryMinimum) formData.append('deliveryMinimum', processedData.deliveryMinimum.toString());
  if (processedData.deliveryRanges) formData.append('deliveryRanges', JSON.stringify(processedData.deliveryRanges));
  
  // Fees
  if (processedData.eatingUtensilsFee) formData.append('eatingUtensilsFee', processedData.eatingUtensilsFee.toString());
  if (processedData.napkinsFee) formData.append('napkinsFee', processedData.napkinsFee.toString());
  if (processedData.platesBowlsFee) formData.append('platesBowlsFee', processedData.platesBowlsFee.toString());
  if (processedData.servingUtensilsFee) formData.append('servingUtensilsFee', processedData.servingUtensilsFee.toString());
  
  // Management fields
  formData.append('manage', processedData.manage.toString());
  formData.append('hasCombo', processedData.hasCombo.toString());
  
  // Menu items and combos
  formData.append('menuItems', JSON.stringify(processedData.menuItems));
  formData.append('combos', JSON.stringify(processedData.combos));
  
  // Append files if provided
  if (files) {
    console.log('Appending files to FormData:', files);
    appendFilesToFormData(formData, files);
  }
  
  return formData;
};

// Create FormData for venue service
export const createVenueServiceFormData = (
  data: VenueService,
  options?: {
    serviceImages?: File[];
    existingServiceImages?: string[];
    coverImage?: string;
    coverImageIndex?: number;
  }
): FormData => {
  const formData = new FormData();
  
  // Basic service fields
  formData.append('vendorId', data.vendorId);
  formData.append('serviceName', data.serviceName);
  formData.append('serviceType', data.serviceType);
  if (data.brand) formData.append('brand', data.brand);
  formData.append('description', data.description);
  
  // Venue specific fields
  formData.append('pricingType', data.pricingType);
  formData.append('price', data.price.toString());
  if (data.minimumGuests) formData.append('minimumGuests', data.minimumGuests.toString());
  if (data.maximumGuests) formData.append('maximumGuests', data.maximumGuests.toString());
  formData.append('seatedCapacity', data.seatedCapacity.toString());
  formData.append('standingCapacity', data.standingCapacity.toString());
  formData.append('venueType', data.venueType);
  
  if (data.venueAmenities) formData.append('venueAmenities', data.venueAmenities);
  if (data.venueRestrictions) formData.append('venueRestrictions', data.venueRestrictions);
  if (data.accessibilityFeatures) formData.append('accessibilityFeatures', JSON.stringify(data.accessibilityFeatures));
  if (data.insuranceRequirements) formData.append('insuranceRequirements', JSON.stringify(data.insuranceRequirements));
  if (data.licenseRequirements) formData.append('licenseRequirements', JSON.stringify(data.licenseRequirements));
  if (data.vendorPolicy) formData.append('vendorPolicy', data.vendorPolicy);
  
  if (options?.existingServiceImages && options.existingServiceImages.length > 0) {
    formData.append('existingServiceImages', JSON.stringify(options.existingServiceImages));
  }
  if (options?.coverImage) {
    formData.append('coverImage', options.coverImage);
  }
  if (options?.coverImageIndex !== undefined) {
    formData.append('coverImageIndex', options.coverImageIndex.toString());
  }
  if (options?.serviceImages && options.serviceImages.length > 0) {
    options.serviceImages.forEach((file) => {
      formData.append('serviceImages', file);
    });
  }
  
  return formData;
};

// Create FormData for party rental service
export const createPartyRentalServiceFormData = (
  data: PartyRentalService,
  serviceImage?: File
): FormData => {
  const formData = new FormData();
  
  // Basic service fields
  formData.append('vendorId', data.vendorId);
  formData.append('serviceName', data.serviceName);
  formData.append('serviceType', data.serviceType);
  if (data.brand) formData.append('brand', data.brand);
  formData.append('description', data.description);
  
  // Party rental specific fields
  formData.append('pricingType', data.pricingType);
  formData.append('price', data.price.toString());
  formData.append('setupRequired', data.setupRequired.toString());
  if (data.setupFee) formData.append('setupFee', data.setupFee.toString());
  formData.append('availableQuantity', data.availableQuantity.toString());
  formData.append('deliveryAvailable', data.deliveryAvailable.toString());
  formData.append('customerPickupAvailable', data.customerPickupAvailable.toString());
  
  // Service image (optional for edit mode)
  if (serviceImage) {
    formData.append('serviceImage', serviceImage);
  }
  
  return formData;
};

// Create FormData for event staff service
export const createEventStaffServiceFormData = (
  data: EventStaffService,
  serviceImage?: File
): FormData => {
  const formData = new FormData();
  
  // Basic service fields
  formData.append('vendorId', data.vendorId);
  formData.append('serviceName', data.serviceName);
  formData.append('serviceType', data.serviceType);
  if (data.brand) formData.append('brand', data.brand);
  formData.append('description', data.description);
  
  // Event staff specific fields
  formData.append('pricingType', data.pricingType);
  formData.append('price', data.price.toString());
  formData.append('qualificationsExperience', data.qualificationsExperience);
  if (data.minimumHours) formData.append('minimumHours', data.minimumHours.toString());
  if (data.attireOptions) formData.append('attireOptions', JSON.stringify(data.attireOptions));
  
  // Service image (optional for edit mode)
  if (serviceImage) {
    formData.append('serviceImage', serviceImage);
  }
  
  return formData;
};
