
import React from 'react';
import { InvoiceItem } from '@/types/invoice-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProposalItemsListProps {
  items: InvoiceItem[];
  onUpdateItem: (item: InvoiceItem) => void;
  onRemoveItem: (itemId: string) => void;
}

export const ProposalItemsList: React.FC<ProposalItemsListProps> = ({
  items,
  onUpdateItem,
  onRemoveItem
}) => {
  const handleQuantityChange = (item: InvoiceItem, quantity: number) => {
    if (quantity < 1) quantity = 1;
    
    const updatedItem: InvoiceItem = {
      ...item,
      quantity,
      total: quantity * item.price
    };
    
    onUpdateItem(updatedItem);
  };
  
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-center py-4 text-gray-500">No items added to the proposal yet.</p>
      ) : (
        items.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-md">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
            </div>
            
            <div className="w-24">
              <Input 
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                className="text-center"
              />
            </div>
            
            <div className="w-24 text-right">
              <p className="font-medium">${item.total.toFixed(2)}</p>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onRemoveItem(item.id)}
                    className="text-gray-500 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Remove item</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))
      )}
    </div>
  );
};
