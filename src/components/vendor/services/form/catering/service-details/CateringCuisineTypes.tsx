import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const CUISINE_OPTIONS = [
  'American',
  'Italian',
  'Mexican',
  'Asian',
  'Mediterranean',
  'BBQ',
  'Seafood',
  'Vegetarian',
  'Farm-to-Table',
  'Fusion',
];

interface CateringCuisineTypesProps {
  cuisineTypes: string[];
  onCuisineTypesChange: (types: string[]) => void;
}

const CateringCuisineTypes: React.FC<CateringCuisineTypesProps> = ({
  cuisineTypes,
  onCuisineTypesChange,
}) => {
  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    const updated = checked
      ? [...cuisineTypes, cuisine]
      : cuisineTypes.filter((type) => type !== cuisine);
    onCuisineTypesChange(updated);
  };

  return (
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <Label className="block">Cuisine Types</Label>
      </div>
      <p className="text-sm text-gray-500 mb-4">Select all cuisines you offer</p>
      <div className="grid grid-cols-3 gap-2">
        {CUISINE_OPTIONS.map((cuisine) => (
          <div key={cuisine} className="flex items-center space-x-2">
            <Checkbox
              id={`cuisine-${cuisine}`}
              checked={cuisineTypes.includes(cuisine)}
              onCheckedChange={(checked) => handleCuisineChange(cuisine, checked === true)}
            />
            <Label htmlFor={`cuisine-${cuisine}`} className="text-sm cursor-pointer">
              {cuisine}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CateringCuisineTypes;
