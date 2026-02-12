import { ServiceSelection } from "@/types/order";

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
 * Enhanced function to clean price strings of ALL possible suffix variations
 */
const cleanPriceString = (priceStr: string): string => {
  if (!priceStr) return '';
  
  console.log(`[service-price-utils] Cleaning price:`, priceStr);
  
  // Handle price ranges first - clean each part separately
  if (priceStr.includes('-')) {
    const parts = priceStr.split('-').map(part => {
      return part.trim()
        // Remove all variations of "per X" patterns (case insensitive)
        .replace(/\s*(\/|per)\s*(person|hour|day|item|guest|event)s?/gi, '')
        // Remove standalone suffixes at the end
        .replace(/\s*\/(person|hour|day|item|guest|event)s?$/gi, '')
        // Remove "per X" patterns at the end
        .replace(/\s+per\s+(person|hour|day|item|guest|event)s?$/gi, '')
        // Remove hourly, daily etc.
        .replace(/\s+(hourly|daily|per\s+person|per\s+hour|per\s+day|per\s+item)$/gi, '')
        .trim();
    });
    const cleaned = parts.join('-');
    console.log(`[service-price-utils] Range cleaned from "${priceStr}" to "${cleaned}"`);
    return cleaned;
  }
  
  // Clean single price
  const cleaned = priceStr
    // Remove all variations of "per X" patterns (case insensitive)
    .replace(/\s*(\/|per)\s*(person|hour|day|item|guest|event)s?/gi, '')
    // Remove standalone suffixes at the end
    .replace(/\s*\/(person|hour|day|item|guest|event)s?$/gi, '')
    // Remove "per X" patterns at the end
    .replace(/\s+per\s+(person|hour|day|item|guest|event)s?$/gi, '')
    // Remove hourly, daily etc.
    .replace(/\s+(hourly|daily|per\s+person|per\s+hour|per\s+day|per\s+item)$/gi, '')
    // Keep only numbers, dots, dashes, dollar signs and spaces
    .replace(/[^0-9.\-$\s]/g, '')
    .trim();
    
  console.log(`[service-price-utils] Single price cleaned from "${priceStr}" to "${cleaned}"`);
  return cleaned;
};

/**
 * Enhanced function to format price with proper suffix based on price_type
 */
const formatPriceWithSuffix = (cleanPrice: string, priceType: string): string => {
  if (!cleanPrice) return '';
  
  console.log(`[service-price-utils] Formatting price with suffix:`, {
    cleanPrice,
    priceType
  });
  
  // Get the correct suffix from the price type
  const suffix = PRICE_TYPE_MAPPING[priceType?.toLowerCase()] || '';
  
  // Define flat rate types that should NOT get suffixes
  const flatRateTypes = ['flat_rate', 'fixed', 'one_time', ''];
  
  // ALWAYS add the suffix if we have a valid price_type (unless it's a flat rate type)
  if (priceType && !flatRateTypes.includes(priceType.toLowerCase()) && suffix) {
    const result = `${cleanPrice}${suffix}`;
    console.log(`[service-price-utils] Added suffix "${suffix}" to get "${result}"`);
    return result;
  }
  
  console.log(`[service-price-utils] No suffix added, returning "${cleanPrice}"`);
  return cleanPrice;
};

/**
 * Returns the service price as a number, handling different price formats
 * @param service The service selection object
 * @returns The price as a number
 */
export const getServicePrice = (service: ServiceSelection): number => {
  // Priority 1: Combo selections list (NEW - SSOT)
  if (service.comboSelectionsList && service.comboSelectionsList.length > 0) {
    const comboTotal = service.comboSelectionsList.reduce((sum, combo) => sum + (combo.totalPrice || 0), 0);
    console.debug('[ServicePrice] Using combo selections list:', {
      serviceName: service.name,
      comboCount: service.comboSelectionsList.length,
      total: comboTotal
    });
    return comboTotal;
  }
  
  // Priority 2: Legacy single combo (backward compatibility)
  if (service.comboSelections?.totalPrice) {
    console.debug('[ServicePrice] Using legacy combo selection:', {
      serviceName: service.name,
      total: service.comboSelections.totalPrice
    });
    return service.comboSelections.totalPrice;
  }
  
  // Priority 3: Existing service price logic
  console.log(`[getServicePrice] Processing service:`, service.name, {
    servicePrice: service.servicePrice,
    price: service.price,
    priceType: service.priceType || service.price_type
  });
  
  // If this is a combo item with selections, use the total price from combo selections
  if (service.comboSelections) {
    console.log(`[getServicePrice] Using combo selections total:`, service.comboSelections.totalPrice);
    return service.comboSelections.totalPrice;
  }

  let basePrice: number;
  let priceString: string = '';
  
  // Get the raw price string first
  if (typeof service.servicePrice === 'string') {
    priceString = service.servicePrice;
  } else if (typeof service.servicePrice === 'number') {
    basePrice = service.servicePrice;
  } else if (typeof service.price === 'string') {
    priceString = service.price;
  } else if (typeof service.price === 'number') {
    basePrice = service.price;
  }
  
  // If we have a string price, clean it and parse
  if (priceString) {
    console.log(`[getServicePrice] Cleaning price string:`, priceString);
    
    // Handle special cases for hourly pricing (e.g., "$25 per hour")
    if (priceString.toLowerCase().includes('per hour') || priceString.toLowerCase().includes('/hour')) {
      // Extract just the numeric part for hourly rates
      const numericPart = priceString.replace(/[^0-9.]/g, '');
      basePrice = parseFloat(numericPart);
      console.log(`[getServicePrice] Extracted hourly rate:`, basePrice);
    } else {
      const cleanPrice = cleanPriceString(priceString);
      basePrice = parseFloat(cleanPrice.replace(/[^0-9.]/g, ''));
      console.log(`[getServicePrice] Cleaned and parsed:`, cleanPrice, '→', basePrice);
    }
  }
  
  // Set default to 0 if nothing found
  if (basePrice === undefined) {
    basePrice = 0;
  }
  
  const result = isNaN(basePrice) ? 0 : basePrice;
  console.log(`[getServicePrice] Final numeric price for ${service.name}:`, result);
  return result;
};

/**
 * NEW: Enhanced function to get formatted price string with proper suffix
 * @param service The service selection object
 * @returns The formatted price string with suffix
 */
export const getFormattedServicePrice = (service: ServiceSelection): string => {
  // Priority 1: Combo selections list (NEW - SSOT)
  if (service.comboSelectionsList && service.comboSelectionsList.length > 0) {
    const comboTotal = service.comboSelectionsList.reduce((sum, combo) => sum + (combo.totalPrice || 0), 0);
    return `$${comboTotal.toFixed(2)}`;
  }
  
  // Priority 2: Legacy single combo (backward compatibility)
  if (service.comboSelections?.totalPrice) {
    return `$${service.comboSelections.totalPrice.toFixed(2)}`;
  }
  
  // Priority 3: Existing service price logic
  console.log(`[getFormattedServicePrice] Processing service:`, service.name);
  
  // If this is a combo item with selections, use the total price from combo selections
  if (service.comboSelections) {
    const totalPrice = service.comboSelections.totalPrice;
    const priceType = service.priceType || service.price_type || '';
    const formatted = formatPriceWithSuffix(`$${totalPrice.toFixed(2)}`, priceType);
    console.log(`[getFormattedServicePrice] Combo price formatted:`, formatted);
    return formatted;
  }

  // Get the raw price string
  let priceString = '';
  if (typeof service.servicePrice === 'string') {
    priceString = service.servicePrice;
  } else if (typeof service.servicePrice === 'number') {
    priceString = `$${service.servicePrice.toFixed(2)}`;
  } else if (typeof service.price === 'string') {
    priceString = service.price;
  } else if (typeof service.price === 'number') {
    priceString = `$${service.price.toFixed(2)}`;
  }
  
  if (!priceString) {
    console.log(`[getFormattedServicePrice] No price found, returning default`);
    return 'Price on request';
  }
  
  // Clean the price and add proper suffix
  const cleanPrice = cleanPriceString(priceString);
  const priceType = service.priceType || service.price_type || '';
  const formatted = formatPriceWithSuffix(cleanPrice, priceType);
  
  console.log(`[getFormattedServicePrice] Final formatted price:`, {
    original: priceString,
    cleaned: cleanPrice,
    priceType,
    final: formatted
  });
  
  return formatted || 'Price on request';
};
