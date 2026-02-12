/**
 * Utility functions for handling address formatting and display
 */

/**
 * Extracts the city name from a full address string
 * @param address - Full address string (e.g., "123 Main St, Boston, MA 02101")
 * @returns The city name or the first part as fallback
 */
export const getDisplayCity = (address: string): string => {
  if (!address || typeof address !== 'string') {
    return '';
  }
  
  console.log('getDisplayCity input:', address);
  
  const parts = address.split(',').map(part => part.trim());
  console.log('getDisplayCity parts:', parts);
  
  // Check if this looks like a malformed address (no commas, likely just street)
  if (parts.length === 1) {
    console.warn('Malformed address detected (no city found):', address);
    return ''; // Return empty instead of street name
  }
  
  // Return city (second part) for properly formatted addresses
  // Most addresses are formatted as: "Street, City, State ZIP"
  const city = parts.length >= 2 ? parts[1] : '';
  console.log('getDisplayCity result:', city);
  return city;
};

/**
 * Detects if a string looks like a street address (contains numbers or common street suffixes)
 */
const isStreetAddress = (str: string): boolean => {
  const streetIndicators = /\b\d+\b|(\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|pl|place|way|cir|circle)\b)/i;
  return streetIndicators.test(str);
};

/**
 * Gets city and state display from a full address string
 * @param address - Full address string (e.g., "123 Main St, Boston, MA 02101")
 * @returns "City, State" format or empty string if not found
 */
export const getCityStateDisplay = (address: string): string => {
  if (!address || typeof address !== 'string') {
    return '';
  }
  
  const parts = address.split(',').map(part => part.trim());
  
  // Check if this looks like a malformed address (no commas, likely just street)
  if (parts.length === 1) {
    return '';
  }
  
  // For properly formatted addresses: "Street, City, State ZIP"
  if (parts.length >= 3) {
    const city = parts[1];
    const stateZip = parts[2];
    // Extract just the state (before ZIP code)
    const state = stateZip.split(' ')[0];
    return city && state ? `${city}, ${state}` : '';
  }
  
  // For addresses with just "City, State ZIP" - but check if first part is actually a street
  if (parts.length === 2) {
    const firstPart = parts[0];
    const secondPart = parts[1];
    
    // If first part looks like a street address, this is likely truncated data
    if (isStreetAddress(firstPart)) {
      return ''; // Return empty for malformed/truncated addresses
    }
    
    // Otherwise treat as "City, State ZIP"
    const city = firstPart;
    const stateZip = secondPart;
    const state = stateZip.split(' ')[0];
    return city && state ? `${city}, ${state}` : '';
  }
  
  return '';
};

/**
 * Formats an address for display purposes
 * @param address - Full address string
 * @param showFullAddress - Whether to show full address or just city
 * @returns Formatted address string
 */
export const formatDisplayAddress = (address: string, showFullAddress: boolean = false): string => {
  if (!address || typeof address !== 'string') {
    return '';
  }
  
  return showFullAddress ? address : getDisplayCity(address);
};