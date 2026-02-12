
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { MenuItem, DietaryFlag, AllergenFlag } from '@/types/service-types';
import { menuItemSchema, MenuItemFormValues } from '../../validation/form-schemas';

interface UseMenuItemFormProps {
  menuItem?: MenuItem;
  onSave: (item: MenuItem) => void;
  onCancel: () => void;
}

export const useMenuItemForm = ({ menuItem, onSave, onCancel }: UseMenuItemFormProps) => {
  const defaultValues: Partial<MenuItemFormValues> = {
    name: menuItem?.name || '',
    description: menuItem?.description || '',
    // No default price for new items; keep empty until user enters a value
    price: menuItem?.price,
    priceType: menuItem?.priceType || 'per_person',
    minQuantity: menuItem?.minQuantity,

    dietaryFlags: menuItem?.dietaryFlags as DietaryFlag[] || [],
    allergenFlags: menuItem?.allergenFlags as AllergenFlag[] || [],
    dietaryNone: !menuItem?.dietaryFlags || menuItem.dietaryFlags.length === 0,
    allergenNone: !menuItem?.allergenFlags || menuItem.allergenFlags.length === 0,
    isPopular: menuItem?.isPopular || false,
    category: menuItem?.category || '',
    image: menuItem?.image,
    isCombo: menuItem?.isCombo || false
  };

  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: defaultValues as MenuItemFormValues,
    mode: 'onChange'
  });

  const { watch, setValue, handleSubmit, formState: { errors, isValid, isDirty } } = form;
  
  // Debug form state
  const currentFormState = {
    isValid, 
    isDirty, 
    errors, 
    price: watch('price'), 
    name: watch('name'), 
    category: watch('category'), 
    dietaryFlags: watch('dietaryFlags'), 
    allergenFlags: watch('allergenFlags'),
    dietaryNone: watch('dietaryNone'),
    allergenNone: watch('allergenNone')
  };
  console.log('Menu item form state:', currentFormState);
  
  // Log validation errors specifically
  if (!isValid && Object.keys(errors).length > 0) {
    console.log('VALIDATION ERRORS:', errors);
  }
  
  const isCombo = watch('isCombo');
  
  const handleToggleCombo = (checked: boolean) => {
    setValue('isCombo', checked);
  };

  const onSubmit = (data: MenuItemFormValues) => {
    const item: MenuItem = {
      id: menuItem?.id || uuidv4(),
      name: data.name,
      description: data.description,
      price: data.price,
      priceType: data.priceType,
      dietaryFlags: data.dietaryFlags as DietaryFlag[],
      allergenFlags: data.allergenFlags as AllergenFlag[],
      isPopular: data.isPopular,
      category: data.category,
      image: data.image,
      isCombo: false // Regular menu items are never combos
    };
    
    try {
      onSave(item);
      toast({
        title: "Success",
        description: "Menu item saved successfully!",
      });
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: "There was an error saving your menu item.",
        variant: "destructive"
      });
    }
  };

  return {
    form,
    isCombo,
    handleToggleCombo,
    onSubmit,
    handleSubmit,
    isValid,
    errors
  };
};
