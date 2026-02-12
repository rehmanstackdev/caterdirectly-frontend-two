
import React from "react";
import { formatCurrency } from "@/lib/utils";

interface SelectedItemsBreakdownProps {
  bookableItems: any[];
  selectedItems: Record<string, number>;
  serviceType?: string;
  serviceId?: string;
}

const SelectedItemsBreakdown = ({
  bookableItems,
  selectedItems,
  serviceType,
  serviceId
}: SelectedItemsBreakdownProps) => {
  return (
    <div className="ml-4 space-y-1 w-full overflow-x-hidden">
      {Object.entries(selectedItems).map(([itemId, quantity]) => {
        if (quantity <= 0 || itemId.endsWith('_duration')) return null;
        
        // Check if this is a combo category item (format: comboId_categoryId_itemId)
        if (itemId.includes('_') && itemId.split('_').length >= 3) {
          const parts = itemId.split('_');
          const comboId = parts[0];
          const categoryId = parts[1];
          const actualItemId = parts[2];
          
          // Find the combo and category to get the actual item details
          let categoryItem = null;
          let categoryName = "Category";
          
          // Look for the combo in bookable items
          const combo = bookableItems.find(item => 
            (item.id === comboId || item.itemId === comboId) && 
            (item.comboCategories || item.isCombo)
          );
          
          if (combo && combo.comboCategories) {
            const category = combo.comboCategories.find((cat: any) => 
              cat.id === categoryId || cat.categoryId === categoryId
            );
            
            if (category) {
              categoryName = category.name || category.categoryName || "Category";
              
              if (category.items) {
                categoryItem = category.items.find((item: any) => 
                  item.id === actualItemId || item.itemId === actualItemId
                );
              }
            }
          }
          
          if (categoryItem) {
            const itemPrice = parseFloat(String(categoryItem.price || 0));
            const totalPrice = itemPrice * quantity;
            const itemName = categoryItem.name || categoryItem.itemName || actualItemId;
            
            return (
              <div key={itemId} className="flex justify-between text-sm gap-3 w-full overflow-x-hidden">
                <span className="text-gray-600 flex-1 min-w-0 max-w-[calc(100%-130px)] break-words overflow-hidden">
                  <span className="block truncate max-w-full">
                    {itemName} (from {combo?.name || 'Combo'}) × {quantity}
                  </span>
                </span>
                <span className="text-gray-600 flex-shrink-0 whitespace-nowrap min-w-[110px] sm:min-w-[130px] text-right pr-2">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            );
          }
          return null;
        }
        
        let item = bookableItems.find((item) => 
          item.id === itemId || item.itemId === itemId || item.name === itemId || item.title === itemId
        );

        // If not found and serviceId prefix is used, try stripping the prefix
        if (!item && serviceId && itemId.startsWith(serviceId + '_')) {
          const actualId = itemId.slice((serviceId + '_').length);
          item = bookableItems.find((it) => 
            it.id === actualId || it.itemId === actualId || it.name === actualId || it.title === actualId
          );
        }
        if (!item) return null;
        
        // Handle combo items with pricePerPerson field
        const price = item.pricePerPerson || item.price;
        const itemPrice = typeof price === 'string' 
          ? parseFloat(price.replace(/[^0-9.-]/g, '')) || 0
          : Number(price) || 0;
        
        const isCombo = item.comboCategories && item.comboCategories.length > 0;
        
        // Support both direct and prefixed duration keys
        const directDuration = selectedItems[`${itemId}_duration`] || 0;
        const prefixedDuration = serviceId ? selectedItems[`${serviceId}_${itemId}_duration`] || selectedItems[`${serviceId}_${(item?.id || item?.itemId || item?.name || item?.title)}_duration`] || 0 : 0;
        const duration = directDuration || prefixedDuration;
        const isStaff = (serviceType || '').toLowerCase() === 'staff';
        const totalPrice = isStaff
          ? itemPrice * quantity * (duration > 0 ? duration : 1)
          : itemPrice * quantity;
        
        const itemName = item.name || item.title || String(itemId);
        const displayName = isCombo ? `${itemName} (Combo)` : itemName;
        
        return (
          <div key={itemId} className="flex justify-between text-sm gap-3 w-full overflow-x-hidden">
            <span className="text-gray-600 flex-1 min-w-0 max-w-[calc(100%-130px)] break-words overflow-hidden">
              <span className="block truncate max-w-full">
                {displayName} × {quantity}{isStaff && duration > 0 ? ` @ ${duration} hrs each` : ''}
              </span>
            </span>
            <span className="text-gray-600 flex-shrink-0 whitespace-nowrap min-w-[110px] sm:min-w-[130px] text-right pr-2">
              {formatCurrency(totalPrice)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SelectedItemsBreakdown;
