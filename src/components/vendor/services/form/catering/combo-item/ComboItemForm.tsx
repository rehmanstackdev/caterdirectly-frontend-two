
import React from 'react';
import { useComboForm } from './hooks/useComboForm';
import { MenuItem } from '@/types/service-types';
import { Form } from '@/components/ui/form';
import ComboBasicInfo from './ComboBasicInfo';
import ComboPricing from './ComboPricing';
import { ComboCategoriesSection } from './ComboCategoriesSection';
import ComboFormActions from './ComboFormActions';

interface ComboItemFormProps {
  menuItem?: MenuItem;
  onSave?: (item: MenuItem) => void;
  onCancel?: () => void;
  categories?: string[];
}

const ComboItemForm: React.FC<ComboItemFormProps> = ({ 
  menuItem, 
  onSave,
  onCancel,
  categories 
}) => {
  const comboForm = useComboForm(menuItem, onSave);
  const {
    form,
    categories: comboCategories,
    newCategoryName,
    newCategoryMaxSelections,
    onNewCategoryNameChange,
    onNewCategoryMaxSelectionsChange,
    onAddCategory,
    onRemoveCategory,
    onAddComboItem,
    onUpdateComboItem,
    onRemoveComboItem,
    handleImageUpload, // This is a function that takes a single File
    uploadedImage,
    uploading,
    onSubmitForm,
    errors,
    isValid,
  } = comboForm;

  // Debug logging
  console.log('ComboItemForm render - isValid:', isValid, 'errors:', errors);

  return (
    <Form {...form}>
      <form onSubmit={onSubmitForm} className="space-y-6">
        <ComboBasicInfo 
          form={form} 
          handleImageUpload={handleImageUpload} 
          uploadedImage={uploadedImage}
          uploading={uploading}
        />
        
        <ComboPricing 
          form={form}
        />
        
        <ComboCategoriesSection
          form={form}
          categories={comboCategories}
          newCategoryName={newCategoryName}
          newCategoryMaxSelections={newCategoryMaxSelections}
          onNewCategoryNameChange={onNewCategoryNameChange}
          onNewCategoryMaxSelectionsChange={onNewCategoryMaxSelectionsChange}
          onAddCategory={onAddCategory}
          onRemoveCategory={onRemoveCategory}
          onAddComboItem={onAddComboItem}
          onUpdateComboItem={onUpdateComboItem}
          onRemoveComboItem={onRemoveComboItem}
          errors={errors}
        />
        
        <ComboFormActions 
          isValid={isValid} 
          onCancel={onCancel}
          hasRequiredFields={!!(form.watch('name') && form.watch('price') && form.watch('category') && form.watch('comboCategories')?.length > 0)}
        />
      </form>
    </Form>
  );
};

export default ComboItemForm;
