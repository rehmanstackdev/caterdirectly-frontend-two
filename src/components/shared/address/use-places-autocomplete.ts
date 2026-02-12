
import { useRef, useEffect, useState } from 'react';
import { loadGooglePlacesScript } from './address-utils';
import { toast } from 'sonner';

export const usePlacesAutocomplete = (
  inputRef: React.RefObject<HTMLInputElement>, 
  onPlaceSelected: (place: any) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | boolean>(false);
  const [networkError, setNetworkError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const autocompleteRef = useRef<any>(null);
  const initializedRef = useRef(false);

  // Initialize autocomplete once script is loaded AND ref is ready
  const initAutocomplete = () => {
    // Guard against multiple initializations (StrictMode protection)
    if (initializedRef.current) {
      console.log('Autocomplete already initialized, skipping');
      return;
    }

    const attemptInit = (attempt = 1) => {
      try {
        // Don't log error if ref is missing - just defer silently
        if (!inputRef.current) {
          if (attempt <= 5) {
            // Retry a few times in case ref is being set up
            setTimeout(() => attemptInit(attempt + 1), 100);
          }
          return;
        }
        
        if (!window.google?.maps?.places?.Autocomplete) {
          if (attempt <= 3) {
            console.log(`Google Places not ready, retrying initialization (attempt ${attempt}/3)...`);
            setTimeout(() => attemptInit(attempt + 1), attempt * 200);
            return;
          } else {
            console.error('Google Places not available after retries');
            setScriptError('google_places_unavailable');
            return;
          }
        }

        // Double-check we haven't initialized already
        if (initializedRef.current || autocompleteRef.current) {
          console.log('Race condition: already initialized');
          return;
        }
      
        console.log('Initializing Google Places autocomplete');
        
        // Create the real Google Places Autocomplete
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['formatted_address', 'geometry', 'address_components', 'place_id']
        });
        
        // Add listener for place selection
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          
          if (!place.geometry) {
            console.warn('No geometry data for selected place');
            toast.error("Invalid address selected");
            return;
          }
          
          console.log('Place selected:', place);
          onPlaceSelected(place);
        });
        
        initializedRef.current = true;
        console.log('Google Places autocomplete initialized successfully');
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
        setScriptError('autocomplete_init_failed');
        toast.error("Failed to initialize address autocomplete");
      }
    };
    
    attemptInit();
  };

  const retryLoadScript = () => {
    if (retryCount < 3) {
      console.log(`Retrying script load, attempt ${retryCount + 1}`);
      setRetryCount(prevCount => prevCount + 1);
      setNetworkError(false);
      setScriptError(false);
      loadScript();
    } else {
      console.error('Max retry attempts reached');
      toast.error("Could not load address service after multiple attempts");
    }
  };

  const loadScript = async () => {
    try {
      console.log('Starting Google Places script load...');
      await loadGooglePlacesScript(
        setIsLoading, 
        setScriptLoaded, 
        (error) => {
          console.error('Script loading error:', error);
          setScriptError(error);
          if (error === 'network' || error === 'script_load_failed') {
            setNetworkError(true);
          }
        }, 
        initAutocomplete
      );
    } catch (error) {
      console.error('Error in loadScript:', error);
      setScriptError('load_script_exception');
      setIsLoading(false);
      toast.error("Failed to load address service");
    }
  };

  useEffect(() => {
    if (!inputRef.current || scriptLoaded || isLoading) {
      return;
    }

    // Defer loading until user interaction
    const handleFocus = () => {
      console.log('usePlacesAutocomplete: Loading on user interaction');
      loadScript();
      inputRef.current?.removeEventListener('focus', handleFocus);
    };

    inputRef.current.addEventListener('focus', handleFocus);
    
    return () => {
      inputRef.current?.removeEventListener('focus', handleFocus);
      // Cleanup autocomplete instance
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      autocompleteRef.current = null;
      initializedRef.current = false;
      
      // Remove any lingering Google Places dropdown elements
      document.querySelectorAll('.pac-container').forEach(el => el.remove());
    };
  }, []);

  return {
    isLoading,
    scriptLoaded,
    scriptError,
    networkError,
    retryLoadScript,
    autocompleteRef
  };
};
