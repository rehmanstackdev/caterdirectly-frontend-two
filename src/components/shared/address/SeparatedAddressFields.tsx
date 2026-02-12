
import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationData } from "./types";
import { usePlacesAutocomplete } from "./use-places-autocomplete";
import { handleCurrentLocation, extractLocationFromAddress, updateLocationData } from "./address-utils";
import { useLocation } from "@/hooks/use-location";

interface SeparatedAddressFieldsProps {
  onAddressChange: (field: string, value: string) => void;
  onLocationSelected: (locationData: LocationData) => void;
  onGooglePlacesSelected?: (fullAddress: string, locationData: LocationData) => void;
  address: {
    street?: string;
    city: string;
    state: string;
    zipCode?: string;
  };
  className?: string;
  containerClassName?: string;
}

const SeparatedAddressFields = ({
  onAddressChange,
  onLocationSelected,
  onGooglePlacesSelected,
  address,
  className,
  containerClassName
}: SeparatedAddressFieldsProps) => {
  const { setAddress, setCoordinates } = useLocation();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  
  // Use a single input for Google Places autocomplete
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isLoading: scriptLoading,
    scriptError,
    networkError,
    retryLoadScript
  } = usePlacesAutocomplete(autocompleteInputRef, handlePlaceSelected);

  // Handle Google Places selection
  async function handlePlaceSelected(place: any) {
    try {
      console.log("Google Place selected:", place);
      
      if (!place.formatted_address || !place.geometry) {
        console.error("Invalid place data from Google");
        return;
      }

      const fullAddress = place.formatted_address;
      setSelectedAddress(fullAddress);
      console.log("SeparatedAddressFields: Setting address to:", fullAddress);
      
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

      // Update individual fields
      if (street) onAddressChange('street', street.trim());
      if (city) onAddressChange('city', city);
      if (state) onAddressChange('state', state);
      if (zipCode) onAddressChange('zipCode', zipCode);

      // Create location data from Google's geometry
      const locationData: LocationData = {
        city,
        state,
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };

      // Update the location context
      setAddress(fullAddress);
      setCoordinates({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      });

      // Use the dedicated Google Places callback if available, otherwise use the general callback
      if (onGooglePlacesSelected) {
        console.log("SeparatedAddressFields: Calling onGooglePlacesSelected with:", fullAddress);
        onGooglePlacesSelected(fullAddress, locationData);
      } else {
        console.log("SeparatedAddressFields: Calling onLocationSelected with:", locationData);
        onLocationSelected(locationData);
      }
      
    } catch (error) {
      console.error("Error handling place selection:", error);
    }
  }


  // Handle current location button
  const handleUseCurrentLocation = () => {
    handleCurrentLocation(
      setIsLoadingLocation,
      (address) => {
        setSelectedAddress(address);
        if (autocompleteInputRef.current) {
          autocompleteInputRef.current.value = address;
        }
      },
      setAddress,
      setCoordinates,
      async (address, locationData) => {
        // Parse the reverse geocoded address into fields
        if (locationData) {
          onAddressChange('city', locationData.city);
          onAddressChange('state', locationData.state);
          
          // Use Google Places callback if available for current location too
          if (onGooglePlacesSelected) {
            onGooglePlacesSelected(address, locationData);
          } else {
            onLocationSelected(locationData);
          }
        } else {
          // Try to extract from the address string
          const extracted = await extractLocationFromAddress(address);
          if (extracted) {
            onAddressChange('city', extracted.city);
            onAddressChange('state', extracted.state);
            
            if (onGooglePlacesSelected) {
              onGooglePlacesSelected(address, extracted);
            } else {
              onLocationSelected(extracted);
            }
          }
        }
      },
      setGeolocationError
    );
  };

  return (
    <div className={cn("w-full space-y-4", containerClassName)}>
      {/* Google Places Autocomplete Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Search Address
        </label>
        <div className="relative">
          <Input
            ref={autocompleteInputRef}
            id="separated-address-search"
            name="addressSearch"
            placeholder="Start typing an address..."
            className={cn("pr-10", className)}
            disabled={scriptLoading || !!scriptError}
          />
          {scriptLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
        
        {scriptError && (
          <div className="text-sm text-red-600 space-y-2">
            <p>{networkError ? "Network error loading address service" : "Failed to load address service"}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={retryLoadScript}
              className="text-xs"
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Current Location Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleUseCurrentLocation}
        disabled={isLoadingLocation}
        className="w-full flex items-center gap-2"
      >
        {isLoadingLocation ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
        {isLoadingLocation ? "Getting location..." : "Use Current Location"}
      </Button>

      {geolocationError && (
        <p className="text-sm text-red-600">{geolocationError}</p>
      )}
      
      {/* Display selected address if available */}
      {selectedAddress && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <strong>Selected:</strong> {selectedAddress}
          </p>
        </div>
      )}
    </div>
  );
};

export default SeparatedAddressFields;
