
import { LocationData, SCRIPT_ID } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Module-level singleton state for script loading
let loadingPromise: Promise<void> | null = null;
let loaded = false;
let loadError: string | null = null;

// Call our geocoding edge function
const callGeocodingFunction = async (params: any) => {
  const { data, error } = await supabase.functions.invoke('geocoding', {
    body: params
  });
  
  if (error) {
    console.error('Geocoding function error:', error);
    console.error('Error details:', { status: error.status, message: error.message, context: error.context });
    throw new Error(error.message);
  }
  
  return data;
};

// Get Google Maps API key from edge function with timeout and fallback
const getGoogleMapsApiKey = async (): Promise<string> => {
  try {
    console.log('Fetching Google Maps API key from edge function...');
    
    // Add timeout to the request
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );
    
    const requestPromise = supabase.functions.invoke('get-maps-key');
    
    const { data, error } = await Promise.race([requestPromise, timeoutPromise]) as any;
    
    if (error) {
      console.error('Maps API key function error:', error);
      console.error('Error details:', { status: error.status, message: error.message, context: error.context });
      throw new Error(error.message);
    }
    
    if (!data || !data.apiKey) {
      console.error('No API key returned from edge function:', data);
      throw new Error('No API key received');
    }
    
    console.log('Successfully fetched API key from edge function');
    return data.apiKey;
  } catch (error) {
    console.error('Error fetching Google Maps API key:', error);
    throw new Error(`Failed to get API key: ${error.message}`);
  }
};

// Extract city, state from Google geocoding result
export const extractLocationFromAddress = async (addressStr: string): Promise<LocationData | undefined> => {
  try {
    if (!addressStr) return undefined;

    // Use Google Geocoding API to get detailed address components
    const result = await callGeocodingFunction({
      address: addressStr,
      type: 'geocode'
    });

    if (result.status === 'OK' && result.results && result.results.length > 0) {
      const googleResult = result.results[0];
      const components = googleResult.address_components;
      const geometry = googleResult.geometry;

      let city = '';
      let state = '';

      // Extract city and state from Google's address components
      components.forEach((component: any) => {
        if (component.types.includes('locality')) {
          city = component.long_name;
        } else if (component.types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
      });

      if (city && state && geometry?.location) {
        return {
          city,
          state,
          lat: geometry.location.lat,
          lng: geometry.location.lng
        };
      }
    }

    // Fallback to original parsing if Google fails
    const usMatch = addressStr.match(/([^,]+),\s*([A-Z]{2})\s*(\d{5}(-\d{4})?)/);
    if (usMatch) {
      const city = usMatch[1].trim();
      const state = usMatch[2].trim();
      
      // Try to geocode just the city, state
      try {
        const cityResult = await callGeocodingFunction({
          address: `${city}, ${state}`,
          type: 'geocode'
        });
        
        if (cityResult.status === 'OK' && cityResult.results?.[0]?.geometry?.location) {
          const location = cityResult.results[0].geometry.location;
          return {
            city,
            state,
            lat: location.lat,
            lng: location.lng
          };
        }
      } catch (error) {
        console.warn('Fallback geocoding failed:', error);
      }
      
      return {
        city,
        state,
        lat: 0,
        lng: 0
      };
    }
    
    return undefined;
  } catch (error) {
    console.error('Error extracting location data:', error);
    return undefined;
  }
};

export const validateFullAddress = async (addressStr: string): Promise<boolean> => {
  if (!addressStr || addressStr.trim().length < 8) {
    return false;
  }
  
  try {
    // Use Google Geocoding to validate the address
    const result = await callGeocodingFunction({
      address: addressStr,
      type: 'geocode'
    });

    // Google returns OK status for valid addresses
    return result.status === 'OK' && result.results && result.results.length > 0;
  } catch (error) {
    console.error('Address validation error:', error);
    
    // Fallback to basic validation if API fails
    const hasComma = addressStr.includes(',');
    const hasStreetNumber = /\d+/.test(addressStr);
    const hasStreetName = /\d+\s+[A-Za-z]/.test(addressStr);
    const hasParts = addressStr.split(',').length >= 2;
    
    const validConditions = [hasComma, hasStreetNumber, hasStreetName, hasParts]
      .filter(Boolean).length;
      
    return validConditions >= 3;
  }
};

// Function to load Google Places API script with singleton pattern to prevent duplicates
export const loadGooglePlacesScript = async (
  setIsLoading: (loading: boolean) => void,
  setScriptLoaded: (loaded: boolean) => void,
  setScriptError: (error: boolean | string) => void,
  initAutocomplete: () => void
): Promise<void> => {
  // If already loaded successfully, just initialize and return
  if (loaded && window.google?.maps?.places) {
    console.log('Google Places API already loaded - using existing instance');
    setScriptLoaded(true);
    setIsLoading(false);
    initAutocomplete();
    return;
  }

  // If we had a previous error, report it immediately
  if (loadError) {
    console.error('Previous script load error:', loadError);
    setScriptError(loadError);
    setIsLoading(false);
    return;
  }

  // If a load is already in progress, wait for it
  if (loadingPromise) {
    console.log('Script load already in progress - waiting for completion');
    try {
      await loadingPromise;
      if (loaded && window.google?.maps?.places) {
        setScriptLoaded(true);
        setIsLoading(false);
        initAutocomplete();
      } else if (loadError) {
        setScriptError(loadError);
        setIsLoading(false);
      }
    } catch (error) {
      setScriptError('load_failed');
      setIsLoading(false);
    }
    return;
  }

  // Start a new load
  console.log('Starting new Google Places API script load');
  setIsLoading(true);
  setScriptError(false);

  loadingPromise = (async () => {
    try {
      // Check if already available (race condition guard)
      if (window.google?.maps?.places) {
        console.log('Google Places API became available during init');
        loaded = true;
        return;
      }

      // Check if script tag already exists (shouldn't happen with singleton, but guard anyway)
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript && window.google?.maps?.places) {
        console.log('Script tag exists and Places is ready');
        loaded = true;
        return;
      }

      // Get the API key
      let apiKey: string;
      try {
        apiKey = await getGoogleMapsApiKey();
        console.log('API key fetched successfully for script loading');
      } catch (error) {
        console.error('Failed to get API key for script loading:', error);
        loadError = 'api_key_fetch_failed';
        throw new Error('API key fetch failed');
      }

      // Create a promise that resolves when the script is loaded and Places is ready
      const scriptLoadPromise = new Promise<void>((resolve, reject) => {
        // Set up the global callback
        window.initGoogleMapsAutocomplete = () => {
          // Verify Places API is actually available
          if (window.google?.maps?.places) {
            console.log('Google Maps API loaded and Places verified via callback');
            resolve();
          } else {
            console.warn('Callback fired but Places not yet available, will poll');
          }
        };

        // Create and load the script
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsAutocomplete`;
        script.async = true;
        script.defer = true;

        script.onerror = (event) => {
          console.error('Google Maps script failed to load:', event);
          loadError = 'script_load_failed';
          reject(new Error('Script load failed'));
        };

        // Polling fallback in case callback doesn't fire
        let pollCount = 0;
        const maxPolls = 50; // 15 seconds at 300ms intervals
        const pollInterval = 300;

        const pollForPlaces = () => {
          if (window.google?.maps?.places) {
            console.log('Google Places API verified via polling');
            resolve();
            return;
          }

          pollCount++;
          if (pollCount < maxPolls) {
            setTimeout(pollForPlaces, pollInterval);
          } else {
            console.error('Google Places API not available after polling timeout');
            loadError = 'places_unavailable';
            reject(new Error('Places API timeout'));
          }
        };

        // Start polling after a brief delay
        setTimeout(pollForPlaces, 1000);

        document.head.appendChild(script);
        console.log('Google Maps script added to document head');
      });

      // Wait for the script to load
      await scriptLoadPromise;
      loaded = true;
      console.log('Google Places script load completed successfully');

    } catch (error) {
      console.error('Error in loadGooglePlacesScript:', error);
      if (!loadError) {
        loadError = 'load_error';
      }
      throw error;
    }
  })();

  // Wait for the singleton promise
  try {
    await loadingPromise;
    if (loaded && window.google?.maps?.places) {
      setScriptLoaded(true);
      initAutocomplete();
    } else {
      setScriptError(loadError || 'unknown_error');
      toast.error("Failed to load location services");
    }
  } catch (error) {
    setScriptError(loadError || 'load_exception');
    toast.error("Failed to load location services");
  } finally {
    setIsLoading(false);
  }
};

// Function to update location data with real geocoding
export const updateLocationData = async (
  addressStr: string,
  locationData: LocationData | undefined, 
  setAddress: (address: string) => void,
  setCoordinates: (coordinates: {lat: number, lng: number}) => void,
  onAddressSelected?: (address: string, locationData?: LocationData) => void
): Promise<boolean> => {
  if (!addressStr || !addressStr.trim()) {
    toast.error("Please enter a valid address");
    return false;
  }
  
  // Validate that the address is complete using real API
  const isValid = await validateFullAddress(addressStr);
  if (!isValid) {
    toast.error("Please enter a complete address");
    return false;
  }

  try {
    console.log("Updating location data with address:", addressStr);
    setAddress(addressStr);
    
    // If locationData is provided, use it; otherwise geocode the address
    let coordinates = {
      lat: locationData?.lat ?? 0,
      lng: locationData?.lng ?? 0
    };

    if (!locationData || (locationData.lat === 0 && locationData.lng === 0)) {
      try {
        const result = await callGeocodingFunction({
          address: addressStr,
          type: 'geocode'
        });

        if (result.status === 'OK' && result.results?.[0]?.geometry?.location) {
          const location = result.results[0].geometry.location;
          coordinates = {
            lat: location.lat,
            lng: location.lng
          };
        }
      } catch (error) {
        console.warn('Geocoding failed, using default coordinates:', error);
      }
    }
    
    setCoordinates(coordinates);
    
    if (onAddressSelected) {
      onAddressSelected(addressStr, {
        ...locationData,
        lat: coordinates.lat,
        lng: coordinates.lng
      });
    }
    
    toast.success("Address validated");
    
    console.log("Location updated:", { address: addressStr, coordinates });
    return true;
  } catch (error) {
    console.error('Error updating location data:', error);
    toast.error("Failed to update location");
    return false;
  }
};

// Function to handle current location request with real reverse geocoding
export const handleCurrentLocation = (
  setIsLoading: (loading: boolean) => void,
  setInputValue: (value: string) => void,
  setAddress: (address: string) => void,
  setCoordinates: (coordinates: {lat: number, lng: number}) => void,
  onAddressSelected?: (address: string, locationData?: LocationData) => void,
  setGeolocationError?: (error: string | null) => void
): void => {
  if (!navigator.geolocation) {
    const errorMsg = "Geolocation is not supported by your browser";
    toast.error(errorMsg);
    if (setGeolocationError) setGeolocationError(errorMsg);
    return;
  }
  
  setIsLoading(true);
  if (setGeolocationError) setGeolocationError(null);
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        
        // Use real reverse geocoding to get address from coordinates
        const result = await callGeocodingFunction({
          lat: latitude,
          lng: longitude,
          type: 'reverse'
        });

        let fullAddress = `${latitude}, ${longitude}`; // fallback
        let locationData: LocationData | undefined;

        if (result.status === 'OK' && result.results && result.results.length > 0) {
          const googleResult = result.results[0];
          fullAddress = googleResult.formatted_address;
          
          // Extract city and state from components
          const components = googleResult.address_components;
          let city = '';
          let state = '';

          components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              city = component.long_name;
            } else if (component.types.includes('administrative_area_level_1')) {
              state = component.short_name;
            }
          });

          if (city && state) {
            locationData = {
              city,
              state,
              lat: latitude,
              lng: longitude
            };
          }
        }
        
        setInputValue(fullAddress);
        setAddress(fullAddress);
        setCoordinates({ lat: latitude, lng: longitude });
        
        if (onAddressSelected) {
          onAddressSelected(fullAddress, locationData);
        }
        
        toast.success("Using your current location");
        
        setIsLoading(false);
        console.log("Using current location:", { lat: latitude, lng: longitude, address: fullAddress });
      } catch (error) {
        console.error('Error processing current location:', error);
        setIsLoading(false);
        const errorMsg = "Failed to process your location";
        toast.error(errorMsg);
        if (setGeolocationError) setGeolocationError(errorMsg);
      }
    },
    (error) => {
      console.error('Geolocation error:', error);
      setIsLoading(false);
      
      let errorMsg: string;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMsg = "Location permission denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMsg = "Location information unavailable";
          break;
        case error.TIMEOUT:
          errorMsg = "Location request timed out";
          break;
        default:
          errorMsg = `Error getting location: ${error.message}`;
      }
      
      toast.error(errorMsg);
      if (setGeolocationError) setGeolocationError(errorMsg);
    },
    { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
  );
};
