
import { getMenuItems } from "@/hooks/events/utils/menu-utils";

// Utility function to get bookable items for a service with malformed data handling
export const getBookableItems = (serviceDetails: any) => {
  if (!serviceDetails) {
    console.log('[getBookableItems] No service details available');
    return [];
  }
  
  const serviceType = serviceDetails.serviceType || serviceDetails.type;
  console.log('[getBookableItems] Processing service type:', serviceType);
  console.log('[getBookableItems] Full serviceDetails object:', serviceDetails);
  console.log('[getBookableItems] serviceDetails.service_details:', serviceDetails.service_details);
  
  // CRITICAL FIX: Handle malformed service_details
  let validServiceDetails = serviceDetails.service_details;
  
  if (validServiceDetails && validServiceDetails._type === "undefined" && validServiceDetails.value === "undefined") {
    console.warn('[getBookableItems] Detected malformed service_details, attempting recovery');
    validServiceDetails = null;
  }
  
  switch (serviceType) {
    case 'catering':
      // Transform ServiceSelection to ServiceItem format for utility compatibility
      const serviceForUtility = {
        id: serviceDetails.serviceId || serviceDetails.id,
        service_details: validServiceDetails || serviceDetails,
        type: serviceType,
        serviceType: serviceType
      };
      
      console.log('[getBookableItems] Service object for utility:', serviceForUtility);
      
      try {
        // Use the proven getMenuItems utility that all other components use
        const menuItems = getMenuItems(serviceForUtility);
        console.log('[getBookableItems] Menu items from utility:', menuItems);
        
        if (menuItems.length === 0 && !validServiceDetails) {
          // Fallback: try to find menu items directly on the service object
          console.log('[getBookableItems] No menu items found, trying fallback sources');
          return serviceDetails.menuItems || serviceDetails.menu || [];
        }
        
        return menuItems;
      } catch (error) {
        console.error('[getBookableItems] Error getting menu items:', error);
        // Fallback to direct menu sources
        return serviceDetails.menuItems || serviceDetails.menu || [];
      }
      
    case 'party-rental':
    case 'party-rentals':
    case 'party_rentals':
      // Use the same data access pattern as working components
      const details = validServiceDetails || serviceDetails;
      const rentalItems = details.rentalItems || details.items || details.rental?.items || [];
      console.log('[getBookableItems] Rental items found:', rentalItems);
      return Array.isArray(rentalItems) && rentalItems.length > 0 ? rentalItems : [];
      
    case 'staff':
    case 'events_staff':
      console.log('[getBookableItems] Processing staff service');
      // For staff services, check if there are actual staff sub-items
      const staffDetails = validServiceDetails || serviceDetails;
      const staffServices = staffDetails.staffServices || staffDetails.services || staffDetails.staff?.services || [];

      // If there are actual staff sub-items, return them
      if (Array.isArray(staffServices) && staffServices.length > 0) {
        console.log('[getBookableItems] Staff services found:', staffServices);
        return staffServices;
      }

      // Otherwise, this is a simple staff service with just quantity (no sub-items to select)
      // Return empty array so BookingVendorCard shows quantity controls instead
      console.log('[getBookableItems] No staff sub-items, using quantity controls');
      return [];

    case 'venue':
    case 'venues':
      const venueDetails = validServiceDetails || serviceDetails;
      const venueOptions = venueDetails.venueOptions || venueDetails.options || [];
      console.log('[getBookableItems] Venue options found:', venueOptions);
      // For venues, if no options exist, return empty array for quantity controls
      return Array.isArray(venueOptions) && venueOptions.length > 0 ? venueOptions : [];
      
    default:
      console.log('[getBookableItems] Unknown service type, returning empty array');
      return [];
  }
};
