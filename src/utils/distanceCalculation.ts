/**
 * Distance Calculation Utilities
 * 
 * This file provides two methods for calculating distance between coordinates:
 * 1. Haversine Formula (free, straight-line distance)
 * 2. Google Distance Matrix API (paid, road distance)
 */

interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculate straight-line distance between two points using Haversine formula
 * This is FREE and doesn't require API calls
 * 
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 * @returns Distance in kilometers
 */
export const calculateHaversineDistance = (
  origin: Coordinates,
  destination: Coordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  
  const toRad = (value: number) => (value * Math.PI) / 180;
  
  const dLat = toRad(destination.lat - origin.lat);
  const dLng = toRad(destination.lng - origin.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(origin.lat)) *
      Math.cos(toRad(destination.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculate road distance using Google Distance Matrix API
 * This requires API calls and has usage costs
 * 
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 * @returns Promise with distance in kilometers
 */
export const calculateGoogleDistance = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps not loaded'));
      return;
    }

    const service = new google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix(
      {
        origins: [{ lat: origin.lat, lng: origin.lng }],
        destinations: [{ lat: destination.lat, lng: destination.lng }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        if (status === 'OK' && response) {
          const result = response.rows[0]?.elements[0];
          
          if (result?.status === 'OK' && result.distance) {
            // Distance is in meters, convert to kilometers
            const distanceKm = result.distance.value / 1000;
            resolve(Math.round(distanceKm * 100) / 100);
          } else {
            reject(new Error('No route found'));
          }
        } else {
          reject(new Error(`Distance Matrix API error: ${status}`));
        }
      }
    );
  });
};

/**
 * Calculate distance with fallback
 * Tries Google Distance Matrix first, falls back to Haversine if it fails
 * 
 * @param origin - Starting coordinates
 * @param destination - Ending coordinates
 * @returns Promise with distance in kilometers
 */
export const calculateDistance = async (
  origin: Coordinates,
  destination: Coordinates
): Promise<{ distance: number; method: 'google' | 'haversine' }> => {
  try {
    const distance = await calculateGoogleDistance(origin, destination);
    return { distance, method: 'google' };
  } catch (error) {
    console.warn('Google Distance Matrix failed, using Haversine:', error);
    const distance = calculateHaversineDistance(origin, destination);
    return { distance, method: 'haversine' };
  }
};

/**
 * Format distance for display
 * 
 * @param distanceKm - Distance in kilometers
 * @returns Formatted string (e.g., "3.2 km" or "0.5 km")
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Example usage for invoice generation:
 * 
 * // Fetch vendor and creator locations from database
 * const vendorLocation = { lat: 40.7128, lng: -74.0060 };
 * const creatorLocation = { lat: 40.7589, lng: -73.9851 };
 * 
 * // Calculate distance
 * const { distance, method } = await calculateDistance(
 *   creatorLocation,
 *   vendorLocation
 * );
 * 
 * console.log(`Distance: ${formatDistance(distance)} (calculated using ${method})`);
 * 
 * // Store in invoice
 * const invoiceData = {
 *   ...otherInvoiceFields,
 *   distance_km: distance,
 *   creator_location: creatorLocation,
 *   vendor_location: vendorLocation
 * };
 */
