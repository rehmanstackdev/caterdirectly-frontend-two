
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { DietaryFlag } from '@/types/service-types';

interface MenuItemDietaryOptionsProps {
  selectedOptions: DietaryFlag[];
  onChange: (options: DietaryFlag[]) => void;
  noneSelected?: boolean;
  onNoneChange?: (value: boolean) => void;
}

export const MenuItemDietaryOptions: React.FC<MenuItemDietaryOptionsProps> = ({
  selectedOptions,
  onChange,
  noneSelected,
  onNoneChange
}) => {
  const dietaryOptions: DietaryFlag[] = [
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'kosher', 'halal'
  ];

  const handleToggle = (flag: DietaryFlag, checked: boolean) => {
    if (checked) {
      onNoneChange?.(false);
      onChange([...selectedOptions, flag]);
    } else {
      onChange(selectedOptions.filter(option => option !== flag));
    }
  };

  return (
    <div>
      <Label className="block mb-2">Dietary Options <span className="text-red-500">*</span></Label>
      <div className="flex justify-end mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Mark that no dietary options apply"
          aria-pressed={!!noneSelected}
          onClick={() => { onChange([]); onNoneChange?.(true); }}
          title="None apply"
        >
          None apply
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {dietaryOptions.map((flag) => (
          <div key={flag} className="flex items-center space-x-2">
            <Checkbox
              id={`dietary-${flag}`}
              checked={selectedOptions.includes(flag)}
              onCheckedChange={(checked) => handleToggle(flag, checked === true)}
            />
            <Label htmlFor={`dietary-${flag}`}>{flag.replace('_', ' ')}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};
