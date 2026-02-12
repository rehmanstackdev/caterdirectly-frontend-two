
import { ServiceItem } from "@/types/service-types";
import { getServiceImageUrl } from "@/utils/image-utils";

// Function to format menu item prices
export const formatMenuItemPrice = (price: number | string): string => {
  // Handle already formatted prices
  if (typeof price === 'string') {
    if (price.startsWith('$')) {
      return price;
    }
    price = parseFloat(price);
  }

  // Handle invalid numeric values
  if (isNaN(price as number)) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency' as const,
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

// Extract menu items from a service object - now supports all service types
export const getMenuItems = (service: ServiceItem | any): any[] => {
  if (!service || !service.service_details) {
    return [];
  }

  const details = service.service_details;
  const serviceType = service.serviceType || service.type;

  // Handle catering services (existing logic)
  if (serviceType === 'catering') {
    let items = [];

    if (details.menuItems && Array.isArray(details.menuItems)) {
      items = details.menuItems;
    } else if (details.catering && details.catering.menuItems && Array.isArray(details.catering.menuItems)) {
      items = [...details.catering.menuItems];

      // Add combo items if they exist
      if (details.catering.combos && Array.isArray(details.catering.combos)) {
        const comboItems = details.catering.combos.map(combo => ({
          ...combo,
          isCombo: true,
          price: combo.pricePerPerson || combo.price || 0,
          priceType: 'per_person'
        }));
        items = [...items, ...comboItems];
      }
    } else if (details.menu && Array.isArray(details.menu)) {
      items = details.menu;
    }

    return items;
  }

  // Handle party rental services
  if (serviceType === 'party-rental' || serviceType === 'party-rentals') {
    if (details.rentalItems && Array.isArray(details.rentalItems)) {
      return details.rentalItems;
    }

    if (details.items && Array.isArray(details.items)) {
      return details.items;
    }

    if (details.rental && details.rental.items && Array.isArray(details.rental.items)) {
      return details.rental.items;
    }
  }

  // Handle staff services
  if (serviceType === 'staff') {
    if (details.staffServices && Array.isArray(details.staffServices)) {
      return details.staffServices;
    }

    if (details.services && Array.isArray(details.services)) {
      return details.services;
    }
  }

  // Handle venue services
  if (serviceType === 'venue' || serviceType === 'venues') {
    if (details.venueOptions && Array.isArray(details.venueOptions)) {
      return details.venueOptions;
    }

    if (details.options && Array.isArray(details.options)) {
      return details.options;
    }
  }

  return [];
};

// Extract menu image URL from a service object
export const getMenuImageUrl = (service: ServiceItem | any): string | null => {
  if (!service || !service.service_details) {
    return null;
  }

  const serviceDetails = service.service_details;

  // Check menu image in different possible locations
  if (serviceDetails.menuImage && typeof serviceDetails.menuImage === 'string') {
    return getServiceImageUrl(serviceDetails.menuImage);
  }

  if (serviceDetails.catering &&
      serviceDetails.catering.menuImage &&
      typeof serviceDetails.catering.menuImage === 'string') {
    return getServiceImageUrl(serviceDetails.catering.menuImage);
  }

  // If no direct menu image, check if there are menu items with images
  const menuItems = getMenuItems(service);
  if (menuItems.length > 0) {
    const firstItemWithImage = menuItems.find(item => item.image);
    if (firstItemWithImage && firstItemWithImage.image) {
      return getServiceImageUrl(firstItemWithImage.image);
    }
  }

  return null;
};

/**
 * DEPRECATED - Use formatUnifiedServicePrice from unified-price-utils.ts instead
 * This function is kept for backward compatibility only
 */
export const getCateringPriceRange = (service: ServiceItem | any): string => {
  return service.price || '$0';
};
