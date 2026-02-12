
import { ServiceSelection } from "@/types/order";
import { getMenuItems, isStaffService } from "./service-helpers";

/**
 * Calculates the total price for selected menu items for a specific service
 * @param service The service selection object
 * @param selectedItems Record of itemId -> quantity for selected items
 * @returns The total price for selected menu items
 */
export const calculateSelectedItemsTotal = (service: ServiceSelection, selectedItems: Record<string, number> = {}): number => {
  const menuItems = getMenuItems(service);
  const serviceType = service.serviceType || service.type || '';
  
  if (menuItems.length === 0) {
    return 0;
  }
  
  let total = 0;
  
  // Calculate total based on selected menu items
  Object.entries(selectedItems).forEach(([itemId, quantity]) => {
    // Skip duration entries (they're handled separately)
    if (itemId.endsWith('_duration') || quantity <= 0) {
      return;
    }
    
    const menuItem = menuItems.find(item => item.id === itemId);
    if (menuItem) {
      // Handle combo items with pricePerPerson field
      const price = menuItem.pricePerPerson || menuItem.price;
      const itemPrice = typeof price === 'string' 
        ? parseFloat(price.replace(/[^0-9.]/g, '')) 
        : price;
      
      if (!isNaN(itemPrice) && itemPrice > 0) {
        // For staff services, multiply by duration as well
        if (serviceType === 'staff') {
          const duration = selectedItems[`${itemId}_duration`] || 1;
          total += itemPrice * quantity * duration;
        } else {
          total += itemPrice * quantity;
        }
      }
    }
  });
  
  return total;
};

/**
 * Counts selected items for a specific service
 * @param service The service selection object
 * @param selectedItems Record of itemId -> quantity for selected items
 * @returns The count of selected items for this service
 */
export const getSelectedItemsCountForService = (service: ServiceSelection, selectedItems: Record<string, number> = {}): number => {
  const menuItems = getMenuItems(service);
  
  // Build a set of allowed identifiers from available menu items
  const identifiers = new Set<string>();
  if (Array.isArray(menuItems)) {
    menuItems.forEach((item: any) => {
      const candidates = [item?.id, item?.itemId, item?.name, item?.title];
      candidates.forEach((v) => {
        if (v !== undefined && v !== null) {
          identifiers.add(String(v));
        }
      });
    });
  }
  
  const serviceId = (service as any).id || (service as any).serviceId || '';
  let count = 0;
  
  Object.entries(selectedItems).forEach(([itemId, quantity]) => {
    if (itemId.endsWith('_duration') || quantity <= 0) return;

    // Try prefixed form first: <serviceId>_<actualId>
    if (serviceId && itemId.startsWith(serviceId + '_')) {
      const actualId = itemId.substring(serviceId.length + 1);
      if (identifiers.size > 0 && identifiers.has(actualId)) {
        count += quantity;
        return;
      }
    }

    // Direct match (for services that don't prefix keys)
    if (identifiers.size > 0 && identifiers.has(itemId)) {
      count += quantity;
    }
  });
  
  // Fallbacks for staff services without explicit role items
  if (count === 0 && isStaffService?.(service)) {
    // Prefer explicit selection stored in selectedItems[serviceId]
    const selectedHeadcount = serviceId ? Number((selectedItems as any)[serviceId] || 0) : 0;
    if (selectedHeadcount > 0) {
      count = selectedHeadcount;
    } else if (typeof (service as any).quantity === 'number') {
      const q = Number((service as any).quantity) || 0;
      if (q > 0) count = q;
    }
  }
  
  return count;
};
