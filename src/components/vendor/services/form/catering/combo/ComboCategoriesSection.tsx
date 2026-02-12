
import React from 'react';
import type { ComboCategory, ComboItem } from '@/types/service-types';
import AddCategoryForm from './AddCategoryForm';
import ComboCategoryComponent from './ComboCategory';

interface ComboCategoriesSectionProps {
  categories: ComboCategory[];
  newCategoryName: string;
  newCategoryMaxSelections: number;
  onNewCategoryNameChange: (value: string) => void;
  onNewCategoryMaxSelectionsChange: (value: number) => void;
  onAddCategory: () => void;
  onRemoveCategory: (categoryId: string) => void;
  onAddComboItem: (categoryId: string) => void;
  onUpdateComboItem: (categoryId: string, itemId: string, field: keyof ComboItem, value: any) => void;
  onRemoveComboItem: (categoryId: string, itemId: string) => void;
}

const ComboCategoriesSection: React.FC<ComboCategoriesSectionProps> = ({
  categories,
  newCategoryName,
  newCategoryMaxSelections,
  onNewCategoryNameChange,
  onNewCategoryMaxSelectionsChange,
  onAddCategory,
  onRemoveCategory,
  onAddComboItem,
  onUpdateComboItem,
  onRemoveComboItem
}) => {
  return (
    <div className="border-t border-gray-200 pt-4">
      <h3 className="font-semibold text-lg mb-4">Combo Categories</h3>
      
      <AddCategoryForm
        categoryName={newCategoryName}
        maxSelections={newCategoryMaxSelections}
        onCategoryNameChange={onNewCategoryNameChange}
        onMaxSelectionsChange={onNewCategoryMaxSelectionsChange}
        onAddCategory={onAddCategory}
      />
      
      <div className="space-y-6">
        {categories.map((category) => (
          <ComboCategoryComponent
            key={category.id}
            category={category}
            onRemoveCategory={onRemoveCategory}
            onAddComboItem={onAddComboItem}
            onUpdateComboItem={onUpdateComboItem}
            onRemoveComboItem={onRemoveComboItem}
          />
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No combo categories added yet.</p>
          <p className="text-sm text-gray-400 mt-1">Add at least one category with items to create a combo.</p>
        </div>
      )}
    </div>
  );
};

export default ComboCategoriesSection;
