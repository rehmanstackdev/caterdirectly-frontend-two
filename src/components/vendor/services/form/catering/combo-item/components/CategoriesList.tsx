
import React from 'react';
import { ComboCategory, ComboItem } from '@/types/service-types';
import { ComboCategoryComponent } from '../ComboCategoryComponent';

interface CategoriesListProps {
  categories: ComboCategory[];
  onRemoveCategory: (categoryId: string) => void;
  onAddComboItem: (categoryId: string) => void;
  onUpdateComboItem: (categoryId: string, itemId: string, field: keyof ComboItem, value: any) => void;
  onRemoveComboItem: (categoryId: string, itemId: string) => void;
}

export const CategoriesList: React.FC<CategoriesListProps> = ({
  categories,
  onRemoveCategory,
  onAddComboItem,
  onUpdateComboItem,
  onRemoveComboItem
}) => {
  if (categories.length === 0) return null;
  
  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <ComboCategoryComponent
          key={category.id}
          category={category}
          onRemoveCategory={() => onRemoveCategory(category.id)}
          onAddItem={() => onAddComboItem(category.id)}
          onUpdateItem={(categoryId: string, itemId: string, field: keyof ComboItem, value: any) => 
            onUpdateComboItem(categoryId, itemId, field, value)
          }
          onRemoveItem={(categoryId: string, itemId: string) => onRemoveComboItem(categoryId, itemId)}
        />
      ))}
    </div>
  );
};
