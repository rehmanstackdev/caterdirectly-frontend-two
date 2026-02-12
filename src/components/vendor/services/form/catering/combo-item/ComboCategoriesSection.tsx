
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ComboCategory, ComboItem } from '@/types/service-types';
import { ComboItemFormValues } from './validation/form-schemas';
import { AddCategoryForm } from './AddCategoryForm';
import { CategoryHeader } from './components/CategoryHeader';
import { CategoriesList } from './components/CategoriesList';
import EmptyCategoriesState from './components/EmptyCategoriesState';
import { CategoryError } from './components/CategoryError';

interface ComboCategoriesSectionProps {
  form: UseFormReturn<ComboItemFormValues>;
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
  errors: any;
}

export const ComboCategoriesSection: React.FC<ComboCategoriesSectionProps> = ({
  form,
  categories,
  newCategoryName,
  newCategoryMaxSelections,
  onNewCategoryNameChange,
  onNewCategoryMaxSelectionsChange,
  onAddCategory,
  onRemoveCategory,
  onAddComboItem,
  onUpdateComboItem,
  onRemoveComboItem,
  errors
}) => {
  return (
    <div>
      <CategoryHeader 
        title="Combo Categories" 
        description="Add categories and items that customers can select from for this combo" 
      />
      
      {categories.length > 0 ? (
        <CategoriesList
          categories={categories}
          onRemoveCategory={onRemoveCategory}
          onAddComboItem={onAddComboItem}
          onUpdateComboItem={onUpdateComboItem}
          onRemoveComboItem={onRemoveComboItem}
        />
      ) : (
        <EmptyCategoriesState />
      )}
      
      <CategoryError errors={errors} />
      
      <div className="mt-4">
        <AddCategoryForm
          categoryName={newCategoryName}
          onCategoryNameChange={onNewCategoryNameChange}
          maxSelections={newCategoryMaxSelections}
          onMaxSelectionsChange={onNewCategoryMaxSelectionsChange}
          onAddCategory={onAddCategory}
        />
      </div>
    </div>
  );
};
