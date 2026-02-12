
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AllergenFlag } from '@/types/service-types';

interface MenuItemAllergensProps {
  selectedAllergens: AllergenFlag[];
  onChange: (allergens: AllergenFlag[]) => void;
  noneSelected?: boolean;
  onNoneChange?: (value: boolean) => void;
}

export const MenuItemAllergens: React.FC<MenuItemAllergensProps> = ({
  selectedAllergens,
  onChange,
  noneSelected,
  onNoneChange
}) => {
  const allergenOptions: AllergenFlag[] = [
    'nuts', 'dairy', 'eggs', 'soy', 'wheat', 'shellfish', 'fish'
  ];

  const handleToggle = (flag: AllergenFlag, checked: boolean) => {
    if (checked) {
      onNoneChange?.(false);
      onChange([...selectedAllergens, flag]);
    } else {
      onChange(selectedAllergens.filter(allergen => allergen !== flag));
    }
  };

  return (
    <div>
      <Label className="block mb-2">Contains Allergens <span className="text-red-500">*</span></Label>
      <div className="flex justify-end mb-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Mark that no allergen options apply"
          aria-pressed={!!noneSelected}
          onClick={() => { onChange([]); onNoneChange?.(true); }}
          title="None apply"
        >
          None apply
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {allergenOptions.map((flag) => (
          <div key={flag} className="flex items-center space-x-2">
            <Checkbox
              id={`allergen-${flag}`}
              checked={selectedAllergens.includes(flag)}
              onCheckedChange={(checked) => handleToggle(flag, checked === true)}
            />
            <Label htmlFor={`allergen-${flag}`}>{flag}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};
