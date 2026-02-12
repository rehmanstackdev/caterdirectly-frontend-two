
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VenueRestrictionsProps {
  restrictions: string[];
  updateRestrictions: (restrictions: string[]) => void;
}

const VenueRestrictions: React.FC<VenueRestrictionsProps> = ({
  restrictions,
  updateRestrictions
}) => {
  const [inputValue, setInputValue] = useState('');

  // Initialize input value from restrictions array
  useEffect(() => {
    const restrictionsString = Array.isArray(restrictions) ? restrictions.join(', ') : '';
    setInputValue(restrictionsString);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Parse and update restrictions
    const restrictionsList = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    updateRestrictions(restrictionsList);
  };
  
  return (
    <div>
      <Label className="mb-2 block">Venue Restrictions</Label>
      <Textarea 
        placeholder="List any restrictions, separated by commas"
        value={inputValue}
        onChange={handleChange}
        className="min-h-24"
      />
      <p className="text-sm text-gray-500 mt-1">
        Examples: No outside catering, Noise restrictions after 10pm, No confetti
      </p>
    </div>
  );
};

export default VenueRestrictions;
