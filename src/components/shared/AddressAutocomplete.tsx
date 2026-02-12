import React, { useState, useEffect } from "react";
import { useLocation } from "@/hooks/use-location";
import { cn } from "@/lib/utils";

import { AddressAutocompleteProps, LocationData } from "./address/types";
import { updateLocationData, extractLocationFromAddress } from "./address/address-utils";
import SeparatedAddressFields from "./address/SeparatedAddressFields";

const AddressAutocomplete = ({
  className,
  containerClassName,
  onAddressSelected,
  placeholder = "Enter complete address with street, city, state and ZIP"
}: AddressAutocompleteProps) => {
  const { address, setAddress, setCoordinates } = useLocation();
  
  // Initialize address fields from existing address if any
  const [addressFields, setAddressFields] = useState<{
    street?: string;
    city: string;
    state: string;
    zipCode?: string;
  }>({
    street: "",
    city: "",
    state: "",
    zipCode: ""
  });
  
  // Handle changes to individual address fields
  const handleAddressFieldChange = (field: string, value: string) => {
    setAddressFields(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle when location is selected from separated fields (fallback)
  const handleLocationSelected = async (locationData: LocationData) => {
    console.log("AddressAutocomplete: handleLocationSelected", { locationData });
    
    // Format from fields as fallback
    const addressToUse = formatAddressFromFields(addressFields);
    console.log("AddressAutocomplete: Using formatted address:", addressToUse);
    
    // Call the parent callback with the address
    if (onAddressSelected && addressToUse) {
      console.log("AddressAutocomplete: Calling onAddressSelected with formatted address:", addressToUse);
      onAddressSelected(addressToUse, locationData);
    }
    
    // Update location context
    setAddress(addressToUse);
    if (locationData.lat && locationData.lng) {
      setCoordinates({ lat: locationData.lat, lng: locationData.lng });
    }
  };
  
  // Custom handler specifically for Google Places selection
  const handleGooglePlacesSelection = (fullAddress: string, locationData: LocationData) => {
    console.log("AddressAutocomplete: Google Places selected:", fullAddress);
    
    // Immediately call parent with the full address from Google
    if (onAddressSelected) {
      console.log("AddressAutocomplete: Calling onAddressSelected with Google address:", fullAddress);
      onAddressSelected(fullAddress, locationData);
    }
    
    // Update context
    setAddress(fullAddress);
    setCoordinates({ lat: locationData.lat, lng: locationData.lng });
  };
  
  // Format address string from separate fields
  const formatAddressFromFields = (fields: typeof addressFields): string => {
    const parts = [];
    if (fields.street) parts.push(fields.street);
    if (fields.city) parts.push(fields.city);
    if (fields.state) parts.push(fields.state);
    if (fields.zipCode) parts.push(fields.zipCode);
    
    return parts.join(", ");
  };
  
  // When the address in context changes, parse it into fields
  useEffect(() => {
    if (address) {
      try {
        // Parse address string into components
        const parts = address.split(',').map(part => part.trim());
        
        const newFields = { street: "", city: "", state: "", zipCode: "" };
        
        if (parts.length >= 3) {
          newFields.street = parts[0];
          newFields.city = parts[1];
          
          // Last part might have state and zip
          const stateZip = parts[parts.length - 1].split(' ');
          if (stateZip.length >= 2) {
            newFields.state = stateZip[0];
            newFields.zipCode = stateZip[stateZip.length - 1];
          } else {
            newFields.state = parts[parts.length - 1];
          }
        } else if (parts.length === 2) {
          newFields.city = parts[0];
          newFields.state = parts[1];
        }
        
        setAddressFields(newFields);
      } catch (error) {
        console.error("Error parsing address:", error);
      }
    }
  }, [address]);

  return (
    <SeparatedAddressFields
      onAddressChange={handleAddressFieldChange}
      onLocationSelected={handleLocationSelected}
      onGooglePlacesSelected={handleGooglePlacesSelection}
      address={addressFields}
      className={className}
      containerClassName={containerClassName}
    />
  );
};

export default AddressAutocomplete;