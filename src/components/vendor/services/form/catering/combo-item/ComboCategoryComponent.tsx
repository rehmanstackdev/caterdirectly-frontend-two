
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import { ComboCategory, ComboItem } from '@/types/service-types';
import ComboItemEditor from './ComboItemEditor';

interface ComboCategoryComponentProps {
  category: ComboCategory;
  onRemoveCategory: () => void;
  onAddItem: () => void;
  onUpdateItem: (categoryId: string, itemId: string, field: keyof ComboItem, value: any) => void;
  onRemoveItem: (categoryId: string, itemId: string) => void;
}

export const ComboCategoryComponent: React.FC<ComboCategoryComponentProps> = ({
  category,
  onRemoveCategory,
  onAddItem,
  onUpdateItem,
  onRemoveItem
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-medium">{category.name}</h4>
          <p className="text-sm text-gray-600">Select up to {category.maxSelections}</p>
        </div>
        <Button 
          type="button" 
          variant="destructive" 
          size="sm"
          onClick={onRemoveCategory}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3">
        {category.items.map((comboItem) => (
          <ComboItemEditor
            key={comboItem.id}
            item={comboItem}
            categoryId={category.id}
            onUpdateItem={onUpdateItem}
            onRemoveItem={(categoryId, itemId) => onRemoveItem(categoryId, itemId)}
          />
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={onAddItem}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Item to {category.name}
        </Button>
      </div>
    </div>
  );
};
