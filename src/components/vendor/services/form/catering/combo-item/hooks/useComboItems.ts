
import { v4 as uuidv4 } from 'uuid';
import { ComboCategory, ComboItem } from '@/types/service-types';
import { UseFormReturn } from 'react-hook-form';
import { ComboItemFormValues } from '../validation/form-schemas';

export function useComboItems(form: UseFormReturn<ComboItemFormValues>) {
  const { watch, setValue } = form;
  
  const handleAddComboItem = (categoryId: string) => {
    const newComboItem: ComboItem = {
      id: uuidv4(),
      name: '',
      description: '',
      quantity: 0,
      price: 0,
      isPremium: false,
      additionalCharge: 0
    };
    
    const currentCategories = watch('comboCategories') || [];
    
    const updatedCategories: ComboCategory[] = currentCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: [...(cat.items || []), newComboItem]
        };
      }
      return cat;
    }) as ComboCategory[];
    
    setValue('comboCategories', updatedCategories, { shouldValidate: true });
  };

  const handleUpdateComboItem = (categoryId: string, itemId: string, field: keyof ComboItem, value: any) => {
    const currentCategories = watch('comboCategories') || [];
    
    let sanitizedValue = value;
    
    if (field === 'isPremium') {
      sanitizedValue = Boolean(value);
      console.log(`[useComboItems] Updating isPremium for item ${itemId}:`, sanitizedValue);
    } else if (field === 'additionalCharge' || field === 'price') {
      sanitizedValue = Number(value) || 0;
    } else if (field === 'quantity') {
      sanitizedValue = parseInt(value) || 0;
    } else if (field === 'description' || field === 'name') {
      sanitizedValue = String(value || '');
    }
    
    const updatedCategories: ComboCategory[] = currentCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: (cat.items || []).map(item => {
            if (item.id === itemId) {
              const updated = {
                ...item,
                [field]: sanitizedValue
              };
              console.log(`[useComboItems] Updated item ${itemId}:`, updated);
              return updated;
            }
            return item;
          })
        };
      }
      return cat;
    }) as ComboCategory[];
    
    console.log(`[useComboItems] Setting categories with updated item`, updatedCategories);
    setValue('comboCategories', updatedCategories, { shouldValidate: true });
  };

  const handleRemoveComboItem = (categoryId: string, itemId: string) => {
    const currentCategories = watch('comboCategories') || [];
    
    const updatedCategories: ComboCategory[] = currentCategories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          items: (cat.items || []).filter(item => item.id !== itemId)
        };
      }
      return cat;
    }) as ComboCategory[];
    
    setValue('comboCategories', updatedCategories, { shouldValidate: true });
  };
  
  return {
    handleAddComboItem,
    handleUpdateComboItem,
    handleRemoveComboItem
  };
}
