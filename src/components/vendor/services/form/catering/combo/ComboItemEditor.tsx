
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, DollarSign } from 'lucide-react';
import type { ComboItem } from '@/types/service-types';

interface ComboItemEditorProps {
  item: ComboItem;
  categoryId: string;
  onUpdateItem: (categoryId: string, itemId: string, field: keyof ComboItem, value: any) => void;
  onRemoveItem: (categoryId: string, itemId: string) => void;
}

const ComboItemEditor: React.FC<ComboItemEditorProps> = ({
  item,
  categoryId,
  onUpdateItem,
  onRemoveItem
}) => {
  return (
    <div className="bg-gray-50 p-3 rounded flex flex-col gap-2">
      <div className="flex justify-between">
        <Input
          value={item.name}
          onChange={(e) => onUpdateItem(categoryId, item.id, 'name', e.target.value)}
          placeholder="Item name"
          className="flex-1 mr-2"
        />
        <Button 
          type="button" 
          variant="destructive" 
          size="sm" 
          onClick={() => onRemoveItem(categoryId, item.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={item.description || ''}
        onChange={(e) => onUpdateItem(categoryId, item.id, 'description', e.target.value)}
        placeholder="Item description (optional)"
        rows={1}
      />
      <div className="flex items-center">
        <Label htmlFor={`additionalPrice-${item.id}`} className="mr-2 text-sm">Additional Price:</Label>
        <div className="relative w-24">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            <DollarSign className="h-3 w-3" />
          </span>
          <Input
            id={`additionalPrice-${item.id}`}
            type="number"
            min="0"
            step="0.01"
            value={item.additionalPrice || 0}
            onChange={(e) => onUpdateItem(
              categoryId, 
              item.id, 
              'additionalPrice', 
              parseFloat(e.target.value) || 0
            )}
            className="pl-6"
          />
        </div>
      </div>
    </div>
  );
};

export default ComboItemEditor;
