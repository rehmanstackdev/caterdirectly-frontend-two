
import React from 'react';
import { ComboCategory as ComboCategoryType } from '@/types/service-types';
import { Badge } from '@/components/ui/badge';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useIsMobile } from '@/hooks/use-mobile';
import ComboItemImage from './ComboItemImage';
import ItemFlags from './ItemFlags';
import { safeStringValue, ensureStringId, debugDataStructure } from '@/utils/data-transform';

interface ComboCategoryProps {
  category: ComboCategoryType;
  formatPrice: (price: number | string) => string;
}


const ComboCategory: React.FC<ComboCategoryProps> = ({ category, formatPrice }) => {
  const isMobile = useIsMobile();

  // Ensure category ID is a string and validate category data
  const categoryId = ensureStringId(category.id);
  const categoryName = safeStringValue(category.name, 'Unnamed Category');
  const maxSelections = typeof category.maxSelections === 'number' ? category.maxSelections : 1;

  // Validate and sanitize category items
  const validItems = (category.items || []).filter(item => {
    if (!item || typeof item !== 'object') {
      console.warn('[ComboCategory] Invalid item found:', item);
      return false;
    }
    return true;
  });

  // Log detailed information about each category's items to help debug
  console.log(`[ComboCategory] Category "${categoryName}" (ID: ${categoryId}) has ${validItems.length} valid items.`);
  
  validItems.forEach((item, idx) => {
    const itemId = ensureStringId(item.id);
    const itemName = safeStringValue(item.name, `Item ${idx + 1}`);
    const hasImage = !!item.image;
    const imageType = typeof item.image;
    console.log(`[ComboCategory] Item ${idx}: "${itemName}" (ID: ${itemId}), has image: ${hasImage}, image type: ${imageType}`);
  });

  return (
    <AccordionItem key={categoryId} value={categoryId}>
      <AccordionTrigger className="text-sm py-2">
        <div className="flex items-center">
          <span className="mr-2">View Items</span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-1 gap-3 px-1">
          {validItems.map((comboItem, index) => {
            const itemId = ensureStringId(comboItem.id);
            const itemKey = `${categoryId}-${itemId}-${index}`;
            const itemName = safeStringValue(comboItem.name, `Item ${index + 1}`);
            const itemDescription = safeStringValue(comboItem.description, '');
            
            return (
              <div key={itemKey} className="flex flex-col sm:flex-row items-start p-3 bg-white rounded-md border border-gray-100 shadow-sm hover:shadow transition-shadow">
                <div className={`${isMobile ? 'w-full' : 'w-20'} ${isMobile ? 'h-32' : 'h-20'} ${isMobile ? 'mb-3' : 'mr-3'} flex-shrink-0 overflow-hidden rounded-md`}>
                  <ComboItemImage comboItem={comboItem} index={index} />
                </div>
                
                <div className="flex-grow w-full sm:w-auto">
                  <div className="flex flex-col sm:flex-row sm:justify-between w-full">
                    <div className="space-y-1">
                      <p className="font-medium">{itemName}</p>
                      
                      {itemDescription && (
                        <p className="text-sm text-gray-500">{itemDescription}</p>
                      )}
                      
                      <ItemFlags dietaryFlags={comboItem.dietaryFlags} allergenFlags={comboItem.allergenFlags} />
                    </div>
                    
                    {comboItem.additionalPrice !== undefined && comboItem.additionalPrice !== null && (
                      <Badge variant="outline" className="bg-gray-50 ml-0 mt-2 sm:mt-0 sm:ml-2 self-start">
                        {(() => {
                          console.log('[ComboCategory] Additional Price Debug:', {
                            itemName: itemName,
                            rawAdditionalPrice: comboItem.additionalPrice,
                            additionalPriceType: typeof comboItem.additionalPrice,
                            isNaN: isNaN(Number(comboItem.additionalPrice)),
                            numberConversion: Number(comboItem.additionalPrice),
                            formattedPrice: formatPrice(comboItem.additionalPrice)
                          });
                          return comboItem.additionalPrice > 0 
                            ? `+${formatPrice(comboItem.additionalPrice)}` 
                            : "No additional cost";
                        })()} 
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ComboCategory;
