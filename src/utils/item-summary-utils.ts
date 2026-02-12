
import { ServiceSelection } from "@/types/order";
import { getMenuItems } from "@/hooks/events/utils/menu-utils";

/**
 * Generates a detailed, comma-separated summary of selected items with quantities
 * @param service The service selection object
 * @param selectedItems Record of itemId -> quantity for selected items
 * @returns Formatted string like "Item Name (2), Another Item (1)" or "No items selected"
 */
export const getDetailedItemsSummary = (service: ServiceSelection, selectedItems: Record<string, number> = {}): string => {
  const serviceType = service.serviceType || service.type;
  
  // Get items based on service type
  let availableItems: any[] = [];
  
  switch (serviceType) {
    case 'catering':
      // Use the proven getMenuItems utility that all other components use
      const serviceForUtility = {
        id: service.serviceId || service.id,
        service_details: service.service_details || service,
        type: serviceType,
        serviceType: serviceType
      };
      availableItems = getMenuItems(serviceForUtility);
      break;
      
    case 'party-rental':
    case 'party-rentals':
      const details = service.service_details || service;
      availableItems = details.rentalItems || details.items || [];
      break;
      
    case 'staff':
      const staffDetails = service.service_details || service;
      availableItems = staffDetails.staffServices || staffDetails.services || [];
      break;
      
    case 'venue':
    case 'venues':
      const venueDetails = service.service_details || service;
      availableItems = venueDetails.venueOptions || venueDetails.options || [];
      break;
      
    default:
      availableItems = [];
  }
  
  // Find selected items and build summary
  const selectedItemsSummary: string[] = [];
  
  Object.entries(selectedItems).forEach(([itemId, quantity]) => {
    if (quantity > 0) {
      const item = availableItems.find(item => item.id === itemId);
      if (item) {
        const itemName = item.name || item.title || 'Unknown Item';
        selectedItemsSummary.push(`${itemName} (${quantity})`);
      }
    }
  });
  
  // Return formatted summary
  if (selectedItemsSummary.length === 0) {
    return 'No items selected';
  }
  
  // If too many items, truncate for readability
  if (selectedItemsSummary.length > 3) {
    const firstThree = selectedItemsSummary.slice(0, 3);
    const remaining = selectedItemsSummary.length - 3;
    return `${firstThree.join(', ')} and ${remaining} more item${remaining !== 1 ? 's' : ''}`;
  }
  
  return selectedItemsSummary.join(', ');
};

/**
 * Gets a fallback summary for services with duration but no selectable items
 * @param service The service selection object
 * @returns Duration-based summary for staff/venue services
 */
export const getDurationBasedSummary = (service: ServiceSelection): string => {
  const serviceType = service.serviceType || service.type;
  
  if (serviceType === 'staff' && service.duration) {
    return `${service.duration} hour${service.duration !== 1 ? 's' : ''} needed`;
  }
  
  if ((serviceType === 'venue' || serviceType === 'venues') && service.duration) {
    return `${service.duration} hour${service.duration !== 1 ? 's' : ''} booking`;
  }
  
  return `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} service`;
};
