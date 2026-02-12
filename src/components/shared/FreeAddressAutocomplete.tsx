import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LocationData } from "./address/types";

interface FreeAddressAutocompleteProps {
  className?: string;
  placeholder?: string;
  onAddressSelected?: (address: string, locationData?: LocationData) => void;
  required?: boolean;
  id?: string;
  name?: string;
  value?: string;
}

interface PhotonResult {
  properties: {
    osm_id: number;
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
}

const FreeAddressAutocomplete = ({
  className,
  placeholder = "123 Main St, City, State",
  onAddressSelected,
  required,
  id = 'free-address-autocomplete',
  name = 'address',
  value
}: FreeAddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState<PhotonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Update internal state when external value changes
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Using Photon API - worldwide address search
      const response = await fetch(
        `https://photon.komoot.io/api/?` +
        `q=${encodeURIComponent(query)}&` +
        `limit=10&` +
        `lang=en`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }

      const data = await response.json();
      const results: PhotonResult[] = data.features || [];
      
      // Show all results with any address information
      const filteredData = results.filter(result => {
        const props = result.properties;
        // Must have at least a name or street
        return props.street || props.name;
      }).slice(0, 10);
      
      setSuggestions(filteredData);
      setShowDropdown(filteredData.length > 0);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Debounce the API call
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchAddress(value);
    }, 300);
  };

  const handleSelectAddress = (result: PhotonResult) => {
    const props = result.properties;
    
    // Build full address string with all available components
    const street = [props.housenumber, props.street].filter(Boolean).join(' ') || props.name || '';
    const city = props.city || '';
    const state = props.state || '';
    const zipCode = props.postcode || '';
    const country = props.country || '';
    
    // Build display address
    const addressParts = [street, city, state, zipCode, country].filter(Boolean);
    const fullAddress = addressParts.join(', ');
    
    setInputValue(fullAddress);
    setShowDropdown(false);
    setSuggestions([]);

    // Photon returns coordinates as [lng, lat]
    const [lng, lat] = result.geometry.coordinates;

    const locationData: LocationData = {
      city: city || 'N/A',
      state: state || 'N/A',
      street: street || 'N/A',
      zipCode: zipCode || '00000',
      lat,
      lng,
      coordinates: {
        lat,
        lng
      }
    };

    console.log('Address selected:', locationData);

    if (onAddressSelected) {
      onAddressSelected(fullAddress, locationData);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        className={cn(className)}
        required={required}
        value={inputValue}
        onChange={handleInputChange}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((result, index) => {
            const props = result.properties;
            const street = [props.housenumber, props.street].filter(Boolean).join(' ') || props.name;
            const addressParts = [
              street,
              props.city,
              props.state,
              props.postcode,
              props.country
            ].filter(Boolean);
            const displayText = addressParts.join(', ');
            
            return (
              <button
                key={`${props.osm_id}-${index}`}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                onClick={() => handleSelectAddress(result)}
              >
                <div className="text-sm">{displayText}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FreeAddressAutocomplete;
