/**
 * SINGLE SOURCE OF TRUTH for service item data processing
 * All components should use this processor instead of duplicating logic
 */

import { safeStringValue, extractImageUrl, ensureStringId } from '@/utils/data-transform';
import { ProcessedServiceItem, ProcessedComboCategory, ProcessedComboItem, ProcessedService } from '@/types/processed-item';
import { formatUnifiedServicePrice } from '@/utils/unified-price-utils';

/**
 * Process raw service data into a clean, typed service object
 */
export const processService = (rawService: any): ProcessedService => {
  const serviceId = ensureStringId(rawService?.id || rawService?.serviceId);
  const serviceName = safeStringValue(rawService?.serviceName || rawService?.name, 'Service');
  const serviceType = safeStringValue(rawService?.serviceType || rawService?.type, 'general');
  
  return {
    id: serviceId,
    name: serviceName,
    type: serviceType,
    serviceType: serviceType,
    price: safeStringValue(rawService?.price || rawService?.servicePrice, '0'),
    priceDisplay: formatUnifiedServicePrice(rawService) || 'Contact for pricing',
    image: extractImageUrl(rawService?.image || rawService?.serviceImage),
    description: safeStringValue(rawService?.description, ''),
    vendorName: safeStringValue(rawService?.vendorName || rawService?.vendor_name, 'Vendor'),
    location: safeStringValue(rawService?.location, ''),
    items: processServiceItems(rawService?.items || [], serviceType),
    rawData: rawService
  };
};

/**
 * Process raw service items into clean, typed item objects
 */
export const processServiceItems = (rawItems: any[], serviceType?: string): ProcessedServiceItem[] => {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((rawItem, index) => processServiceItem(rawItem, index, serviceType));
};

/**
 * Process a single raw service item into a clean, typed item object
 */
export const processServiceItem = (rawItem: any, fallbackIndex: number = 0, serviceType?: string): ProcessedServiceItem => {
  const itemId = ensureStringId(rawItem?.id || rawItem?.itemId || `item-${fallbackIndex}`);
  const itemName = safeStringValue(rawItem?.name || rawItem?.itemName || rawItem?.serviceName, 'Item');
  const itemDescription = safeStringValue(rawItem?.description || rawItem?.itemDescription, '');
  
  // Extract price safely - handle combo items with pricePerPerson
  const rawPrice = rawItem?.price || rawItem?.pricePerPerson || rawItem?.itemPrice || rawItem?.servicePrice || 0;
  const itemPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(safeStringValue(rawPrice, '0')) || 0;
  
  // Format price display
  const priceDisplay = itemPrice > 0 ? `$${itemPrice.toFixed(2)}` : 'Free';
  
  // Extract image safely from multiple possible sources
  const itemImage = extractImageUrl(
    rawItem?.image || 
    rawItem?.imageUrl ||
    rawItem?.itemImage || 
    rawItem?.serviceImage ||
    rawItem?.image_url ||
    rawItem?.photo ||
    rawItem?.picture
  );
  
  // Check if this is a combo item
  const isCombo = isComboItem(rawItem);
  
  // Process combo categories if this is a combo item
  const comboCategories = isCombo ? processComboCategories(rawItem?.comboCategories || rawItem?.categories || []) : undefined;
  
  // Extract minimum quantity
  const minQuantity = typeof rawItem?.minQuantity === 'number' ? Math.max(1, rawItem.minQuantity) : 1;
  
  return {
    id: itemId,
    name: itemName,
    price: itemPrice,
    priceDisplay,
    image: itemImage,
    description: itemDescription,
    type: safeStringValue(rawItem?.type || serviceType, 'general'),
    serviceType: safeStringValue(serviceType || rawItem?.serviceType, 'general'),
    minQuantity,
    isCombo,
    comboCategories,
    // Staff-specific fields
    duration: typeof rawItem?.duration === 'number' ? rawItem.duration : undefined,
    hourlyRate: typeof rawItem?.hourlyRate === 'number' ? rawItem.hourlyRate : undefined,
    rawData: rawItem
  };
};

/**
 * Check if an item is a combo item (has customizable categories/options)
 */
export const isComboItem = (item: any): boolean => {
  if (!item) return false;
  
  // Check for combo indicators
  const hasComboCategories = Array.isArray(item?.comboCategories) && item.comboCategories.length > 0;
  const hasCategories = Array.isArray(item?.categories) && item.categories.length > 0;
  const hasOptions = Array.isArray(item?.options) && item.options.length > 0;
  const isCustomizable = item?.customizable === true;
  const isComboType = item?.category === 'Combos' || item?.type === 'combo';
  
  return hasComboCategories || hasCategories || hasOptions || isCustomizable || isComboType;
};

/**
 * Process combo categories into clean, typed objects
 */
export const processComboCategories = (rawCategories: any[]): ProcessedComboCategory[] => {
  if (!Array.isArray(rawCategories)) {
    return [];
  }

  return rawCategories.map((rawCategory, index) => ({
    id: ensureStringId(rawCategory?.id || `category-${index}`),
    name: safeStringValue(rawCategory?.name || rawCategory?.title, `Category ${index + 1}`),
    description: safeStringValue(rawCategory?.description, ''),
    minSelections: typeof rawCategory?.minSelections === 'number' ? rawCategory.minSelections : 0,
    maxSelections: typeof rawCategory?.maxSelections === 'number' ? rawCategory.maxSelections : 1,
    items: processComboItems(rawCategory?.items || rawCategory?.options || [])
  }));
};

/**
 * Process combo items into clean, typed objects
 */
export const processComboItems = (rawItems: any[]): ProcessedComboItem[] => {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems.map((rawItem, index) => ({
    id: ensureStringId(rawItem?.id || `combo-item-${index}`),
    name: safeStringValue(rawItem?.name || rawItem?.title, `Option ${index + 1}`),
    description: safeStringValue(rawItem?.description, ''),
    price: typeof rawItem?.price === 'number' ? rawItem.price : parseFloat(safeStringValue(rawItem?.price, '0')) || 0,
    priceDisplay: typeof rawItem?.price === 'number' && rawItem.price > 0 ? `+$${rawItem.price.toFixed(2)}` : 'No extra cost',
    image: extractImageUrl(
      rawItem?.image || 
      rawItem?.itemImage || 
      rawItem?.imageUrl ||
      rawItem?.image_url ||
      rawItem?.photo ||
      rawItem?.picture
    )
  }));
};