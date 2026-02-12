import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { LocationData } from "./address/types";
import { usePlacesAutocomplete } from "./address/use-places-autocomplete";

interface SimpleAddressAutocompleteProps {
  className?: string;
  placeholder?: string;
  onAddressSelected?: (address: string, locationData?: LocationData) => void;
  required?: boolean;
  id?: string;
  name?: string;
  value?: string;
}

const SimpleAddressAutocomplete = ({
  className,
  placeholder = "123 Main St, City, State",
  onAddressSelected,
  required,
  id = 'simple-address-autocomplete',
  name = 'address',
  value
}: SimpleAddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { isLoading: scriptLoading, scriptError } = usePlacesAutocomplete(
    inputRef,
    handlePlaceSelected
  );

  // Handle Google Places selection
  async function handlePlaceSelected(place: any) {
    try {
      if (!place.formatted_address || !place.geometry) {
        console.error("Invalid place data from Google");
        return;
      }

      const fullAddress = place.formatted_address;
      
      // Extract components from Google's result
      const components = place.address_components || [];
      let street = "";
      let city = "";
      let state = "";
      let zipCode = "";

      components.forEach((component: any) => {
        const types = component.types;
        
        if (types.includes('street_number')) {
          street = component.long_name + " ";
        } else if (types.includes('route')) {
          street += component.long_name;
        } else if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      });

      // Create location data from Google's geometry
      const locationData: LocationData = {
        city,
        state,
        street: street.trim(),
        zipCode,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        coordinates: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
      };

      // Call the callback with the full address and location data
      if (onAddressSelected) {
        onAddressSelected(fullAddress, locationData);
      }
      
    } catch (error) {
      console.error("Error handling place selection:", error);
    }
  }

  return (
    <Input
      ref={inputRef}
      id={id}
      name={name}
      type="text"
      placeholder={placeholder}
      className={cn(className)}
      disabled={scriptLoading || !!scriptError}
      required={required}
      defaultValue={value}
    />
  );
};

export default SimpleAddressAutocomplete;