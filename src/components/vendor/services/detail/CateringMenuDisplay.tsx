
import React, { useState } from 'react';
import { MenuItem } from '@/types/service-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategorySection } from './menu-display';

interface CateringMenuDisplayProps {
  menuItems: MenuItem[];
}

const CateringMenuDisplay: React.FC<CateringMenuDisplayProps> = ({ menuItems }) => {
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  
  const groupedItems = React.useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    
    if (!Array.isArray(menuItems)) {
      return grouped;
    }
    
    menuItems.forEach(item => {
      if (!item) return;
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  }, [menuItems]);

  // Track which accordion items are open to optimize image loading
  const handleAccordionChange = (value: string[]) => {
    setOpenCategories(value);
    console.log('[CateringMenuDisplay] Open categories:', value);
  };

  if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
    return null;
  }

  // Format currency
  const formatPrice = (price: number | string) => {
    console.log('[CateringMenuDisplay] formatPrice called with:', {
      rawPrice: price,
      priceType: typeof price,
      priceValue: price
    });
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    console.log('[CateringMenuDisplay] formatPrice conversion:', {
      numPrice: numPrice,
      isNaN: isNaN(numPrice),
      isFinite: isFinite(numPrice)
    });
    
    // Handle invalid prices
    if (isNaN(numPrice) || !isFinite(numPrice)) {
      console.warn('[CateringMenuDisplay] Invalid price detected:', price, 'returning $0.00');
      return '$0.00';
    }
    
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numPrice);
    
    console.log('[CateringMenuDisplay] formatPrice result:', formatted);
    return formatted;
  };

  return (
    <Card className="w-full max-w-full overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base sm:text-lg break-words">Menu Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 overflow-x-hidden max-w-full">
        {Object.entries(groupedItems).map(([category, items]) => (
          <CategorySection
            key={category}
            category={category}
            items={items}
            formatPrice={formatPrice}
            openCategories={openCategories}
            onAccordionChange={handleAccordionChange}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default CateringMenuDisplay;
