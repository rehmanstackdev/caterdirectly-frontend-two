
/**
 * Functions to extract image URLs from different types of services
 */

import { ServiceItem } from '@/types/service-types';
import { isValidImageUrl } from './resolvers';

/**
 * Extract menu image URL from a catering service
 * 
 * @param service The catering service
 * @returns Image URL or undefined
 */
export const extractCateringMenuImage = (service: ServiceItem): string | undefined => {
  if (!service || !service.service_details) return undefined;
  
  // Try to get menu image from catering service details
  const { service_details } = service;
  
  if (service_details.catering && typeof service_details.catering.menuImage === 'string') {
    return service_details.catering.menuImage;
  }
  
  // Try to get first menu item image from unified structure
  if (service_details.catering && 
      Array.isArray(service_details.catering.menuItems) && 
      service_details.catering.menuItems.length > 0) {
    
    // Find first menu item with an image
    const menuItemWithImage = service_details.catering.menuItems.find(
      (item: any) => item && typeof item.image === 'string' && isValidImageUrl(item.image)
    );
    
    if (menuItemWithImage && typeof menuItemWithImage.image === 'string') {
      return menuItemWithImage.image;
    }
  }
  
  // Fallback: Check legacy menu structure for backward compatibility
  if (service_details.menu && Array.isArray(service_details.menu)) {
    const menuItemWithImage = service_details.menu.find(
      (item: any) => item && typeof item.image === 'string' && isValidImageUrl(item.image)
    );
    
    if (menuItemWithImage && typeof menuItemWithImage.image === 'string') {
      return menuItemWithImage.image;
    }
  }
  
  return undefined;
};

/**
 * Extract venue feature image URL from a venue service
 * 
 * @param service The venue service
 * @returns Image URL or undefined
 */
export const extractVenueFeatureImage = (service: ServiceItem): string | undefined => {
  if (!service || !service.service_details) return undefined;
  
  const { service_details } = service;
  
  // Try to get feature image from venue service details
  if (service_details.venue && typeof service_details.venue.featureImage === 'string') {
    return service_details.venue.featureImage;
  }
  
  // Try to get first venue area image
  if (service_details.venue && 
      Array.isArray(service_details.venue.areas) && 
      service_details.venue.areas.length > 0) {
    
    const areaWithImage = service_details.venue.areas.find(
      (area: any) => area && typeof area.image === 'string' && isValidImageUrl(area.image)
    );
    
    if (areaWithImage && typeof areaWithImage.image === 'string') {
      return areaWithImage.image;
    }
  }
  
  return undefined;
};

/**
 * Extract all available image URLs from a service
 * 
 * @param service The service
 * @returns Array of image URLs
 */
export const extractServiceImageUrls = (service: ServiceItem): string[] => {
  if (!service) return [];
  
  const images: string[] = [];
  
  // Add main service image
  if (typeof service.image === 'string' && isValidImageUrl(service.image)) {
    images.push(service.image);
  }
  
  // Add additional images from array if present
  if (Array.isArray(service.additional_images)) {
    service.additional_images.forEach(img => {
      if (typeof img === 'string' && isValidImageUrl(img)) images.push(img);
    });
  }
  
  // Service types might have different image sources
  const serviceType = service.type || service.serviceType;
  
  if (serviceType === 'catering') {
    const menuImage = extractCateringMenuImage(service);
    if (typeof menuImage === 'string') images.push(menuImage);
  } else if (serviceType === 'venue') {
    const featureImage = extractVenueFeatureImage(service);
    if (typeof featureImage === 'string') images.push(featureImage);
  }
  
  // Remove duplicates and return
  return [...new Set(images)];
};

/**
 * Gets the menu image URL for a catering service
 * Uses the unified image resolution system
 * 
 * @param service The catering service
 * @param fallbackImage Fallback image URL if no menu image is found
 * @returns Menu image URL or fallback
 */
export const getServiceMenuImageUrl = (
  service: ServiceItem | null | undefined,
  fallbackImage: string = 'https://via.placeholder.com/400x300?text=No+Menu+Image'
): string => {
  if (!service) return fallbackImage;
  
  // For catering services, prioritize menuImage from catering details
  if (service.service_details?.catering?.menuImage && 
      typeof service.service_details.catering.menuImage === 'string') {
    return service.service_details.catering.menuImage;
  }
  
  // Try to extract from menu items
  const menuImage = extractCateringMenuImage(service);
  if (typeof menuImage === 'string') return menuImage;
  
  // Use main service image as last resort before fallback
  if (typeof service.image === 'string') return service.image;
  
  return fallbackImage;
};

/**
 * Utility to log image debugging information
 * 
 * @param serviceName Name of the service for identification
 * @param originalImage Original image URL
 * @param processedImage Processed image URL
 */
export const logImageDebug = (
  serviceName: string,
  originalImage?: string | null,
  processedImage?: string | null
): void => {
  console.log(`[Image Debug] ${serviceName}: Original=${originalImage || 'none'}, Processed=${processedImage || 'none'}`);
};
