
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface AddCategoryFormProps {
  categoryName: string;
  maxSelections: number;
  onCategoryNameChange: (value: string) => void;
  onMaxSelectionsChange: (value: number) => void;
  onAddCategory: () => void;
}

export const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
  categoryName,
  maxSelections,
  onCategoryNameChange,
  onMaxSelectionsChange,
  onAddCategory
}) => {
  return (
    <div className="space-y-3 mb-6 p-3 bg-gray-50 rounded-lg">
      <Label htmlFor="newCategoryName">Add New Category</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="col-span-2">
          <Input
            id="newCategoryName"
            value={categoryName}
            onChange={(e) => onCategoryNameChange(e.target.value)}
            placeholder="e.g., Proteins, Sides, Toppings"
            className="w-full"
          />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="maxSelections">Max Selections:</Label>
            <Input
              id="maxSelections"
              type="number"
              min="1"
              value={maxSelections}
              onChange={(e) => onMaxSelectionsChange(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
        </div>
      </div>
      <Button 
        type="button" 
        onClick={onAddCategory} 
        disabled={!categoryName}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-1" /> Add Category
      </Button>
    </div>
  );
};
