
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';
import type { ComboCategory, ComboItem } from '@/types/service-types';
import ComboItemEditor from './ComboItemEditor';

interface ComboCategoryProps {
  category: ComboCategory;
  onRemoveCategory: (categoryId: string) => void;
  onAddComboItem: (categoryId: string) => void;
  onUpdateComboItem: (categoryId: string, itemId: string, field: keyof ComboItem, value: any) => void;
  onRemoveComboItem: (categoryId: string, itemId: string) => void;
}

const ComboCategory: React.FC<ComboCategoryProps> = ({
  category,
  onRemoveCategory,
  onAddComboItem,
  onUpdateComboItem,
  onRemoveComboItem
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
          onClick={() => onRemoveCategory(category.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Items in this category */}
      <div className="space-y-3">
        {category.items.map((comboItem) => (
          <ComboItemEditor
            key={comboItem.id}
            item={comboItem}
            categoryId={category.id}
            onUpdateItem={onUpdateComboItem}
            onRemoveItem={onRemoveComboItem}
          />
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onAddComboItem(category.id)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Item to {category.name}
        </Button>
      </div>
    </div>
  );
};

export default ComboCategory;
