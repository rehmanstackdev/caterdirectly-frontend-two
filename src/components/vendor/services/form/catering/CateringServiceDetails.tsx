
import React, { useState } from 'react';
import { CateringServiceStyle, DietaryFlag, AllergenFlag, CateringServiceDetails as CateringDetails, MenuItem } from '@/types/service-types';
import { v4 as uuidv4 } from 'uuid';
import { CateringTabs } from './service-details';

interface CateringServiceDetailsProps {
  formData: Partial<CateringDetails>;
  updateFormData: (data: Partial<CateringDetails>) => void;
}

const DEFAULT_MENU_CATEGORIES = [
  'Appetizers',
  'Salads',
  'Main Courses',
  'Side Dishes',
  'Desserts',
  'Beverages',
  'Miscellaneous'
];

const CateringServiceDetails: React.FC<CateringServiceDetailsProps> = ({ formData, updateFormData }) => {
  const [activeTab, setActiveTab] = useState('basics');
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);
  const [menuCategories] = useState<string[]>(DEFAULT_MENU_CATEGORIES);
  const [uploadingMenuImage, setUploadingMenuImage] = useState(false);

  // Menu item handlers
  const handleAddMenuItem = () => {
    setEditingMenuItem(null);
    setShowMenuItemForm(true);
  };

  const handleEditMenuItem = (item: MenuItem) => {
    // Ensure the item has the correct structure for editing
    const editItem = {
      ...item,
      isCombo: item.isCombo || false,
      comboCategories: item.comboCategories || []
    };
    setEditingMenuItem(editItem);
    setShowMenuItemForm(true);
  };

  const handleSaveMenuItem = (item: MenuItem) => {
    console.log('=== SAVING MENU ITEM ===');
    console.log('Item to save:', item);
    console.log('Current formData:', formData);
    
    const currentItems = formData.menuItems || [];
    const currentCombos = formData.combos || [];
    let updatedItems: MenuItem[];
    let updatedCombos: any[];
    
    if (editingMenuItem) {
      console.log('Editing existing item:', editingMenuItem.id);
      if (item.isCombo) {
        console.log('Saving as combo');
        updatedItems = currentItems.filter(existingItem => existingItem.id !== editingMenuItem.id);
        
        const comboData = {
          id: editingMenuItem.id,
          name: item.name,
          description: item.description || '',
          category: item.category || 'miscellaneous',
          pricePerPerson: item.price,
          imageUrl: item.image,
          comboCategories: item.comboCategories || []
        };
        
        console.log('=== COMBO DATA BEING SAVED ===');
        console.log('Combo categories with items:', JSON.stringify(item.comboCategories, null, 2));
        console.log('=== END COMBO DATA ===');
        
        const existingComboIndex = currentCombos.findIndex(combo => combo.id === editingMenuItem.id);
        if (existingComboIndex >= 0) {
          updatedCombos = [...currentCombos];
          updatedCombos[existingComboIndex] = comboData;
        } else {
          updatedCombos = [...currentCombos, comboData];
        }
      } else {
        console.log('Saving as regular menu item');
        updatedCombos = currentCombos.filter(combo => combo.id !== editingMenuItem.id);
        updatedItems = currentItems.map(existingItem => 
          existingItem.id === editingMenuItem.id ? { ...item, id: editingMenuItem.id, isCombo: false } : existingItem
        );
        
        if (!updatedItems.find(menuItem => menuItem.id === editingMenuItem.id)) {
          updatedItems = [...updatedItems, { ...item, id: editingMenuItem.id, isCombo: false }];
        }
      }
    } else {
      console.log('Adding new item');
      if (item.isCombo) {
        console.log('Adding as combo');
        updatedItems = currentItems;
        const comboData = {
          id: item.id || uuidv4(),
          name: item.name,
          description: item.description || '',
          category: item.category || 'miscellaneous',
          pricePerPerson: item.price,
          imageUrl: item.image,
          comboCategories: item.comboCategories || []
        };
        
        console.log('=== NEW COMBO DATA BEING SAVED ===');
        console.log('Combo categories with items:', JSON.stringify(item.comboCategories, null, 2));
        console.log('=== END NEW COMBO DATA ===');
        updatedCombos = [...currentCombos, comboData];
      } else {
        console.log('Adding as regular menu item');
        updatedItems = [...currentItems, { ...item, id: item.id || uuidv4(), isCombo: false }];
        updatedCombos = currentCombos;
      }
    }
    
    const hasComboItems = updatedCombos.length > 0;
    
    console.log('Updated items:', updatedItems);
    console.log('Updated combos:', updatedCombos);
    console.log('Has combo items:', hasComboItems);
    
    const updateData = { 
      menuItems: updatedItems,
      hasCombo: hasComboItems,
      combos: updatedCombos
    };
    
    console.log('Calling updateFormData with:', updateData);
    updateFormData(updateData);
    
    setShowMenuItemForm(false);
    setEditingMenuItem(null);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    const currentItems = formData.menuItems || [];
    const currentCombos = formData.combos || [];
    
    // Remove from both menuItems and combos
    const updatedItems = currentItems.filter(item => item.id !== itemId);
    const updatedCombos = currentCombos.filter(combo => combo.id !== itemId);
    
    // Check if any combos exist
    const hasComboItems = updatedCombos.length > 0;
    
    updateFormData({ 
      menuItems: updatedItems,
      hasCombo: hasComboItems,
      combos: updatedCombos
    });
  };

  const handleCancelMenuItem = () => {
    setShowMenuItemForm(false);
    setEditingMenuItem(null);
  };

  // Menu image handlers
  const handleMenuImageUpload = (file: File) => {
    console.log('Processing menu image:', file.name);
    setUploadingMenuImage(true);
    try {
      const blobUrl = URL.createObjectURL(file);
      handleMenuImageComplete(blobUrl);
    } catch (error) {
      console.error('Menu image processing error:', error);
      setUploadingMenuImage(false);
    }
  };

  const handleMenuImageComplete = (url: string) => {
    console.log('Menu image processed:', url);
    updateFormData({ menuImage: url });
    setUploadingMenuImage(false);
  };

  const handleRemoveMenuImage = () => {
    console.log('Removing menu image');
    const currentImage = formData.menuImage;
    if (currentImage && currentImage.startsWith('blob:')) {
      URL.revokeObjectURL(currentImage);
    }
    updateFormData({ menuImage: undefined });
  };

  return (
    <CateringTabs
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      formData={formData}
      updateFormData={updateFormData}
      editingMenuItem={editingMenuItem}
      setEditingMenuItem={setEditingMenuItem}
      showMenuItemForm={showMenuItemForm}
      setShowMenuItemForm={setShowMenuItemForm}
      menuCategories={menuCategories}
      handleAddMenuItem={handleAddMenuItem}
      handleEditMenuItem={handleEditMenuItem}
      handleSaveMenuItem={handleSaveMenuItem}
      handleDeleteMenuItem={handleDeleteMenuItem}
      handleCancelMenuItem={handleCancelMenuItem}
      uploadingMenuImage={uploadingMenuImage}
      handleMenuImageUpload={handleMenuImageUpload}
      handleMenuImageComplete={handleMenuImageComplete}
      handleRemoveMenuImage={handleRemoveMenuImage}
    />
  );
};

export default CateringServiceDetails;
