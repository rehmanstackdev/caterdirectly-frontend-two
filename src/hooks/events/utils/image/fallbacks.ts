
import { ServiceItem } from '@/types/service-types';
import { testImageUrl } from './resolvers';
import { ImageSourcesParams } from './types';

/**
 * Try multiple image sources to find a working one for progressive loading
 */
export async function tryImageSources({
  service,
  maxSourcesToTry = 3,
  timeoutMs = 3000
}: ImageSourcesParams): Promise<string | null> {
  if (!service) return null;
  
  // Generate a list of potential image URLs to try
  const potentialSources: string[] = [];
  
  // 1. First try the main image
  if (service.image) {
    potentialSources.push(service.image);
  }
  
  // 2. For catering services, try menu images
  if ((service.type === 'catering' || service.serviceType === 'catering') && 
      service.service_details?.menu) {
    
    // Try to find menu image
    const menu = service.service_details.menu;
    if (menu.image) potentialSources.push(menu.image);
    if (menu.menu_image) potentialSources.push(menu.menu_image);
    
    // Try menu item images
    const menuItems = menu.items || menu.menu_items || [];
    if (Array.isArray(menuItems)) {
      menuItems.slice(0, 3).forEach(item => {
        if (item.image) potentialSources.push(item.image);
      });
    }
  }
  
  // 3. Try additional images if available
  if (service.additional_images && Array.isArray(service.additional_images)) {
    service.additional_images.slice(0, 3).forEach(img => {
      if (img) potentialSources.push(img);
    });
  }
  
  // 4. Try vendor image if available
  if (service.vendor_image) {
    potentialSources.push(service.vendor_image);
  }
  
  // 5. Try category image based on service type
  const typeMapping: Record<string, string> = {
    'catering': 'https://via.placeholder.com/400x300?text=Catering',
    'venue': 'https://via.placeholder.com/400x300?text=Venue',
    'staff': 'https://via.placeholder.com/400x300?text=Staff',
    'party-rental': 'https://via.placeholder.com/400x300?text=Party+Rentals'
  };
  
  if (service.type && typeMapping[service.type]) {
    potentialSources.push(typeMapping[service.type]);
  }
  
  // Limit the number of sources to try for performance
  const sourcesToTry = [...new Set(potentialSources)]
    .slice(0, maxSourcesToTry)
    .filter(Boolean);
  
  // Try each source until we find one that works
  for (const source of sourcesToTry) {
    const isValid = await testImageUrl(source, timeoutMs);
    if (isValid) {
      return source;
    }
  }
  
  // If no valid sources found, return null
  return null;
}
