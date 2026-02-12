
import React from 'react';
import { Button } from '@/components/ui/button';

interface MenuItemFormActionsProps {
  onCancel: () => void;
  isValid: boolean;
  hasRequiredFields?: boolean;
}

export const MenuItemFormActions: React.FC<MenuItemFormActionsProps> = ({
  onCancel,
  isValid,
  hasRequiredFields = false
}) => {
  return (
    <div className="border-t pt-4 flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="bg-[#F07712] hover:bg-[#F07712]/90"
        disabled={!isValid && !hasRequiredFields}
      >
        Save Item
      </Button>
    </div>
  );
};
