import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, MapPin, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { LocationData } from "./types";
import { usePlacesAutocomplete } from "./use-places-autocomplete";

interface AddressAutocompleteWithFallbackProps {
  className?: string;
  placeholder?: string;
  onAddressSelected?: (address: string, locationData?: LocationData) => void;
  required?: boolean;
  id?: string;
  name?: string;
  value?: string;
  error?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const AddressAutocompleteWithFallback = ({
  className,
  placeholder = "123 Main St, City, State",
  onAddressSelected,
  required,
  id = 'address-autocomplete',
  name = 'address',
  value,
  error,
  onFocus,
  onBlur
}: AddressAutocompleteWithFallbackProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [manualAddress, setManualAddress] = useState(value || '');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Handle Google Places selection
  async function handlePlaceSelected(place: any) {
    try {
      setIsLoadingAddress(true);
      
      if (!place.formatted_address || !place.geometry) {
        console.error("Invalid place data from Google");
        setUseFallback(true);
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

      // Update the input field to show the selected address
      if (inputRef.current) {
        inputRef.current.value = fullAddress;
      }

      // Call the callback with the full address and location data
      if (onAddressSelected) {
        onAddressSelected(fullAddress, locationData);
      }
      
    } catch (error) {
      console.error("Error handling place selection:", error);
      setUseFallback(true);
    } finally {
      setIsLoadingAddress(false);
    }
  }

  // Handle fallback to manual input
  const handleUseFallback = () => {
    setUseFallback(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle manual address input
  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setManualAddress(newValue);
    
    // Simple validation and callback for manual entry
    if (onAddressSelected) {
      onAddressSelected(newValue, undefined);
    }
  };

  const { isLoading: scriptLoading, scriptError } = usePlacesAutocomplete(
    inputRef,
    handlePlaceSelected
  );

  // Effect to handle script errors
  useEffect(() => {
    if (scriptError) {
      setUseFallback(true);
    }
  }, [scriptError]);

  // Show loading state
  if (scriptLoading && !useFallback) {
    return (
      <div className={cn("relative", className)}>
        <Input
          disabled
          placeholder="Loading address autocomplete..."
          className="pr-10"
        />
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error and fallback option
  if ((scriptError || useFallback) && !useFallback) {
    return (
      <div className="space-y-2">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Address autocomplete is unavailable. Click below to enter address manually.
          </AlertDescription>
        </Alert>
        <Button
          type="button"
          variant="outline"
          onClick={handleUseFallback}
          className="w-full"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Enter Address Manually
        </Button>
      </div>
    );
  }

  // Fallback manual input
  if (useFallback) {
    return (
      <div className="space-y-2">
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          placeholder={placeholder}
          className={cn(className, error && "border-destructive")}
          required={required}
          value={manualAddress}
          onChange={handleManualAddressChange}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <div className="text-xs text-muted-foreground">
          Entered manually - some features may be limited
        </div>
      </div>
    );
  }

  // Google Places autocomplete (normal mode)
  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        className={cn(className, error && "border-destructive", "pr-10")}
        required={required}
        defaultValue={value}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {isLoadingAddress && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleUseFallback}
        className="absolute right-0 top-0 h-full px-2 text-muted-foreground hover:text-foreground"
        title="Switch to manual input"
      >
        <MapPin className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AddressAutocompleteWithFallback;