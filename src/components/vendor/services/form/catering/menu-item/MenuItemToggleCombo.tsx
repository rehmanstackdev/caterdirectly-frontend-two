
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface MenuItemToggleComboProps {
  isCombo: boolean;
  onToggleCombo: (checked: boolean) => void;
}

export const MenuItemToggleCombo: React.FC<MenuItemToggleComboProps> = ({
  isCombo,
  onToggleCombo
}) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <Label htmlFor="isCombo" className="flex items-center space-x-2">
        <Switch
          id="isCombo"
          checked={isCombo}
          onCheckedChange={onToggleCombo}
        />
        <span>Make this a combo item</span>
      </Label>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Info className="h-4 w-4 text-gray-400" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">
              Combo items allow customers to make selections from different categories
              (like a taco bar with choice of proteins, toppings, etc.)
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
