
import { ServiceItem } from '@/types/service-types';
import { getMenuItems } from '@/hooks/events/utils/menu-utils';

// Enhanced comprehensive price type mapping
const PRICE_TYPE_MAPPING: Record<string, string> = {
  'per_person': '/Person',
  'per_hour': '/Hour',
  'per_day': '/Day',
  'per_item': '/Item',
  'flat_rate': '',
  'hourly': '/Hour',
  'daily': '/Day',
  'per_guest': '/Person',
  'per_event': '/Event',
  'fixed': '',
  'one_time': ''
};

/**
 * Clean legacy price formats and extract base price
 */
const cleanLegacyPriceFormat = (priceStr: string): string => {
  if (!priceStr) return '';

  // Remove all legacy "per X" and "/X" suffixes to get clean base price
  const cleaned = priceStr
    // Remove "per hour", "per day", etc. (case insensitive)
    .replace(/\s+per\s+(person|hour|day|item|guest|event)s?/gi, '')
    // Remove "/person", "/hour", etc. (case insensitive)
    .replace(/\s*\/\s*(person|hour|day|item|guest|event)s?/gi, '')
    // Remove "hourly", "daily" (case insensitive)
    .replace(/\s+(hourly|daily)/gi, '')
    .trim();

  return cleaned;
};

/**
 * Check if a price string has the NEW standardized suffix format (/Hour, /Person, etc.)
 * Legacy formats like "per hour" are NOT considered as having existing suffixes
 */
const hasNewFormatSuffix = (priceStr: string): boolean => {
  const newFormatPatterns = [
    /\/Person$/i,
    /\/Hour$/i,
    /\/Day$/i,
    /\/Item$/i,
    /\/Guest$/i,
    /\/Event$/i
  ];

  return newFormatPatterns.some(pattern => pattern.test(priceStr));
};

/**
 * Calculate price range for services with menu items (like catering)
 */
const calculatePriceRange = (service: ServiceItem): string => {
  const menuItems = getMenuItems(service);
  
  if (!menuItems || menuItems.length === 0) {
    return service.price || '$0';
  }
  
  const itemsWithPrice = menuItems.filter(item => 
    item && 
    item.price !== undefined && 
    item.price !== null && 
    !isNaN(parseFloat(String(item.price)))
  );
  
  if (itemsWithPrice.length === 0) {
    return service.price || '$0';
  }
  
  const prices = itemsWithPrice.map(item => parseFloat(String(item.price)));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const priceFormatOptions = { 
    style: 'currency' as const, 
    currency: 'USD', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  if (minPrice === maxPrice) {
    return new Intl.NumberFormat('en-US', priceFormatOptions).format(minPrice);
  }
  
  return `${new Intl.NumberFormat('en-US', priceFormatOptions).format(minPrice)}-${new Intl.NumberFormat('en-US', priceFormatOptions).format(maxPrice)}`;
};

/**
 * UNIFIED PRICE FORMATTER - Works for ALL service types
 * This is the ONLY function that should be used for price formatting
 * Now handles legacy formats and converts them to the new standardized format
 */
export const formatUnifiedServicePrice = (service: ServiceItem): string => {
  let basePrice = '';

  // For catering services with menu items, calculate range
  if ((service.type === 'catering' || service.serviceType === 'catering')) {
    const menuItems = getMenuItems(service);
    if (menuItems && menuItems.length > 0) {
      basePrice = calculatePriceRange(service);
    } else {
      basePrice = service.price || '$0';
    }
  } else {
    // For all other services, use the standard price
    basePrice = service.price || '$0';
  }

  // If no base price, return default
  if (!basePrice || basePrice === '$0') {
    return 'Price on request';
  }

  // Check if price already has the NEW format suffix - if so, use as-is
  if (hasNewFormatSuffix(basePrice)) {
    return basePrice;
  }

  // Clean any legacy formats from the base price
  const cleanedPrice = cleanLegacyPriceFormat(String(basePrice));

  // Get the appropriate suffix based on price_type
  const priceType = service.price_type?.toLowerCase() || '';
  const suffix = PRICE_TYPE_MAPPING[priceType] || '';

  // Flat rate types don't get suffixes
  const flatRateTypes = ['flat_rate', 'fixed', 'one_time', ''];
  if (flatRateTypes.includes(priceType)) {
    return cleanedPrice;
  }

  // Add suffix if we have one
  if (suffix) {
    return `${cleanedPrice}${suffix}`;
  }

  return cleanedPrice;
};
