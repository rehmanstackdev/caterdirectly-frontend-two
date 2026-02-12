
import { useState } from 'react';
import { ServiceFormData, VendorInfo } from '../types/form-types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth/useAuth';
import { usersService } from '@/services/users.service';
import ServicesService from '@/services/api/services.Service';
import { createCateringServiceFormData, createVenueServiceFormData, createPartyRentalServiceFormData, createEventStaffServiceFormData } from '@/utils/service-form-utils';

export function useApprovalHandler() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  // Don't use the hooks here, import the service directly
  // const createCateringMutation = useCreateCateringService();
  // const createVenueMutation = useCreateVenueService();
  // const createPartyRentalMutation = useCreatePartyRentalService();
  // const createEventStaffMutation = useCreateEventStaffService();
  
  const handleSubmitForApproval = async (
    formData: ServiceFormData, 
    vendorInfo: VendorInfo,
    adminContext: boolean = false,
    overrideVendorId?: string
  ) => {
    const isEditMode = !!formData.id;
    console.log("Attempting to submit service for approval with vendor info:", vendorInfo);
    console.log("Current user:", user);
    
    // Get vendor ID - use override if provided, otherwise get from localStorage
    let vendorId: string;
    
    if (overrideVendorId) {
      vendorId = overrideVendorId;
      console.log('Using override vendor ID:', vendorId);
    } else {
      try {
        const storedUserData = localStorage.getItem('user_data');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          console.log('Stored user data:', userData);
          
          if (userData.vendor?.id) {
            vendorId = userData.vendor.id;
            console.log('Found vendor ID in userData.vendor.id:', vendorId);
          } else if (userData.vendorId) {
            vendorId = userData.vendorId;
            console.log('Found vendor ID in userData.vendorId:', vendorId);
          } else {
            console.error('No vendor ID found in user data:', userData);
            toast.error('Vendor profile not found. Please complete your vendor registration or contact support.');
            return;
          }
        } else {
          console.error('No user data found in localStorage');
          toast.error('User session not found. Please log in again.');
          return;
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        toast.error('Invalid user session. Please log in again.');
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      if (!vendorId) {
        toast.error("No vendor ID found. Please complete your vendor registration.");
        return;
      }
      
      // Create or update service based on type and mode
      let formDataToSubmit: FormData;
      let response: any;
      
      switch (formData.type) {
        case 'catering':
          let cateringData = {
            vendorId: vendorId,
            serviceName: formData.name,
            serviceType: 'catering' as const,
            brand: formData.brand || '',
            description: formData.description,
            serviceStyles: formData.cateringDetails?.serviceStyles || [],
            cuisineTypes: formData.cateringDetails?.cuisineTypes || [],
            minimumOrderAmount: formData.cateringDetails?.minimumOrderAmount || 0,
            minimumGuests: formData.cateringDetails?.minGuests || formData.minGuests || 1,
            maximumGuests: formData.cateringDetails?.maxGuests || formData.maxGuests || 100,
            leadTimeHours: formData.cateringDetails?.leadTimeHours,
            menuPhoto: (formData.cateringDetails?.menuImage || formData.menuImage || formData.coverImage) && (formData.cateringDetails?.menuImage || formData.menuImage || formData.coverImage).startsWith('http') ? (formData.cateringDetails?.menuImage || formData.menuImage || formData.coverImage) : undefined,
            // Map frontend packaging fields back to backend format
            offerDisposablePackaging: formData.cateringDetails?.packagingOptions?.disposable || false,
            disposablePackagingFee: formData.cateringDetails?.packagingOptions?.disposableFee || 0,
            offerReusablePackaging: formData.cateringDetails?.packagingOptions?.reusable || false,
            reusablePackagingType: formData.cateringDetails?.packagingOptions?.reusableFeeType || 'flat_rate',
            reusablePackagingAmount: formData.cateringDetails?.packagingOptions?.reusableFeeType === 'percentage' 
              ? formData.cateringDetails?.packagingOptions?.reusableServiceFeePercentage || 0
              : formData.cateringDetails?.packagingOptions?.reusableServiceFeeFlatRate || 0,
            offerDelivery: formData.cateringDetails?.deliveryOptions?.offerDelivery || false,
            offerPickup: formData.cateringDetails?.deliveryOptions?.offerPickup || false,
            deliveryMinimum: formData.cateringDetails?.deliveryOptions?.deliveryMinimum || 0,
            deliveryRanges: formData.cateringDetails?.deliveryOptions?.deliveryRanges || {},
            eatingUtensilsFee: formData.cateringDetails?.serviceAdditions?.eatingUtensilsFee || 0,
            napkinsFee: formData.cateringDetails?.serviceAdditions?.napkinsFee || 0,
            platesBowlsFee: formData.cateringDetails?.serviceAdditions?.platesBowlsFee || 0,
            servingUtensilsFee: formData.cateringDetails?.serviceAdditions?.servingUtensilsFee || 0,
            manage: formData.manage || false,
            hasCombo: formData.hasCombo || false,
            menuItems: formData.cateringDetails?.menuItems || [],
            combos: formData.combos || []
          };
          
          // console.log('=== COMBO DEBUG INFO ===');
          // console.log('formData.hasCombo:', formData.hasCombo);
          // console.log('formData.combos:', formData.combos);
          // console.log('cateringData.hasCombo:', cateringData.hasCombo);
          // console.log('cateringData.combos:', cateringData.combos);
          // console.log('Menu items with combo flag:', formData.cateringDetails?.menuItems?.filter(item => item.isCombo));
          // console.log('=== END COMBO DEBUG ===');
          
          // Handle image files - convert blob URL to File or keep existing URL
          let menuImageFile: File | undefined;
          const menuImageUrl = formData.cateringDetails?.menuImage || formData.menuImage || formData.coverImage;
          console.log('Processing menu image:', menuImageUrl);
          
          if (menuImageUrl && menuImageUrl.startsWith('blob:')) {
            try {
              console.log('Converting blob URL to file:', menuImageUrl);
              const response = await fetch(menuImageUrl);
              const blob = await response.blob();
              menuImageFile = new File([blob], 'menu.jpg', { type: blob.type || 'image/jpeg' });
              console.log('Menu image file created from blob:', menuImageFile.name, menuImageFile.size);
            } catch (error) {
              console.error('Error converting blob to file:', error);
            }
          }
          
          // console.log('Menu image processing result:', {
          //   originalUrl: menuImageUrl,
          //   fileCreated: !!menuImageFile,
          //   fileName: menuImageFile?.name,
          //   fileSize: menuImageFile?.size
          // });
          
          // Handle menu item images
          const menuItemFiles: File[] = [];
          const processedMenuItems = [];
          let menuItemImageIndex = 0;

          if (formData.cateringDetails?.menuItems) {
            console.log('=== MENU ITEM PROCESSING FOR API ===');
            for (const menuItem of formData.cateringDetails.menuItems) {
              // console.log('Processing menu item for API:', menuItem);
              // console.log('dietaryFlags:', menuItem.dietaryFlags);
              // console.log('allergenFlags:', menuItem.allergenFlags);

              const isNewImage = menuItem.image && menuItem.image.startsWith('blob:');
              const isExistingImage = menuItem.image && menuItem.image.startsWith('http');

              const processedItem: any = {
                name: menuItem.name,
                description: menuItem.description || '',
                price: menuItem.price,
                priceType: menuItem.priceType,
                category: menuItem.category || 'miscellaneous',
                minimumOrderQuantity: menuItem.minQuantity || 1,
                isPopular: menuItem.isPopular || false,
                dietaryOptions: menuItem.dietaryFlags?.join(',') || '',
                allergens: menuItem.allergenFlags?.join(',') || '',
                hasImage: !!menuItem.image,
                imageUrl: isExistingImage ? menuItem.image : undefined
              };

              // Track which file index this menu item's new image will be at
              if (isNewImage) {
                processedItem.imageIndex = menuItemImageIndex;
                menuItemImageIndex++;
              }

              console.log('Processed item for API:', processedItem);

              if (isNewImage) {
                try {
                  const blob = await fetch(menuItem.image).then(r => r.blob());
                  const file = new File([blob], `menu-item-${menuItem.name}.jpg`, { type: blob.type || 'image/jpeg' });
                  menuItemFiles.push(file);
                  console.log('Menu item image file created:', file.name, file.size, 'at index:', processedItem.imageIndex);
                } catch (error) {
                  console.error('Error converting menu item blob to file:', error);
                }
              }

              processedMenuItems.push(processedItem);
            }
            console.log('All processed menu items for API:', processedMenuItems);
            console.log('=== END MENU ITEM PROCESSING ===');
          }
          
          // Handle combo images separately
          const comboImageFiles: File[] = [];
          const comboItemFiles: File[] = [];
          
          if (formData.combos) {
            console.log('=== COMBO IMAGE PROCESSING ===');
            console.log('Total combos to process:', formData.combos.length);
            for (const combo of formData.combos) {
              console.log('Processing combo:', combo.name, 'Image:', combo.image, 'ImageUrl:', combo.imageUrl);
              // Process combo main image - check both image and imageUrl fields
              const comboImage = combo.image || combo.imageUrl;
              if (comboImage && comboImage.startsWith('blob:')) {
                try {
                  const blob = await fetch(comboImage).then(r => r.blob());
                  const file = new File([blob], `combo-${combo.name}.jpg`, { type: blob.type || 'image/jpeg' });
                  comboImageFiles.push(file);
                  console.log('Combo image file created:', file.name, file.size);
                } catch (error) {
                  console.error('Error converting combo blob to file:', error);
                }
              } else {
                console.log('Combo has no blob image:', comboImage);
              }
              
              // Process combo category item images
              if (combo.comboCategories) {
                for (const category of combo.comboCategories) {
                  if (category.items) {
                    for (const item of category.items) {
                      if (item.image && item.image.startsWith('blob:')) {
                        try {
                          const blob = await fetch(item.image).then(r => r.blob());
                          const file = new File([blob], `combo-item-${item.name}.jpg`, { type: blob.type || 'image/jpeg' });
                          comboItemFiles.push(file);
                          console.log('Combo item image file created:', file.name, file.size);
                        } catch (error) {
                          console.error('Error converting combo item blob to file:', error);
                        }
                      }
                    }
                  }
                }
              }
            }
            console.log('=== END COMBO IMAGE PROCESSING ===');
          }
          
          // Process combos to remove blob URLs but preserve HTTP URLs
          const processedCombos = [];
          if (formData.combos) {
            console.log('=== COMBO DATA PROCESSING ===');
            for (const combo of formData.combos) {
              console.log('Processing combo data:', combo.name, 'Image:', combo.image, 'ImageUrl:', combo.imageUrl);
              const processedCategories = [];
              if (combo.comboCategories) {
                for (const category of combo.comboCategories) {
                  const processedItems = [];
                  if (category.items) {
                    for (const item of category.items) {
                      const processedItem = {
                        ...item,
                        image: item.image && item.image.startsWith('http') ? item.image : undefined,
                        price: item.price || 0,
                        quantity: item.quantity || 0,
                        isPremium: item.isPremium || false,
                        additionalCharge: item.isPremium ? (item.additionalCharge || 0) : undefined
                      };
                      processedItems.push(processedItem);
                    }
                  }
                  processedCategories.push({
                    ...category,
                    items: processedItems
                  });
                }
              }
              
              const processedCombo = {
                ...combo,
                imageUrl: (combo.image && combo.image.startsWith('http')) || (combo.imageUrl && combo.imageUrl.startsWith('http')) ? (combo.image || combo.imageUrl) : undefined,
                comboCategories: processedCategories
              };
              console.log('Processed combo:', processedCombo.name, 'ImageUrl:', processedCombo.imageUrl);
              processedCombos.push(processedCombo);
            }
            console.log('=== END COMBO DATA PROCESSING ===');
          }
          
          // Update catering data with processed menu items and combos
          cateringData = {
            ...cateringData,
            menuItems: processedMenuItems,
            combos: processedCombos
          };
          
          console.log('Files organized for upload:', {
            menuImage: !!menuImageFile,
            menuItems: menuItemFiles.length,
            comboImage: comboImageFiles.length,
            comboItems: comboItemFiles.length
          });
          
          const files: any = {};
          if (menuImageFile) files.menuImage = menuImageFile;
          if (menuItemFiles.length > 0) files.menuItems = menuItemFiles;
          if (comboImageFiles.length > 0) files.comboImage = comboImageFiles;
          if (comboItemFiles.length > 0) files.comboItems = comboItemFiles;
          
          formDataToSubmit = createCateringServiceFormData(cateringData, files);
          console.log('=== CATERING SERVICE PAYLOAD ===');
          console.log('Catering data object:', JSON.stringify(cateringData, null, 2));
          console.log('Files object:', files);
          console.log('FormData entries:');
          for (const [key, value] of formDataToSubmit.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
          }
          console.log('=== END PAYLOAD ===');
          
          if (isEditMode) {
            response = await ServicesService.updateCateringService(formData.id!, formDataToSubmit);
            console.log('Catering service updated:', response);
          } else {
            response = await ServicesService.createCateringService(formDataToSubmit);
            console.log('Catering service created:', response);
          }
          break;
          
        case 'venues':
          console.log('=== VENUE DATA PREPARATION ===');
          console.log('Form data venue details:', formData.venueDetails);
          
          const venueData = {
            vendorId: vendorId,
            serviceName: formData.name,
            serviceType: 'venues' as const,
            brand: formData.brand || '',
            description: formData.description,
            pricingType: formData.priceType || 'flat_rate' as const,
            price: Number(formData.price) || 0,
            minimumGuests: formData.minGuests,
            maximumGuests: formData.maxGuests,
            // Fix capacity mapping - use nested capacity structure
            seatedCapacity: formData.venueDetails?.capacity?.seated || formData.venueDetails?.seatedCapacity || 0,
            standingCapacity: formData.venueDetails?.capacity?.standing || formData.venueDetails?.standingCapacity || 0,
            // Fix venue type mapping
            venueType: formData.venueDetails?.indoorOutdoor === 'indoor' ? 'indoor_only' : 
                      formData.venueDetails?.indoorOutdoor === 'outdoor' ? 'outdoor_only' : 
                      formData.venueDetails?.indoorOutdoor === 'both' ? 'indoor_and_outdoor' :
                      formData.venueDetails?.venueType || 'indoor_only',
            // Convert arrays to comma-separated strings for backend
            venueAmenities: Array.isArray(formData.venueDetails?.amenities) 
              ? formData.venueDetails.amenities.join(', ') 
              : formData.venueDetails?.venueAmenities || '',
            venueRestrictions: Array.isArray(formData.venueDetails?.restrictions)
              ? formData.venueDetails.restrictions.join(', ')
              : formData.venueDetails?.venueRestrictions || '',
            accessibilityFeatures: formData.venueDetails?.accessibilityFeatures || [],
            insuranceRequirements: formData.venueDetails?.insuranceRequirements || [],
            licenseRequirements: formData.venueDetails?.licenseRequirements || [],
            vendorPolicy: formData.venueDetails?.vendorPolicy || 'accept_any_platform_vendor'
          };
          
          console.log('Prepared venue data for API:', venueData);
          console.log('=== END VENUE DATA PREPARATION ===');
          
          const rawImages = formData.images || [];
          const coverImage = formData.coverImage;
          const orderedImages = coverImage
            ? [coverImage, ...rawImages.filter(image => image !== coverImage)]
            : rawImages;

          const serviceImageFiles: File[] = [];
          const existingServiceImages: string[] = [];
          let coverImageIndex: number | undefined = undefined;
          let uploadIndex = 0;

          for (const image of orderedImages) {
            if (!image) continue;
            if (image.startsWith('blob:')) {
              try {
                const blob = await fetch(image).then(r => r.blob());
                const file = new File([blob], `venue-${uploadIndex + 1}.jpg`, { type: blob.type || 'image/jpeg' });
                serviceImageFiles.push(file);
                if (image === coverImage) {
                  coverImageIndex = uploadIndex;
                }
                uploadIndex += 1;
              } catch (error) {
                console.error('Error converting blob to file:', error);
              }
            } else {
              existingServiceImages.push(image);
            }
          }

          const coverImageValue = coverImage && !coverImage.startsWith('blob:') ? coverImage : undefined;

          console.log('Venue image processing result:', {
            totalImages: orderedImages.length,
            existingImages: existingServiceImages.length,
            newImages: serviceImageFiles.length,
            coverImage: coverImageValue,
            coverImageIndex
          });
            
          formDataToSubmit = createVenueServiceFormData(venueData, {
            serviceImages: serviceImageFiles,
            existingServiceImages,
            coverImage: coverImageValue,
            coverImageIndex
          });
          console.log('=== VENUE SERVICE PAYLOAD ===');
          console.log('Venue data object:', JSON.stringify(venueData, null, 2));
          console.log('Image files:', serviceImageFiles.length);
          console.log('FormData entries:');
          for (const [key, value] of formDataToSubmit.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
          }
          console.log('=== END PAYLOAD ===');
          
          if (isEditMode) {
            response = await ServicesService.updateVenueService(formData.id!, formDataToSubmit);
            console.log('Venue service updated:', response);
          } else {
            response = await ServicesService.createVenueService(formDataToSubmit);
            console.log('Venue service created:', response);
          }
          break;
          
        case 'party_rentals':
        case 'party-rentals':
          console.log('=== PARTY RENTAL SERVICE CREATION ===');
          const partyRentalData = {
            vendorId: vendorId,
            serviceName: formData.name,
            serviceType: 'party_rentals' as const,
            brand: formData.brand || '',
            description: formData.description,
            pricingType: formData.priceType || 'flat_rate' as const,
            price: Number(formData.price) || 0,
            setupRequired: formData.rentalDetails?.setupRequired || false,
            setupFee: formData.rentalDetails?.setupFee,
            availableQuantity: formData.rentalDetails?.availableQuantity || 1,
            // Convert array format back to boolean fields for API
            deliveryAvailable: (formData.rentalDetails?.deliveryOptions || []).includes('delivery'),
            customerPickupAvailable: (formData.rentalDetails?.deliveryOptions || []).includes('pickup')
          };
          
          console.log('Party rental data:', partyRentalData);
          
          // Convert cover image to File only if it's a new blob URL
          let rentalImageFile: File | undefined;
          if (formData.coverImage && formData.coverImage.startsWith('blob:')) {
            try {
              console.log('Converting blob to file for party rental:', formData.coverImage);
              const blob = await fetch(formData.coverImage).then(r => r.blob());
              rentalImageFile = new File([blob], 'rental.jpg', { type: blob.type || 'image/jpeg' });
              console.log('Rental image file created:', rentalImageFile.name, rentalImageFile.size);
            } catch (error) {
              console.error('Error converting blob to file:', error);
            }
          }
          // For edit mode with existing HTTP URLs, don't create placeholder file
          console.log('Rental image processing result:', {
            originalUrl: formData.coverImage,
            fileCreated: !!rentalImageFile,
            fileName: rentalImageFile?.name,
            fileSize: rentalImageFile?.size
          });
            
          formDataToSubmit = createPartyRentalServiceFormData(partyRentalData, rentalImageFile);
          console.log('=== PARTY RENTAL SERVICE PAYLOAD ===');
          console.log('Party rental data object:', JSON.stringify(partyRentalData, null, 2));
          console.log('Image file:', rentalImageFile ? `${rentalImageFile.name} (${rentalImageFile.size} bytes)` : 'None');
          console.log('FormData entries:');
          for (const [key, value] of formDataToSubmit.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
          }
          console.log('=== END PAYLOAD ===');
          
          if (isEditMode) {
            console.log('Making API call to update party rental service...');
            response = await ServicesService.updatePartyRentalService(formData.id!, formDataToSubmit);
            console.log('Party rental service updated:', response);
          } else {
            console.log('Making API call to create party rental service...');
            response = await ServicesService.createPartyRentalService(formDataToSubmit);
            console.log('Party rental service created:', response);
          }
          break;
          
        case 'events_staff':
        case 'events-staff':
        case 'staff':
          console.log('=== EVENT STAFF SERVICE CREATION ===');
          const eventStaffData = {
            vendorId: vendorId,
            serviceName: formData.name,
            serviceType: 'events_staff' as const,
            brand: formData.brand || '',
            description: formData.description,
            pricingType: formData.priceType || 'hourly_rate' as const,
            price: Number(formData.price) || 0,
            qualificationsExperience: formData.staffDetails?.qualificationsExperience || '',
            minimumHours: formData.staffDetails?.minimumHours,
            attireOptions: formData.staffDetails?.attireOptions
          };
          
          console.log('Event staff data:', eventStaffData);
          
          // Convert cover image to File only if it's a new blob URL
          let staffImageFile: File | undefined;
          if (formData.coverImage && formData.coverImage.startsWith('blob:')) {
            try {
              console.log('Converting blob to file:', formData.coverImage);
              const blob = await fetch(formData.coverImage).then(r => r.blob());
              staffImageFile = new File([blob], 'staff.jpg', { type: blob.type || 'image/jpeg' });
              console.log('Staff image file created:', staffImageFile.name, staffImageFile.size);
            } catch (error) {
              console.error('Error converting blob to file:', error);
            }
          }
          // For edit mode with existing HTTP URLs, don't create placeholder file
          console.log('Staff image processing result:', {
            originalUrl: formData.coverImage,
            fileCreated: !!staffImageFile,
            fileName: staffImageFile?.name,
            fileSize: staffImageFile?.size
          });
            
          formDataToSubmit = createEventStaffServiceFormData(eventStaffData, staffImageFile);
          console.log('=== EVENT STAFF SERVICE PAYLOAD ===');
          console.log('Event staff data object:', JSON.stringify(eventStaffData, null, 2));
          console.log('Image file:', staffImageFile ? `${staffImageFile.name} (${staffImageFile.size} bytes)` : 'None');
          console.log('FormData entries:');
          for (const [key, value] of formDataToSubmit.entries()) {
            console.log(`${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
          }
          console.log('=== END PAYLOAD ===');
          
          if (isEditMode) {
            console.log('Making API call to update event staff service...');
            response = await ServicesService.updateEventStaffService(formData.id!, formDataToSubmit);
            console.log('Event staff service updated:', response);
          } else {
            console.log('Making API call to create event staff service...');
            response = await ServicesService.createEventStaffService(formDataToSubmit);
            console.log('Event staff service created:', response);
          }
          break;
          
        default:
          throw new Error(`Unsupported service type: ${formData.type}`);
      }
      
      // Invalidate queries to refresh service lists
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });

      // Show success message from API response
      console.log('Service submission response:', JSON.stringify(response));
      const successMessage = response?.message || response?.data?.message || (isEditMode ? 'Service updated successfully!' : 'Service created successfully!');
      toast.success(successMessage);

      // Redirect to appropriate page
      if (adminContext) {
        navigate('/admin/services');
      } else {
        navigate('/vendor/services');
      }
      
    } catch (error) {
      console.error("Error in handleSubmitForApproval:", error);
      console.error("Error response data:", error?.response?.data);
      console.error("Error status:", error?.response?.status);
      
      let message = "An unexpected error occurred";
      if (error?.response?.data?.message) {
        message = error.response.data.message;
        if (message === "Vendor not found") {
          message = "Your vendor profile was not found. Please complete your vendor registration first or contact support.";
        }
      } else if (error?.response?.status === 400 && error?.response?.data?.message?.includes('Vendor not found')) {
        message = "Vendor profile issue detected. Please ensure your vendor registration is complete.";
      } else if (error?.message) {
        message = error.message;
      }
      
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return {
    isSubmitting,
    handleSubmitForApproval
  };
}
