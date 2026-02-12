import { MenuItem, ServiceItem } from "@/types/service-types";
import { getMenuItems } from "@/hooks/events/utils/menu-utils";
import { toast } from "@/hooks/use-toast";

export const getFeaturedMenuItems = (serviceDetails: any, limit: number = 3): MenuItem[] => {
  if (!serviceDetails) return [];
  
  const allItems: MenuItem[] = [];
  
  if (Array.isArray(serviceDetails.menuItems)) {
    allItems.push(...serviceDetails.menuItems);
  } else if (Array.isArray(serviceDetails.menu)) {
    allItems.push(...serviceDetails.menu);
  } else if (serviceDetails.catering && Array.isArray(serviceDetails.catering.menuItems)) {
    allItems.push(...serviceDetails.catering.menuItems);
  }
  
  const popularItems = allItems.filter(item => item.isPopular);
  const otherItems = allItems.filter(item => !item.isPopular);
  
  return [...popularItems, ...otherItems].slice(0, limit);
};

export const getBookableMenuItems = (service: ServiceItem | any): MenuItem[] => {
  return getMenuItems(service);
};

import { getServiceTypeLabel as getTypeLabel } from './service-type-utils';

export const getServiceTypeLabel = getTypeLabel;

export const getDisplayPrice = (service: ServiceItem): string => {
  if (!service) return '';
  
  if (service.price && service.price !== '0' && service.price !== '$0') {
    return service.price;
  }
  
  if ((service.type === 'catering' || service.serviceType === 'catering') && service.service_details) {
    const details = service.service_details;
    
    if (details.pricing && details.pricing.combo && details.pricing.combo.price) {
      const price = details.pricing.combo.price;
      const unit = details.pricing.combo.priceUnit || '/person';
      return `${price}${unit}`;
    }
    
    if (details.menuCombos && Array.isArray(details.menuCombos) && details.menuCombos.length > 0) {
      const combo = details.menuCombos[0];
      if (combo.price) {
        const unit = combo.priceUnit || '/person';
        return `${combo.price}${unit}`;
      }
    }
    
    if (details.catering && details.catering.pricing && details.catering.pricing.combo) {
      const combo = details.catering.pricing.combo;
      if (combo.price) {
        const unit = combo.priceUnit || '/person';
        return `${combo.price}${unit}`;
      }
    }
    
    const menuItems = getFeaturedMenuItems(details);
    if (menuItems.length > 0 && menuItems[0].price) {
      return `From ${menuItems[0].price}`;
    }
  }
  
  return service.price || 'Price varies';
};

export const formatPrice = (price: string | number | undefined, priceType?: string): string => {
  if (price === undefined || price === null || price === '') {
    return 'Price varies';
  }
  
  if (typeof price === 'string' && (price.includes('$') || price.toLowerCase().includes('from'))) {
    return price;
  }
  
  const formattedPrice = typeof price === 'number' ? `$${price}` : `$${price}`;
  
  if (priceType) {
    switch(priceType) {
      case 'per_person':
        return `${formattedPrice}/Person`;
      case 'per_hour':
        return `${formattedPrice}/Hour`;
      case 'per_day':
        return `${formattedPrice}/Day`;
      case 'per_item':
        return `${formattedPrice}/Item`;
      default:
        return formattedPrice;
    }
  }
  
  return formattedPrice;
};

export const startImageMigration = async (): Promise<void> => {
  console.log('API Call: POST', { url: '/services/migrate-images' });
  console.log('API Call Complete: POST', { url: '/services/migrate-images', result: 'stubbed' });
  
  toast({
    title: "Image migration stubbed",
    description: "Image migration functionality has been removed"
  });
};
