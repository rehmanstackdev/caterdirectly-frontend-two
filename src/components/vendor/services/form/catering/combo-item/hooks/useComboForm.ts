
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComboCategory, ComboItem, MenuItem, DietaryFlag, AllergenFlag } from '@/types/service-types';
import { comboItemSchema, ComboItemFormValues } from '../validation/form-schemas';
import { toast } from '@/hooks/use-toast';
import { useCategoryManagement } from './useCategoryManagement';
import { useComboItems } from './useComboItems';
import { useImageUpload } from './useImageUpload';

export function useComboForm(menuItem?: MenuItem, onSave?: (item: MenuItem) => void) {
  // Ensure menuItem.comboCategories has all required fields
  const initialComboCategories: ComboCategory[] = menuItem?.comboCategories?.map(cat => ({
    id: cat.id || uuidv4(),
    name: cat.name || '',
    maxSelections: cat.maxSelections || 1,
    items: (cat.items || []).map(item => ({
      id: item.id || uuidv4(),
      name: item.name || '',
      description: item.description || '',
      image: item.image || (item as any).imageUrl,
      price: item.price || 0,
      quantity: item.quantity || 0,
      dietaryFlags: item.dietaryFlags || [],
      allergenFlags: item.allergenFlags || [],
      isPremium: item.isPremium || false,
      additionalCharge: item.additionalCharge || 0
    }))
  })) || [];

  // Initialize form with default values from menuItem
  const defaultValues: Partial<ComboItemFormValues> = {
    id: menuItem?.id || uuidv4(),
    name: menuItem?.name || '',
    description: menuItem?.description || '',
    // No default base price for new combos; require user input
    price: menuItem?.price,
    category: menuItem?.category || '',
    image: menuItem?.image,
    isCombo: true,
    comboCategories: initialComboCategories
  };

  const form = useForm<ComboItemFormValues>({
    resolver: zodResolver(comboItemSchema),
    defaultValues: defaultValues as ComboItemFormValues,
    mode: 'onChange',
  });

  // Use our hooks
  const categoryManagement = useCategoryManagement(form);
  const {
    newCategoryName,
    newCategoryMaxSelections,
    onNewCategoryNameChange,
    onNewCategoryMaxSelectionsChange,
    handleAddCategory,
    handleRemoveCategory,
  } = categoryManagement;
  
  const {
    handleAddComboItem,
    handleUpdateComboItem,
    handleRemoveComboItem,
  } = useComboItems(form);
  
  const {
    uploading,
    handleFileUpload,
    handleFileUploadComplete
  } = useImageUpload(form);
  
  const { handleSubmit, watch, formState: { errors, isValid, isDirty } } = form;

  // Debug form state
  console.log('Combo form state:', { isValid, isDirty, errors, price: watch('price'), name: watch('name'), category: watch('category') });

  const comboCategories = watch('comboCategories') as ComboCategory[];

  const onSubmitForm = (data: ComboItemFormValues) => {
    // Debug form validation
    console.log('=== COMBO FORM SUBMISSION DEBUG ===');
    console.log('Form is valid:', isValid);
    console.log('Form errors:', errors);
    console.log('Form data:', data);
    console.log('Combo categories:', data.comboCategories);
    
    if (!isValid) {
      console.log('Form validation failed - not submitting');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before saving.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Transform ComboItemFormValues to MenuItem
      const menuItemData: MenuItem = {
        id: data.id || uuidv4(),
        name: data.name,
        description: data.description,
        price: data.price,
        priceType: 'per_person', // Default for combo items
        category: data.category,
        image: data.image,
        isCombo: true,
        comboCategories: data.comboCategories as ComboCategory[]
      };
      
      console.log('Transformed menu item data:', menuItemData);
      
      if (onSave) {
        onSave(menuItemData);
        toast({
          title: "Success",
          description: "Combo item saved successfully!",
        });
      }
    } catch (error: any) {
      console.error('Error saving combo item:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error saving your combo item.",
        variant: "destructive"
      });
    }
  };

  return {
    form,
    // Return properties from our smaller hooks with consistent naming
    categories: comboCategories,
    newCategoryName,
    newCategoryMaxSelections,
    onNewCategoryNameChange,
    onNewCategoryMaxSelectionsChange,
    onAddCategory: handleAddCategory,
    onRemoveCategory: handleRemoveCategory,
    onAddComboItem: handleAddComboItem,
    onUpdateComboItem: handleUpdateComboItem,
    onRemoveComboItem: handleRemoveComboItem,
    handleImageUpload: handleFileUpload,
    uploadedImage: form.watch('image'),
    uploading,
    onSubmitForm: handleSubmit(onSubmitForm),
    watch,
    isValid,
    errors
  };
}
