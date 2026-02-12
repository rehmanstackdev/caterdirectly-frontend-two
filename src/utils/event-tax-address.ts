interface StripeAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

/**
 * Geocodes an event location string - stubbed
 */
export const geocodeEventLocationForTax = async (eventLocation: string): Promise<StripeAddress | null> => {
  console.log('API Call: POST', { url: '/geocoding', data: { address: eventLocation, type: 'geocode' } });
  console.log('API Call Complete: POST', { url: '/geocoding', result: null });
  return null;
};