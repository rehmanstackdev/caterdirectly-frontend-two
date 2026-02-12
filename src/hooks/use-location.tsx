
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
};

type LocationContextType = {
  address: string;
  setAddress: (address: string) => void;
  coordinates: Coordinates | null;
  setCoordinates: (coordinates: Coordinates | null) => void;
  locationSet: boolean;
  explicitLocationFilter: boolean;
  setExplicitLocationFilter: (enabled: boolean) => void;
  enableLocationFiltering: () => void;
  disableLocationFiltering: () => void;
};

// Create context with default values to avoid undefined issues
const defaultLocationContext: LocationContextType = {
  address: '',
  setAddress: () => {},
  coordinates: null,
  setCoordinates: () => {},
  locationSet: false,
  explicitLocationFilter: false,
  setExplicitLocationFilter: () => {},
  enableLocationFiltering: () => {},
  disableLocationFiltering: () => {}
};

const LocationContext = createContext<LocationContextType>(defaultLocationContext);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [explicitLocationFilter, setExplicitLocationFilter] = useState<boolean>(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  
  // Load initial data from localStorage once on mount
  useEffect(() => {
    try {
      const savedAddress = localStorage.getItem('user_address');
      const savedCoordinates = localStorage.getItem('user_coordinates');
      const savedLocationFilter = localStorage.getItem('explicit_location_filter');
      
      console.log('LocationProvider loading from localStorage:', { savedAddress, savedCoordinates, savedLocationFilter });
      
      // Check if address is malformed (no commas = likely just street address)
      if (savedAddress && !savedAddress.includes(',')) {
        console.warn('Clearing malformed address from localStorage:', savedAddress);
        localStorage.removeItem('user_address');
        localStorage.removeItem('user_coordinates');
        localStorage.removeItem('explicit_location_filter');
        return; // Don't set malformed data
      }
      
      if (savedAddress && savedAddress !== address) {
        setAddress(savedAddress);
      }
      
      if (savedCoordinates && !coordinates) {
        const parsedCoords = JSON.parse(savedCoordinates);
        setCoordinates(parsedCoords);
      }
      
      // Only enable location filtering if we have both address and coordinates
      if (savedLocationFilter === 'true' && savedAddress && savedCoordinates) {
        setExplicitLocationFilter(true);
      } else {
        setExplicitLocationFilter(false);
      }
    } catch (error) {
      console.error("LocationProvider: Error loading from localStorage", error);
    } finally {
      setInitialLoadComplete(true);
    }
  }, []); // Only run once on mount
  
  // Save location info to localStorage when it changes (but only after initial render)
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    try {
      if (address) {
        localStorage.setItem('user_address', address);
      } else {
        localStorage.removeItem('user_address');
      }
      
      if (coordinates) {
        localStorage.setItem('user_coordinates', JSON.stringify(coordinates));
      } else {
        localStorage.removeItem('user_coordinates');
      }
      
      // Only save location filter if we have location data
      if (address && coordinates) {
        localStorage.setItem('explicit_location_filter', explicitLocationFilter.toString());
      } else {
        localStorage.removeItem('explicit_location_filter');
      }
    } catch (error) {
      console.error("LocationProvider: Error saving to localStorage", error);
    }
  }, [address, coordinates, explicitLocationFilter, initialLoadComplete]);

  // Auto-disable location filtering when no location data exists
  useEffect(() => {
    if (initialLoadComplete && (!address || !coordinates) && explicitLocationFilter) {
      console.log("LocationProvider: Auto-disabling location filtering - no location data");
      setExplicitLocationFilter(false);
    }
  }, [address, coordinates, explicitLocationFilter, initialLoadComplete]);
  
  const locationSet = !!(address && coordinates);
  
  const enableLocationFiltering = () => {
    // Only enable if we have location data
    if (address && coordinates) {
      console.log("LocationProvider: Enabling location filtering");
      setExplicitLocationFilter(true);
    } else {
      console.warn("LocationProvider: Cannot enable location filtering - no location data");
    }
  };
  
  const disableLocationFiltering = () => {
    console.log("LocationProvider: Disabling location filtering");
    setExplicitLocationFilter(false);
  };
  
  const contextValue = useMemo(() => ({
    address, 
    setAddress, 
    coordinates, 
    setCoordinates,
    locationSet,
    explicitLocationFilter,
    setExplicitLocationFilter,
    enableLocationFiltering,
    disableLocationFiltering
  }), [address, coordinates, locationSet, explicitLocationFilter]);
  
  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  
  if (!context) {
    console.error("useLocation must be used within a LocationProvider");
    // Return default context instead of throwing error to prevent crashes
    return defaultLocationContext;
  }
  
  return context;
};
