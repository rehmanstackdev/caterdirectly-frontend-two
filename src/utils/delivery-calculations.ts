import { DeliveryOptions, DeliveryRange } from '@/types/service-types';

/**
 * Utility functions for calculating delivery fees based on service delivery options
 */

export interface DeliveryCalculationResult {
  fee: number;
  range: string;
  eligible: boolean;
  reason?: string;
}

/**
 * Parse distance from various formats (e.g., "5 miles", "0-10 miles", "10-15 miles")
 */
export const parseDistanceFromRange = (range: string): { min: number; max: number } => {
  if (!range) return { min: 0, max: 0 };
  
  // Handle specific "75-100 miles" format
  if (range.includes('75-100')) {
    return { min: 75, max: 100 };
  }
  
  const input = String(range)
    .toLowerCase()
    .replace(/[–—−]/g, '-') // normalize en/em/minus dashes to hyphen
    .replace(/\bmi(?:les)?\b/g, '') // drop unit words
    .replace(/[^\d\.\-\s]/g, '')
    .trim();

  const match = input.match(/(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?/);
  if (match) {
    const min = parseFloat(match[1]);
    const max = match[2] ? parseFloat(match[2]) : min;
    // Enforce 100-mile maximum
    return { min, max: Math.min(max, 100) };
  }

  const num = parseFloat(input);
  if (!isNaN(num)) return { min: 0, max: Math.min(num, 100) };
  return { min: 0, max: 0 };
};

/**
 * Get the best address for a service for distance calculations
 * Prioritizes full_address over component-based assembly
 */
export const getServiceAddress = (service: any): string => {
  console.log(`[getServiceAddress] Processing service:`, {
    serviceName: service?.name || service?.serviceName,
    vendorFullAddress: service.vendor?.full_address || service.vendor?.fullAddress,
    serviceLocation: service?.location,
    vendorComponentAddress: service.vendor ? `${service.vendor.city}, ${service.vendor.state}` : 'no vendor',
    vendorId: service.vendor_id,
    hasVendor: !!service.vendor
  });
  
  // For services with vendors that have full_address (snake_case) or fullAddress (camelCase), use that
  if (service.vendor?.full_address) {
    console.log(`[getServiceAddress] Using vendor full_address: ${service.vendor.full_address}`);
    return service.vendor.full_address;
  }
  
  if (service.vendor?.fullAddress) {
    console.log(`[getServiceAddress] Using vendor fullAddress: ${service.vendor.fullAddress}`);
    return service.vendor.fullAddress;
  }
  
  // Fallback to service location if available and meaningful
  if (service.location && service.location !== '' && service.location.length > 3) {
    console.log(`[getServiceAddress] Using service location: ${service.location}`);
    return service.location;
  }
  
  // Fallback to vendor component-based address - construct full address from parts
  if (service.vendor?.city && service.vendor?.state) {
    const addressParts = [];
    
    if (service.vendor.address) {
      addressParts.push(service.vendor.address);
    }
    if (service.vendor.city) {
      addressParts.push(service.vendor.city);
    }
    if (service.vendor.state) {
      let statePart = service.vendor.state;
      // Handle both zip_code (snake_case) and zipCode (camelCase)
      const zipCode = service.vendor.zip_code || service.vendor.zipCode;
      if (zipCode) {
        statePart += ` ${zipCode}`;
      }
      addressParts.push(statePart);
    }
    
    const address = addressParts.join(', ');
    console.log(`[getServiceAddress] Using vendor component address: ${address}`);
    return address;
  }
  
  // Last resort - return empty string which will be handled by caller
  console.log(`[getServiceAddress] No valid address found for service. Vendor data:`, service.vendor);
  return '';
};

/**
 * Calculate delivery fee based on distance and service delivery options
 */
export const calculateDeliveryFee = (
  deliveryAddress: string,
  serviceDeliveryOptions: DeliveryOptions,
  actualDistance?: number // In miles, if available from geocoding
): DeliveryCalculationResult => {
  console.log(`[delivery-calculations] Calculating delivery fee for address: "${deliveryAddress}"`);
  console.log(`[delivery-calculations] Service delivery options:`, serviceDeliveryOptions);
  console.log(`[delivery-calculations] Actual distance provided:`, actualDistance);
  
  // Return free delivery if delivery is not offered
  if (!serviceDeliveryOptions?.delivery) {
    const result = {
      fee: 0,
      range: 'N/A',
      eligible: false,
      reason: 'Delivery not offered by this service'
    };
    console.log(`[delivery-calculations] Delivery not offered:`, result);
    return result;
  }

  const deliveryRanges = serviceDeliveryOptions.deliveryRanges || [];
  
  // If no delivery ranges specified, assume free delivery
  if (deliveryRanges.length === 0) {
    const result = {
      fee: 0,
      range: 'No range specified',
      eligible: true
    };
    console.log(`[delivery-calculations] No delivery ranges specified:`, result);
    return result;
  }

  // Use provided actualDistance (in miles); if unavailable, default to 0 to avoid random heuristics
  const USE_HEURISTIC = false;
  const estimatedDistance = actualDistance ?? (USE_HEURISTIC ? estimateDistanceFromAddress(deliveryAddress) : 0);
  
  console.log(`[delivery-calculations] Using distance: ${estimatedDistance} miles (actual: ${actualDistance}, heuristic enabled: ${USE_HEURISTIC})`);

  // If we don't have a valid distance and heuristics are disabled, default to first range
  if (!actualDistance && !USE_HEURISTIC) {
    const defaultRange = deliveryRanges[0];
    const result = {
      fee: defaultRange.fee || 0,
      range: defaultRange.range,
      eligible: true,
      reason: 'Distance calculation unavailable - using first delivery range'
    };
    console.log(`[delivery-calculations] No distance data available, using default range:`, result);
    return result;
  }

  // Find the appropriate delivery range
  for (const range of deliveryRanges) {
    const { min, max } = parseDistanceFromRange(range.range);
    console.log(`[delivery-calculations] Checking range "${range.range}" (${min}-${max} miles) against distance ${estimatedDistance} miles`);
    
    if (estimatedDistance >= min && estimatedDistance <= max) {
      const result = {
        fee: range.fee || 0,
        range: range.range,
        eligible: true
      };
      console.log(`[delivery-calculations] Distance ${estimatedDistance} miles matches range "${range.range}":`, result);
      return result;
    }
  }

  // If no range matches, check if we're beyond the maximum range
  const maxRange = Math.max(...deliveryRanges.map(r => parseDistanceFromRange(r.range).max));
  
  if (estimatedDistance > maxRange) {
    const result = {
      fee: 0,
      range: `Beyond ${maxRange} miles`,
      eligible: false,
      reason: `Delivery not available beyond ${maxRange} miles`
    };
    console.log(`[delivery-calculations] Distance beyond maximum range:`, result);
    return result;
  }

  // Default case - use the first range's fee
  const defaultRange = deliveryRanges[0];
  const result = {
    fee: defaultRange.fee || 0,
    range: defaultRange.range,
    eligible: true,
    reason: 'Using default delivery range'
  };
  console.log(`[delivery-calculations] Using default range as fallback:`, result);
  return result;
};

/**
 * Simple distance estimation based on address string
 * This is a placeholder - in production, use Google Maps Distance Matrix API or similar
 * 
 * WARNING: This method provides only rough estimates and should not be used for critical calculations
 */
const estimateDistanceFromAddress = (address: string): number => {
  console.log(`[delivery-calculations] FALLBACK: Estimating distance from address heuristics for "${address}"`);
  console.warn(`[delivery-calculations] WARNING: Using fallback distance estimation - this may be inaccurate`);
  
  if (!address || address.trim().length === 0) {
    console.log(`[delivery-calculations] Empty address, returning default 5 miles`);
    return 5; // Default to 5 miles for empty addresses
  }

  // Simple heuristic based on address complexity
  const addressWords = address.split(/[\s,]+/).filter(word => word.length > 0);
  
  // Very rough estimation:
  // - Same city/nearby: 1-5 miles
  // - Different city but same state: 5-15 miles  
  // - Different state: 15+ miles
  
  let estimate: number;
  if (addressWords.length <= 3) {
    estimate = Math.random() * 5 + 1; // 1-6 miles
  } else if (addressWords.length <= 5) {
    estimate = Math.random() * 10 + 5; // 5-15 miles
  } else {
    estimate = Math.random() * 20 + 15; // 15-35 miles
  }
  
  console.log(`[delivery-calculations] Heuristic estimate for "${address}": ${estimate.toFixed(1)} miles (${addressWords.length} words in address)`);
  return estimate;
};

/**
 * Check if an order meets the delivery minimum for a service
 */
export const checkDeliveryMinimum = (
  orderSubtotal: number,
  serviceDeliveryOptions: DeliveryOptions
): { eligible: boolean; minimumRequired?: number; reason?: string } => {
  console.log(`[delivery-calculations] Checking delivery minimum for subtotal: $${orderSubtotal}`);
  console.log(`[delivery-calculations] Service delivery options:`, serviceDeliveryOptions);
  
  if (!serviceDeliveryOptions?.delivery) {
    const result = { eligible: false, reason: 'Delivery not offered' };
    console.log(`[delivery-calculations] Delivery not offered:`, result);
    return result;
  }

  const deliveryMinimum = serviceDeliveryOptions.deliveryMinimum || 0;
  console.log(`[delivery-calculations] Service minimum required: $${deliveryMinimum}`);
  
  if (deliveryMinimum > 0 && orderSubtotal < deliveryMinimum) {
    const result = {
      eligible: false,
      minimumRequired: deliveryMinimum,
      reason: `Order must be at least $${deliveryMinimum.toFixed(2)} for delivery`
    };
    console.log(`[delivery-calculations] Minimum requirement not met:`, result);
    return result;
  }

  const result = { eligible: true };
  console.log(`[delivery-calculations] Minimum requirement met:`, result);
  return result;
};

/**
 * Get all delivery options for a service in a user-friendly format
 */
export const getDeliveryOptionsDisplay = (deliveryOptions: DeliveryOptions) => {
  const options: string[] = [];

  if (deliveryOptions?.pickup) {
    options.push('Pickup Available');
  }

  if (deliveryOptions?.delivery) {
    if (deliveryOptions.deliveryRanges && deliveryOptions.deliveryRanges.length > 0) {
      const rangeDescriptions = deliveryOptions.deliveryRanges.map(range => {
        const fee = range.fee || 0;
        return `${range.range}: ${fee === 0 ? 'Free' : `$${fee.toFixed(2)}`}`;
      });
      options.push(`Delivery - ${rangeDescriptions.join(', ')}`);
    } else {
      options.push('Delivery Available');
    }

    if (deliveryOptions.deliveryMinimum && deliveryOptions.deliveryMinimum > 0) {
      options.push(`Minimum order: $${deliveryOptions.deliveryMinimum.toFixed(2)}`);
    }
  }

  return options.length > 0 ? options : ['Contact vendor for delivery options'];
};