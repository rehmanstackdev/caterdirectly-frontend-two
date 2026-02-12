
import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlacesAutocomplete } from "./address/use-places-autocomplete";

interface LocationFilterAutocompleteProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
}

const LocationFilterAutocomplete = ({
  value,
  onChange,
  placeholder = "Enter event address",
  className
}: LocationFilterAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const { isLoading: scriptLoading, scriptError } = usePlacesAutocomplete(
    inputRef,
    handlePlaceSelected
  );

  // Handle Google Places selection
  function handlePlaceSelected(place: any) {
    try {
      if (!place.formatted_address || !place.geometry) {
        console.error("Invalid place data from Google");
        return;
      }

      const fullAddress = place.formatted_address;
      const coordinates = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      console.log('[LocationFilter] Address selected:', fullAddress, 'Coordinates:', coordinates);

      setInputValue(fullAddress);
      onChange(fullAddress, coordinates);
    } catch (error) {
      console.error("Error handling place selection:", error);
    }
  }

  // Handle manual input changes (for clearing or typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // If user clears the input, clear the filter
    if (!newValue) {
      onChange('', undefined);
    }
  };

  // Handle clear button
  const handleClear = () => {
    setInputValue('');
    onChange('', undefined);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
      <Input
        ref={inputRef}
        id="location-filter"
        name="locationFilter"
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className={cn("pl-10 pr-8", className)}
        disabled={scriptLoading}
      />
      {scriptLoading && (
        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
      )}
      {!scriptLoading && inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default LocationFilterAutocomplete;
