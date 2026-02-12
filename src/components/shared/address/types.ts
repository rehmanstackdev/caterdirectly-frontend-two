
// Type for location data extracted from address
export interface LocationData {
  city: string;
  state: string;
  street?: string;
  zipCode?: string;
  lat?: number;
  lng?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AddressAutocompleteProps {
  className?: string;
  containerClassName?: string;
  onAddressSelected?: (address: string, locationData?: LocationData) => void;
  placeholder?: string;
}

// Add type declaration for Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMapsAutocomplete: () => void;
  }
}

// This will be the script ID for Google Places API
export const SCRIPT_ID = 'google-places-script';
