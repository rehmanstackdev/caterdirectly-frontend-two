
import React from 'react';
import { Button } from '@/components/ui/button';

interface ComboFormActionsProps {
  onCancel: () => void;
  isValid: boolean;
}

const ComboFormActions: React.FC<ComboFormActionsProps> = ({
  onCancel,
  isValid
}) => {
  return (
    <div className="border-t pt-4 flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        type="submit" 
        className="bg-[#F07712] hover:bg-[#F07712]/90"
        disabled={!isValid}
      >
        Save Combo
      </Button>
    </div>
  );
};

export default ComboFormActions;
