
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface VenueTypeProps {
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  updateIndoorOutdoor: (value: 'indoor' | 'outdoor' | 'both') => void;
}

const VenueType: React.FC<VenueTypeProps> = ({
  indoorOutdoor,
  updateIndoorOutdoor
}) => {
  return (
    <div>
      <Label className="mb-2 block">Venue Type</Label>
      <RadioGroup 
        value={indoorOutdoor || 'both'}
        onValueChange={(value) => updateIndoorOutdoor(value as 'indoor' | 'outdoor' | 'both')}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="indoor" id="indoor" />
          <Label htmlFor="indoor">Indoor Only</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="outdoor" id="outdoor" />
          <Label htmlFor="outdoor">Outdoor Only</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="both" id="both" />
          <Label htmlFor="both">Indoor and Outdoor</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default VenueType;
