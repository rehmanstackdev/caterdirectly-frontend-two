
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VenueAmenitiesProps {
  amenities: string[];
  updateAmenities: (amenities: string[]) => void;
}

const VenueAmenities: React.FC<VenueAmenitiesProps> = ({
  amenities,
  updateAmenities
}) => {
  const [inputValue, setInputValue] = useState('');

  // Initialize input value from amenities array
  useEffect(() => {
    const amenitiesString = Array.isArray(amenities) ? amenities.join(', ') : '';
    setInputValue(amenitiesString);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Parse and update amenities
    const amenitiesList = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    updateAmenities(amenitiesList);
  };
  
  return (
    <div>
      <Label className="mb-2 block">Venue Amenities</Label>
      <Textarea 
        placeholder="List venue amenities, separated by commas"
        value={inputValue}
        onChange={handleChange}
        className="min-h-24"
      />
      <p className="text-sm text-gray-500 mt-1">
        Examples: Parking, WiFi, AV Equipment, Kitchen, Bar
      </p>
    </div>
  );
};

export default VenueAmenities;
