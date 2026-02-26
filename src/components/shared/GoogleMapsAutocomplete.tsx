import React, { useState, useEffect } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LocationData } from "./address/types";

const libraries: ("places")[] = ["places"];

interface GoogleMapsAutocompleteProps {
  className?: string;
  placeholder?: string;
  onAddressSelected?: (address: string, locationData?: LocationData) => void;
  onAddressChange?: (address: string) => void;
  required?: boolean;
  id?: string;
  name?: string;
  value?: string;
}

const GoogleMapsAutocomplete = ({
  className,
  placeholder = "123 Main St, City, State",
  onAddressSelected,
  onAddressChange,
  required,
  id = 'google-address-autocomplete',
  name = 'address',
  value
}: GoogleMapsAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY || "",
    libraries,
  });

  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      const fullAddress = place.formatted_address || place.name || inputValue;

      // Always populate selected text even if geometry is missing.
      setInputValue(fullAddress);
      onAddressChange?.(fullAddress);
      
      // Extract address components
      let street = '';
      let city = '';
      let state = '';
      let zipCode = '';
      let streetNumber = '';
      let route = '';

      place.address_components?.forEach((component) => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          streetNumber = component.long_name;
        }
        if (types.includes('route')) {
          route = component.long_name;
        }
        if (types.includes('locality')) {
          city = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        }
        if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      street = [streetNumber, route].filter(Boolean).join(' ');
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        const locationData: LocationData = {
          city: city || 'N/A',
          state: state || 'N/A',
          street: street || 'N/A',
          zipCode: zipCode || '',
          lat,
          lng,
          coordinates: { lat, lng }
        };

        console.log('Google Maps address selected:', locationData);
        onAddressSelected?.(fullAddress, locationData);
        return;
      }

      console.warn("Selected place has no geometry. Saving text address only.");
      onAddressSelected?.(fullAddress);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value;
    setInputValue(nextValue);
    onAddressChange?.(nextValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (loadError) {
    console.error("Error loading Google Maps:", loadError);
    return (
      <Input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        className={cn(className, "border-red-300")}
        required={required}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled
        title="Google Maps failed to load"
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <Input
          id={id}
          name={name}
          type="text"
          placeholder="Loading Google Maps..."
          className={cn(className)}
          disabled
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        fields: ["address_components", "geometry", "formatted_address"],
      }}
    >
      <Input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        className={cn(className)}
        required={required}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
    </Autocomplete>
  );
};

export default GoogleMapsAutocomplete;
