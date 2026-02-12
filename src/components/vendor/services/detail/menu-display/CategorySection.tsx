
import React from 'react';
import { MenuItem } from '@/types/service-types';
import MenuItemCard from './MenuItemCard';
import ComboItemCard from './ComboItemCard';

interface CategorySectionProps {
  category: string;
  items: MenuItem[];
  formatPrice: (price: number | string) => string;
  openCategories: string[];
  onAccordionChange: (value: string[]) => void;
}

// Enhanced utility function to ensure ID is a string for React keys
const ensureStringId = (id: any, index: number): string => {
  if (!id) {
    return `item-${index}`;
  }
  
  if (typeof id === 'string') {
    return id;
  }
  
  if (typeof id === 'number') {
    return String(id);
  }
  
  if (id && typeof id === 'object') {
    // Try common object properties
    if (id.id && typeof id.id === 'string') {
      return id.id;
    }
    if (id._id && typeof id._id === 'string') {
      return id._id;
    }
    if (id.uuid && typeof id.uuid === 'string') {
      return id.uuid;
    }
    // Convert object to string as fallback with index for uniqueness
    try {
      return `item-object-${index}-${JSON.stringify(id).slice(0, 20)}`;
    } catch {
      return `item-object-${index}`;
    }
  }
  
  return `item-${index}`;
};

// Utility to safely get string values from potentially object data
const safeStringValue = (value: any, fallback: string = ''): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return String(value);
  }
  if (value && typeof value === 'object' && value.toString) {
    return value.toString();
  }
  return fallback;
};

const CategorySection: React.FC<CategorySectionProps> = ({ 
  category, 
  items, 
  formatPrice,
  openCategories,
  onAccordionChange
}) => {
  // Validate and sanitize input data
  const categoryName = safeStringValue(category, 'Unnamed Category');
  const validItems = (items || []).filter(item => {
    if (!item || typeof item !== 'object') {
      console.warn('[CategorySection] Invalid item found:', item);
      return false;
    }
    return true;
  });

  console.log(`[CategorySection] Category "${categoryName}" has ${validItems.length} valid items`);

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900">{categoryName}</h3>
      <div className="space-y-3">
        {validItems.map((item, index) => {
          const itemKey = ensureStringId(item.id, index);
          const isCombo = Boolean(item.isCombo);
          
          console.log(`[CategorySection] Rendering ${isCombo ? 'combo' : 'regular'} item with key: ${itemKey}`);
          
          return isCombo ? (
            <ComboItemCard 
              key={itemKey}
              item={item} 
              formatPrice={formatPrice}
              openCategories={openCategories}
              onAccordionChange={onAccordionChange}
            />
          ) : (
            <MenuItemCard 
              key={itemKey}
              item={item} 
              formatPrice={formatPrice}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CategorySection;
