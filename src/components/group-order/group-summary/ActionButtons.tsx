
import React from 'react';
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onConfirmOrder: () => void;
  onEditOrder: () => void;
}

const ActionButtons = ({ onConfirmOrder, onEditOrder }: ActionButtonsProps) => {
  return (
    <div className="flex gap-4">
      <Button 
        onClick={onConfirmOrder}
        className="flex-grow bg-[#F07712] hover:bg-[#F07712]/90"
      >
        Confirm Order
      </Button>
      <Button 
        onClick={onEditOrder} 
        variant="outline"
        className="border-gray-300"
      >
        Edit Order
      </Button>
    </div>
  );
};

export default ActionButtons;
