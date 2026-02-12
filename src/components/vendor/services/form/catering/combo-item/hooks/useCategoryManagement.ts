
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ComboCategory } from '@/types/service-types';
import { UseFormReturn } from 'react-hook-form';
import { ComboItemFormValues } from '../validation/form-schemas';
import { toast } from '@/components/ui/use-toast';

export function useCategoryManagement(form: UseFormReturn<ComboItemFormValues>) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryMaxSelections, setNewCategoryMaxSelections] = useState(1);
  
  const { watch, setValue } = form;

  const handleAddCategory = () => {
    if (!newCategoryName) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newCategory: ComboCategory = {
      id: uuidv4(),
      name: newCategoryName,
      maxSelections: newCategoryMaxSelections,
      items: []
    };
    
    const currentCategories = watch('comboCategories') || [];
    setValue('comboCategories', [...currentCategories, newCategory], { shouldValidate: true });
    
    setNewCategoryName('');
    setNewCategoryMaxSelections(1);
  };

  const handleRemoveCategory = (categoryId: string) => {
    const currentCategories = watch('comboCategories') || [];
    setValue(
      'comboCategories', 
      currentCategories.filter(cat => cat.id !== categoryId) as ComboCategory[], 
      { shouldValidate: true }
    );
  };

  return {
    newCategoryName,
    newCategoryMaxSelections,
    onNewCategoryNameChange: setNewCategoryName,
    onNewCategoryMaxSelectionsChange: setNewCategoryMaxSelections,
    handleAddCategory,
    handleRemoveCategory
  };
}
