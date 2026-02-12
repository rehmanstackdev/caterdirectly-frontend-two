
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus } from 'lucide-react';
import { MenuItem } from '@/types/service-types';
import ServiceImage from '@/components/shared/ServiceImage';
import { formatCurrency } from '@/lib/utils';
import StaffServiceItem from './StaffServiceItem';

import { processServiceItems, processServiceItem, isComboItem } from '@/utils/service-item-processor';
import { ProcessedServiceItem } from '@/types/processed-item';
import { ensureStringId } from '@/utils/data-transform';
import CompactQuantityControls from '@/components/ui/CompactQuantityControls';
import { extractImageUrl } from '@/utils/data-transform';

interface ServiceItemsListProps {
  serviceType: string;
  items: any[];
  selectedItems: Record<string, number>;
  onItemQuantityChange: (itemId: string, quantity: number) => void;
  onComboSelection?: (comboSelections: ComboSelections) => void;
}

const ServiceItemsList = React.memo(({
  serviceType,
  items,
  selectedItems,
  onItemQuantityChange,
  onComboSelection = () => {}
}: ServiceItemsListProps) => {

  const showQuantity = serviceType !== 'venue';
  
  const handleQuantityChange = (itemId: string, increment: boolean) => {
    const currentQuantity = selectedItems[itemId] || 0;
    const newQuantity = increment 
      ? currentQuantity + 1 
      : Math.max(0, currentQuantity - 1);
    onItemQuantityChange(itemId, newQuantity);
  };

  const handleInputChange = (itemId: string, value: string) => {
    const numValue = parseInt(value) || 0;
    const validatedQuantity = Math.max(0, numValue);
    onItemQuantityChange(itemId, validatedQuantity);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, itemId: string) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const formatPrice = (price: number | string) => {
    if (typeof price === 'string') {
      if (price.includes('$')) {
        return price;
      }
      return formatCurrency(price);
    }
    return formatCurrency(price);
  };

  // Process items using single source of truth
  const processedItems = processServiceItems(items, serviceType);



  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No items available for this service
      </div>
    );
  }

  // Special handling for staff services
  if (serviceType === 'staff') {
    return (
      <div className="space-y-3 w-full max-w-full overflow-x-hidden">
        {processedItems.map((processedItem) => {
            const quantity = selectedItems[processedItem.id] || 0;
            const duration = selectedItems[`${processedItem.id}_duration`] || 0; // Default 0 hours
            
            const handleStaffQuantityChange = (newQuantity: number) => {
              onItemQuantityChange(processedItem.id, newQuantity);
            };
            
            const handleStaffDurationChange = (newDuration: number) => {
              onItemQuantityChange(`${processedItem.id}_duration`, newDuration);
            };

          return (
            <StaffServiceItem
              key={processedItem.id}
              item={processedItem.rawData}
              quantity={quantity}
              duration={duration}
              onQuantityChange={handleStaffQuantityChange}
              onDurationChange={handleStaffDurationChange}
            />
          );
        })}
      </div>
    );
  }

  // Default handling for all other service types
  return (
    <div className="space-y-3 w-full max-w-full overflow-x-hidden">
      {processedItems.map((processedItem) => {
        const quantity = selectedItems[processedItem.id] || 0;

        return (
          <div key={processedItem.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg w-full max-w-full overflow-x-hidden">
            {/* Always show image container with placeholder if no image */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
              {processedItem.image ? (
                <ServiceImage
                  src={processedItem.image}
                  alt={processedItem.name}
                  className="w-full h-full object-cover"
                  showLoadingPlaceholder={false}
                  aspectRatio="aspect-square"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 text-xs font-bold">
                    {processedItem.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <h4 className="font-medium text-sm truncate">{processedItem.name}</h4>
              <p className="text-xs text-gray-500 truncate">
                {processedItem.priceDisplay}
                {processedItem.minQuantity > 1 && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">
                    Min {processedItem.minQuantity}
                  </span>
                )}
              </p>
              {processedItem.description && (
                <p className="text-xs text-gray-600 truncate mt-1">{processedItem.description}</p>
              )}
            </div>

            {showQuantity && (
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <CompactQuantityControls
                  quantity={quantity}
                  onQuantityChange={(qty) => onItemQuantityChange(processedItem.id, qty)}
                  minQuantity={processedItem.minQuantity}
                />
              </div>
            )}

            {!showQuantity && (
              <div className="text-xs text-gray-500 flex-shrink-0">
                {serviceType === 'venue' ? 'Available' : 'Select'}
              </div>
            )}
          </div>
        );
      })}


    </div>
  );
});

ServiceItemsList.displayName = 'ServiceItemsList';

export default ServiceItemsList;
