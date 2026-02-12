import React from 'react';
import ServiceImage from '@/components/shared/ServiceImage';
import { formatCurrency } from '@/lib/utils';
import CompactQuantityControls from '@/components/ui/CompactQuantityControls';
import { Badge } from '@/components/ui/badge';

interface ComboItemsListProps {
  items: ComboPackage[];
  selectedItems: Record<string, number>;
  onItemQuantityChange: (itemId: string, quantity: number) => void;
}

interface ComboCategoryItem {
  id: string;
  name: string;
  price?: number;
  isPremium?: boolean;
  additionalCharge?: number;
  image?: string;
  selectionKey?: string;
}

interface ComboCategory {
  id: string;
  name: string;
  items?: ComboCategoryItem[];
}

interface ComboPackage {
  id: string;
  name: string;
  description?: string;
  category?: string;
  pricePerPerson?: number;
  price?: number;
  imageUrl?: string;
  comboCategories?: ComboCategory[];
}

const ComboItemsList = ({
  items,
  selectedItems,
  onItemQuantityChange
}: ComboItemsListProps) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No combo packages available
      </div>
    );
  }

  // Get base combo price (should not change based on category selections)
  const getComboBasePrice = (combo: ComboPackage) => {
    return combo.pricePerPerson || combo.price || 0;
  };

  return (
    <div className="space-y-4 w-full max-w-full overflow-x-hidden">
      {items.map((combo) => {
        const quantity = selectedItems[combo.id] || 0;
        const basePrice = getComboBasePrice(combo);

        return (
          <div key={combo.id} className="border rounded-lg p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <div className="flex items-start gap-3 mb-3">
              {/* Combo Image */}
              <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                {combo.imageUrl ? (
                  <ServiceImage 
                    src={combo.imageUrl} 
                    alt={combo.name} 
                    className="w-full h-full object-cover" 
                    showLoadingPlaceholder={false}
                    aspectRatio="aspect-square"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                    <span className="text-orange-600 text-sm font-bold">
                      {combo.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Combo Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-base text-gray-900">{combo.name}</h5>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="font-bold text-lg text-orange-600">
                      {formatCurrency(basePrice)}
                    </div>
                    <div className="text-xs text-gray-500">per person</div>
                  </div>
                </div>
                
                {combo.description && (
                  <p className="text-sm text-gray-600 mb-2">{combo.description}</p>
                )}
                
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 mb-2">
                  {combo.category}
                </Badge>
              </div>
              
              {/* Quantity Controls */}
              <div className="flex-shrink-0">
                <CompactQuantityControls
                  quantity={quantity}
                  onQuantityChange={(qty) => onItemQuantityChange(combo.id, qty)}
                  minQuantity={0}
                />
              </div>
            </div>
            
            {/* Combo Categories and Items */}
            {combo.comboCategories && combo.comboCategories.length > 0 && (
              <div className="border-t border-orange-200 pt-3">
                <h6 className="text-xs font-medium text-gray-700 mb-2">Package Includes:</h6>
                <div className="space-y-2">
                  {combo.comboCategories.map((category) => (
                    <div key={category.id} className="bg-white rounded-md p-2 border border-orange-100">
                      <div className="text-xs font-medium text-gray-800 mb-1">
                        {category.name}
                      </div>
                      <div className="space-y-2">
                        {category.items?.map((item) => {
                          const itemId = item.selectionKey || `${combo.id}_${category.id}_${item.id}`;
                          const itemQuantity = selectedItems[itemId] || 0;
                          const itemPrice = item.price || 0;
                         // const totalPrice = itemPrice + (item.isPremium && item.additionalCharge ? item.additionalCharge : 0);
                         const totalPrice = itemPrice || 0;
                          return (
                            <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded px-2 py-2">
                              <div className="flex items-center gap-2 flex-1">
                                {item.image && (
                                  <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                                    <ServiceImage
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                      showLoadingPlaceholder={false}
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700 font-medium">{item.name}</span>
                                    {item.isPremium && (
                                      <Badge variant="default" className="bg-purple-600 text-white text-xs py-0 px-1.5 h-5">
                                        Premium
                                      </Badge>
                                    )}
                                  </div>
                                  {totalPrice > 0 && (
                                    <div className="text-xs text-green-600 font-semibold">
                                      {formatCurrency(totalPrice)}
                                      {item.isPremium && item.additionalCharge > 0 && (
                                        <span className="text-gray-500 ml-1">(+{formatCurrency(item.additionalCharge)})</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Quantity Controls for Category Items */}
                              <CompactQuantityControls
                                quantity={itemQuantity}
                                onQuantityChange={(qty) => onItemQuantityChange(itemId, qty)}
                                minQuantity={0}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ComboItemsList;
