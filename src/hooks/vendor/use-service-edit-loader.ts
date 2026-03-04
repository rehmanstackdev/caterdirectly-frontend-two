
import React, { useEffect } from 'react';
import { ServiceFormData, VendorInfo } from './types/form-types';
import { PriceType } from '@/types/service-types';
import ServicesService from '@/services/api/services.Service';

export function useServiceEditLoader(
  mode: 'create' | 'edit',
  serviceId: string | undefined,
  updateFormData: (data: Partial<ServiceFormData>) => void,
  setVendorInfo: (info: VendorInfo) => void,
  setIsInitialized: (value: boolean) => void
) {
  const [hasLoaded, setHasLoaded] = React.useState(false);
  
  useEffect(() => {
    const loadServiceData = async () => {
      if (mode === 'edit' && serviceId && !hasLoaded) {
        console.log('=== LOADING SERVICE DATA FOR EDIT ===');
        setHasLoaded(true);
        try {
          const serviceToEdit = await ServicesService.getServiceById(serviceId);
          
          if (serviceToEdit) {
            console.log('=== RAW SERVICE DATA FROM API ===');
            console.log('Full service object:', JSON.stringify(serviceToEdit, null, 2));
            console.log('Service type:', serviceToEdit.serviceType);
            console.log('Catering data:', serviceToEdit.catering);
            console.log('Venue data:', serviceToEdit.venue);
            console.log('Party rental data:', serviceToEdit.partyRental);
            console.log('Event staff data:', serviceToEdit.eventStaff);
            console.log('=== END RAW DATA ===');
            
            // Extract price and pricing type based on service type
            let priceValue = '';
            let priceType: PriceType = 'flat_rate';
            
            switch (serviceToEdit.serviceType) {
              case 'catering':
                priceValue = serviceToEdit.catering?.minimumOrderAmount?.toString() || '';
                priceType = 'minimum_order';
                break;
              case 'venues':
                priceValue = serviceToEdit.venue?.price?.toString() || '';
                priceType = serviceToEdit.venue?.pricingType || 'flat_rate';
                break;
              case 'party_rentals':
                priceValue = serviceToEdit.partyRental?.price?.toString() || '';
                priceType = serviceToEdit.partyRental?.pricingType || 'flat_rate';
                break;
              case 'events_staff':
                priceValue = serviceToEdit.eventStaff?.price?.toString() || '';
                priceType = serviceToEdit.eventStaff?.pricingType || 'hourly_rate';
                break;
            }
            
            // Extract cover image based on service type with detailed logging
            let coverImage = '';
            console.log('=== IMAGE EXTRACTION DEBUG ===');
            
            // Try multiple possible image field names for robustness
            const imageFields = {
              catering: ['menuPhoto', 'image', 'serviceImage'],
              venues: ['serviceImage', 'image', 'menuPhoto'],
              party_rentals: ['serviceImage', 'image', 'menuPhoto'],
              events_staff: ['serviceImage', 'image', 'menuPhoto']
            };
            
            const serviceData = {
              catering: serviceToEdit.catering,
              venues: serviceToEdit.venue,
              party_rentals: serviceToEdit.partyRental,
              events_staff: serviceToEdit.eventStaff
            }[serviceToEdit.serviceType];
            
            if (serviceData) {
              const fields = imageFields[serviceToEdit.serviceType] || [];
              for (const field of fields) {
                if (serviceData[field]) {
                  coverImage = serviceData[field];
                  console.log(`Found image in ${field}:`, coverImage);
                  break;
                }
              }
            }
            
            if (serviceToEdit.serviceType === 'venues' && serviceToEdit.venue?.serviceImages?.length) {
              coverImage = serviceToEdit.venue.serviceImages[0];
              console.log('Found cover image from serviceImages:', coverImage);
            }

            console.log('Service type:', serviceToEdit.serviceType);
            console.log('Service data:', serviceData);
            console.log('Final coverImage value:', coverImage);
            console.log('=== END IMAGE DEBUG ===');
            
            // Extract guest limits
            const minGuests = serviceToEdit.catering?.minimumGuests || serviceToEdit.venue?.minimumGuests || 1;
            const maxGuests = serviceToEdit.catering?.maximumGuests || serviceToEdit.venue?.maximumGuests || 100;
            
            // Build service type specific details
            let cateringDetails = {};
            let venueDetails = {};
            let rentalDetails = {};
            let staffDetails = {};
            
            switch (serviceToEdit.serviceType) {
              case 'catering':
                if (serviceToEdit.catering) {
                  cateringDetails = {
                    serviceStyles: serviceToEdit.catering.serviceStyles || [],
                    cuisineTypes: (() => {
                      const raw = serviceToEdit.catering.cuisineTypes;
                      if (Array.isArray(raw)) {
                        // Handle bad API shape like ["[\"American\"", "\"Italian\"", ... "\"Mediterranean\"]"]
                        if (raw.some((entry) => typeof entry === 'string' && entry.includes('["'))) {
                          const joined = raw.join(',');
                          try {
                            const parsed = JSON.parse(joined);
                            return Array.isArray(parsed) ? parsed : [];
                          } catch (e) {
                            return joined
                              .replace(/^\s*\[/, '')
                              .replace(/\]\s*$/, '')
                              .split(',')
                              .map((s) => s.replace(/^\s*\"|\"\s*$/g, '').trim())
                              .filter((s) => s);
                          }
                        }
                        return raw.filter((entry) => typeof entry === 'string').map((s) => s.trim()).filter((s) => s);
                      }
                      if (typeof raw === 'string') {
                        const trimmed = raw.trim();
                        if (trimmed.startsWith('[')) {
                          try {
                            const parsed = JSON.parse(trimmed);
                            return Array.isArray(parsed) ? parsed : [];
                          } catch (e) {
                            return trimmed
                              .replace(/^\s*\[/, '')
                              .replace(/\]\s*$/, '')
                              .split(',')
                              .map((s) => s.replace(/^\s*\"|\"\s*$/g, '').trim())
                              .filter((s) => s);
                          }
                        }
                        return trimmed.split(',').map((s) => s.trim()).filter((s) => s);
                      }
                      return [];
                    })(),
                    minimumOrderAmount: serviceToEdit.catering.minimumOrderAmount || 0,
                    minGuests: serviceToEdit.catering.minimumGuests || 1,
                    maxGuests: serviceToEdit.catering.maximumGuests || 100,
                    leadTimeHours: serviceToEdit.catering.leadTimeHours || 24,
                    menuImage: serviceToEdit.catering.menuPhoto || '',
                    menuItems: (() => {
                      const menuItems = serviceToEdit.catering.menuItems || [];
                      console.log('=== MENU ITEMS TRANSFORMATION ===');
                      console.log('Raw menu items from backend:', menuItems);
                      
                      const transformedItems = menuItems.map(item => {
                        console.log('Processing menu item:', item);
                        console.log('dietaryOptions:', item.dietaryOptions);
                        console.log('allergens:', item.allergens);
                        
                        // Transform dietary options and allergens from strings to arrays
                        const dietaryFlags = item.dietaryOptions 
                          ? (typeof item.dietaryOptions === 'string' 
                              ? item.dietaryOptions.split(',').map(s => s.trim()).filter(s => s) 
                              : item.dietaryOptions)
                          : [];
                        
                        const allergenFlags = item.allergens 
                          ? (typeof item.allergens === 'string' 
                              ? item.allergens.split(',').map(s => s.trim()).filter(s => s) 
                              : item.allergens)
                          : [];
                        
                        console.log('Transformed dietaryFlags:', dietaryFlags);
                        console.log('Transformed allergenFlags:', allergenFlags);
                        
                        return {
                          ...item,
                          dietaryFlags,
                          allergenFlags,
                          image: item.imageUrl || item.image // Map imageUrl to image for form compatibility
                        };
                      });
                      
                      console.log('Final transformed menu items:', transformedItems);
                      console.log('=== END MENU ITEMS TRANSFORMATION ===');
                      return transformedItems;
                    })(),
                    packagingOptions: (() => {
                      console.log('=== PACKAGING OPTIONS TRANSFORMATION ===');
                      console.log('Raw packaging data from backend:');
                      console.log('offerDisposablePackaging:', serviceToEdit.catering.offerDisposablePackaging);
                      console.log('disposablePackagingFee:', serviceToEdit.catering.disposablePackagingFee);
                      console.log('offerReusablePackaging:', serviceToEdit.catering.offerReusablePackaging);
                      console.log('reusablePackagingType:', serviceToEdit.catering.reusablePackagingType);
                      console.log('reusablePackagingAmount:', serviceToEdit.catering.reusablePackagingAmount);
                      
                      const packagingOptions = {
                        // Map backend fields to component expected fields
                        disposable: serviceToEdit.catering.offerDisposablePackaging || false,
                        disposableFee: serviceToEdit.catering.disposablePackagingFee || 0,
                        reusable: serviceToEdit.catering.offerReusablePackaging || false,
                        reusableFeeType: serviceToEdit.catering.reusablePackagingType || 'flat_rate',
                        reusableServiceFeeFlatRate: serviceToEdit.catering.reusablePackagingAmount || 0,
                        reusableServiceFeePercentage: 0 // Default value
                      };
                      
                      console.log('Transformed packaging options:', packagingOptions);
                      console.log('=== END PACKAGING TRANSFORMATION ===');
                      return packagingOptions;
                    })(),
                    deliveryOptions: {
                      offerDelivery: serviceToEdit.catering.offerDelivery || false,
                      offerPickup: serviceToEdit.catering.offerPickup || false,
                      deliveryMinimum: serviceToEdit.catering.deliveryMinimum || 0,
                      deliveryRanges: serviceToEdit.catering.deliveryRanges || {}
                    },
                    serviceAdditions: {
                      eatingUtensilsFee: serviceToEdit.catering.eatingUtensilsFee || 0,
                      napkinsFee: serviceToEdit.catering.napkinsFee || 0,
                      platesBowlsFee: serviceToEdit.catering.platesBowlsFee || 0,
                      servingUtensilsFee: serviceToEdit.catering.servingUtensilsFee || 0
                    },
                    combos: (() => {
                      const combos = serviceToEdit.catering.combos || [];
                      return combos.map(combo => ({
                        ...combo,
                        image: combo.imageUrl || combo.image,
                        comboCategories: (combo.comboCategories || []).map((cat: any) => ({
                          ...cat,
                          items: (cat.items || []).map((item: any) => ({
                            ...item,
                            image: item.imageUrl || item.image
                          }))
                        }))
                      }));
                    })()
                  };
                }
                break;
                
              case 'venues':
                if (serviceToEdit.venue) {
                  console.log('=== VENUE DATA TRANSFORMATION ===');
                  console.log('Raw venue data:', serviceToEdit.venue);
                  console.log('Backend venueType value:', serviceToEdit.venue.venueType);
                  
                  venueDetails = {
                    // Transform capacity data to match component expectations
                    capacity: {
                      seated: serviceToEdit.venue.seatedCapacity || 0,
                      standing: serviceToEdit.venue.standingCapacity || 0
                    },
                    // Map venue type field - convert backend enum to frontend values
                    indoorOutdoor: (() => {
                      const backendValue = serviceToEdit.venue.venueType;
                      const frontendValue = backendValue === 'indoor_only' ? 'indoor' :
                                           backendValue === 'outdoor_only' ? 'outdoor' :
                                           backendValue === 'indoor_and_outdoor' ? 'both' : 'both';
                      console.log(`Venue type mapping: ${backendValue} -> ${frontendValue}`);
                      return frontendValue;
                    })(),
                    // Transform amenities and restrictions from strings to arrays if needed
                    amenities: Array.isArray(serviceToEdit.venue.venueAmenities) 
                      ? serviceToEdit.venue.venueAmenities 
                      : (serviceToEdit.venue.venueAmenities ? serviceToEdit.venue.venueAmenities.split(',').map(s => s.trim()) : []),
                    restrictions: Array.isArray(serviceToEdit.venue.venueRestrictions)
                      ? serviceToEdit.venue.venueRestrictions
                      : (serviceToEdit.venue.venueRestrictions ? serviceToEdit.venue.venueRestrictions.split(',').map(s => s.trim()) : []),
                    accessibilityFeatures: serviceToEdit.venue.accessibilityFeatures || [],
                    insuranceRequirements: serviceToEdit.venue.insuranceRequirements || [],
                    licenseRequirements: serviceToEdit.venue.licenseRequirements || [],
                    vendorPolicy: serviceToEdit.venue.vendorPolicy || 'platform_open'
                  };
                  
                  console.log('Transformed venue details:', venueDetails);
                  console.log('=== END VENUE TRANSFORMATION ===');
                }
                break;
                
              case 'party_rentals':
                if (serviceToEdit.partyRental) {
                  console.log('=== PARTY RENTAL DATA TRANSFORMATION ===');
                  console.log('Raw party rental data:', serviceToEdit.partyRental);
                  console.log('deliveryAvailable:', serviceToEdit.partyRental.deliveryAvailable);
                  console.log('customerPickupAvailable:', serviceToEdit.partyRental.customerPickupAvailable);
                  
                  // Convert boolean delivery options to array format expected by component
                  const deliveryOptions = [];
                  if (serviceToEdit.partyRental.deliveryAvailable) {
                    deliveryOptions.push('delivery');
                  }
                  if (serviceToEdit.partyRental.customerPickupAvailable) {
                    deliveryOptions.push('pickup');
                  }
                  
                  console.log('Converted deliveryOptions array:', deliveryOptions);
                  
                  rentalDetails = {
                    setupRequired: serviceToEdit.partyRental.setupRequired || false,
                    setupFee: serviceToEdit.partyRental.setupFee || 0,
                    availableQuantity: serviceToEdit.partyRental.availableQuantity || 1,
                    deliveryOptions: deliveryOptions
                  };
                  
                  console.log('Final rentalDetails:', rentalDetails);
                  console.log('=== END PARTY RENTAL TRANSFORMATION ===');
                }
                break;
                
              case 'events_staff':
                if (serviceToEdit.eventStaff) {
                  staffDetails = {
                    qualificationsExperience: serviceToEdit.eventStaff.qualificationsExperience || '',
                    minimumHours: serviceToEdit.eventStaff.minimumHours || 1,
                    attireOptions: serviceToEdit.eventStaff.attireOptions || []
                  };
                }
                break;
            }
            
            // Build complete form data object
            const venueImages = serviceToEdit.venue?.serviceImages?.length
              ? serviceToEdit.venue.serviceImages
              : (coverImage ? [coverImage] : []);

            const formDataUpdate: Partial<ServiceFormData> = {
              id: serviceToEdit.id,
              name: serviceToEdit.serviceName || '',
              type: serviceToEdit.serviceType,
              brand: serviceToEdit.brand || '',
              description: serviceToEdit.description || '',
              price: priceValue,
              priceType: priceType,
              minGuests: minGuests,
              maxGuests: maxGuests,
              coverImage: coverImage,
              images: serviceToEdit.serviceType === 'venues' ? venueImages : (coverImage ? [coverImage] : []),
              adminNotes: '', // Ensure adminNotes is set
              manage: serviceToEdit.catering?.manage || false,
              hasCombo: serviceToEdit.catering?.hasCombo || false,
              combos: (() => {
                const combos = serviceToEdit.catering?.combos || [];
                console.log('=== COMBOS TRANSFORMATION ===');
                console.log('Raw combos from backend:', combos);
                
                const transformedCombos = combos.map(combo => {
                  console.log('Processing combo:', combo);
                  console.log('Combo categories:', combo.comboCategories);

                  return {
                    ...combo,
                    image: combo.imageUrl || combo.image, // Map imageUrl to image for form compatibility
                    comboCategories: (combo.comboCategories || []).map((cat: any) => ({
                      ...cat,
                      items: (cat.items || []).map((item: any) => ({
                        ...item,
                        image: item.imageUrl || item.image // Map imageUrl to image for combo category items
                      }))
                    }))
                  };
                });
                
                console.log('Final transformed combos:', transformedCombos);
                console.log('=== END COMBOS TRANSFORMATION ===');
                return transformedCombos;
              })(),
              // Add menu items and other catering data at top level for CateringServiceDetails
              menuItems: cateringDetails.menuItems || [],
              menuImage: cateringDetails.menuImage || '',
              packagingOptions: cateringDetails.packagingOptions,
              deliveryOptions: cateringDetails.deliveryOptions,
              serviceAdditions: cateringDetails.serviceAdditions,
              cateringDetails,
              venueDetails,
              rentalDetails,
              staffDetails
            };
            
            console.log('=== TRANSFORMED FORM DATA ===');
            console.log('Form data update object:', JSON.stringify(formDataUpdate, null, 2));
            console.log('Cover image in form data:', formDataUpdate.coverImage);
            console.log('=== END TRANSFORMED DATA ===');
            updateFormData(formDataUpdate);
            
            // Update vendor info
            if (serviceToEdit.vendor?.id && serviceToEdit.vendor?.businessName) {
              setVendorInfo({
                vendorId: serviceToEdit.vendor.id,
                vendorName: serviceToEdit.vendor.businessName
              });
            }
            
            setIsInitialized(true);
          }
        } catch (error) {
          console.error('Error loading service for edit:', error);
        }
      }
    };
    
    loadServiceData();
  }, [serviceId, mode, hasLoaded]);
}
