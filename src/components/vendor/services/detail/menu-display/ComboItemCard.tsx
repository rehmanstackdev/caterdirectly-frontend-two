
import React from 'react';
import { MenuItem } from '@/types/service-types';
import { Badge } from '@/components/ui/badge';
import { ListFilter } from 'lucide-react';
import ServiceImage from '@/components/shared/ServiceImage';
import { Accordion } from '@/components/ui/accordion';
import ComboCategory from './ComboCategory';
import ItemFlags from './ItemFlags';
import { isValidImageUrl } from '@/hooks/events/utils/image';
import { safeStringValue, extractImageUrl, ensureStringId, debugDataStructure } from '@/utils/data-transform';

interface ComboItemCardProps {
  item: MenuItem;
  formatPrice: (price: number | string) => string;
  openCategories: string[];
  onAccordionChange: (value: string[]) => void;
}

// Debug the incoming item data to understand structure
const logItemData = (item: MenuItem) => {
  debugDataStructure(item, `ComboItemCard - Item Data`);
  debugDataStructure(item.name, `ComboItemCard - Item Name`);
  debugDataStructure(item.description, `ComboItemCard - Item Description`);
  debugDataStructure(item.image, `ComboItemCard - Item Image`);
  if (item.comboCategories) {
    debugDataStructure(item.comboCategories, `ComboItemCard - Combo Categories`);
  }
};

const ComboItemCard: React.FC<ComboItemCardProps> = ({ 
  item, 
  formatPrice,
  openCategories,
  onAccordionChange
}) => {
  // Debug the incoming data structure
  logItemData(item);
  
  // Debug price data specifically
  const comboPrice = item.pricePerPerson || item.price || 0;
  console.log('[ComboItemCard] Price Debug:', {
    rawPrice: item.price,
    pricePerPerson: item.pricePerPerson,
    finalPrice: comboPrice,
    priceType: typeof comboPrice,
    isNaN: isNaN(Number(comboPrice)),
    formattedPrice: formatPrice(comboPrice)
  });
  
  // Ensure item ID is a string and validate item data
  const itemId = ensureStringId(item.id);
  const itemName = safeStringValue(item.name, 'Unnamed Item');
  const itemDescription = safeStringValue(item.description, '');
  
  // Safely extract and validate image URL
  const extractedImageUrl = extractImageUrl(item.image);
  const hasValidImage = extractedImageUrl && isValidImageUrl(extractedImageUrl);
  
  console.log(`[ComboItemCard] Item ${itemId}: "${itemName}", has image: ${!!item.image}, image type: ${typeof item.image}, valid image: ${hasValidImage}, extracted URL: ${extractedImageUrl || 'none'}`);

  // Ensure accordion categories have valid string IDs and validate data
  const validCategories = (item.comboCategories || []).filter(category => {
    if (!category || typeof category !== 'object') {
      console.warn('[ComboItemCard] Invalid category found:', category);
      return false;
    }
    
    const categoryId = ensureStringId(category.id);
    const isValid = categoryId !== 'unknown' && categoryId !== 'object-fallback';
    
    if (!isValid) {
      console.warn('[ComboItemCard] Category with invalid ID filtered out:', category);
    }
    
    return isValid;
  });

  // Ensure openCategories contains only valid string values
  const validOpenCategories = (openCategories || []).filter(id => typeof id === 'string' && id.length > 0);

  console.log(`[ComboItemCard] Item ${itemId} has ${validCategories.length} valid categories, accordion state: [${validOpenCategories.join(', ')}]`);

  return (
    <div className="p-3 bg-gray-50 rounded-md">
      <div className="flex flex-col">
        <div className="flex flex-col sm:flex-row mb-2">
          {hasValidImage && (
            <div className="w-full sm:w-20 h-28 sm:h-28 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0">
              <ServiceImage
                src={extractedImageUrl}
                alt={itemName}
                className="w-full h-full object-cover rounded-md"
                aspectRatio="aspect-square"
                imageId={`combo-item-${itemId}`}
                showLoadingPlaceholder={true}
                retryOnError={true}
              />
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between w-full">
            <div className="mb-2 sm:mb-0">
              <div className="flex flex-wrap items-center">
                <h4 className="font-medium break-words mr-2">{itemName}</h4>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  <ListFilter className="h-3 w-3 mr-1" />
                  Combo
                </Badge>
              </div>
              {itemDescription && (
                <p className="text-sm text-gray-600 mt-1 break-words">{itemDescription}</p>
              )}
              <ItemFlags dietaryFlags={item.dietaryFlags} allergenFlags={item.allergenFlags} />
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <span className="font-semibold">{formatPrice(comboPrice)}</span>
              <div className="text-xs text-gray-500">
                {item.priceType === 'per_person' ? 'per person' : 'flat rate'}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Combo Categories Accordion */}
        {validCategories.length > 0 && (
          <div className="mt-2 border-t pt-2">
            <Accordion 
              type="multiple" 
              className="w-full" 
              value={validOpenCategories}
              onValueChange={onAccordionChange}
            >
              {validCategories.map((category) => {
                const categoryId = ensureStringId(category.id);
                return (
                  <ComboCategory 
                    key={categoryId}
                    category={category}
                    formatPrice={formatPrice}
                  />
                );
              })}
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboItemCard;
