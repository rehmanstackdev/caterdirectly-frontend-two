
import React from 'react';
import { MenuItem } from '@/types/service-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Tag, Award, ListFilter } from 'lucide-react';
import ServiceImage from '@/components/shared/ServiceImage';
import { Badge } from '@/components/ui/badge';

interface MenuItemsListProps {
  menuItems: MenuItem[];
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

const MenuItemsList: React.FC<MenuItemsListProps> = ({ menuItems, onEdit, onDelete }) => {
  // Group menu items by category
  const groupedItems = React.useMemo(() => {
    const grouped: Record<string, MenuItem[]> = {};
    
    menuItems.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  }, [menuItems]);

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedItems).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-3">{category}</h3>
          <div className="space-y-3">
            {items.map(item => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                   <div className="flex">
                     <div className="w-24 h-28 sm:h-24 flex-shrink-0">
                       {item.image ? (
                         <ServiceImage 
                           src={item.image}
                           alt={item.name}
                           className="w-full h-full object-cover rounded-l-md"
                           showLoadingPlaceholder={true}
                           onError={() => console.log(`Failed to load image for ${item.name}:`, item.image)}
                           retryOnError={true}
                         />
                       ) : (
                         <div className="w-full h-full bg-gray-100 flex items-center justify-center border rounded-l-md">
                           <span className="text-xs text-gray-400 text-center">No image</span>
                         </div>
                       )}
                     </div>
                    <div className="p-4 flex justify-between items-center w-full">
                      <div className="flex-1">
                        <div className="flex items-center flex-wrap gap-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {item.isPopular && (
                            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Award className="h-3 w-3 mr-1" />
                              Popular
                            </span>
                          )}
                          {item.isCombo && (
                            <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-600 border-blue-200">
                              <ListFilter className="h-3 w-3 mr-1" />
                              Combo
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                        
                        {/* Display combo details if this is a combo item */}
                        {item.isCombo && item.comboCategories && item.comboCategories.length > 0 && (
                          <div className="mt-1">
                            <p className="text-xs text-gray-500">
                              {item.comboCategories.length} categories with selection options
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.comboCategories.map((cat, index) => (
                                <Badge key={`${item.id}-combo-${cat.id || index}`} variant="secondary" className="text-xs">
                                  {cat.name} (select {cat.maxSelections})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Display dietary flags for non-combo items */}
                        {!item.isCombo && item.dietaryFlags && item.dietaryFlags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.dietaryFlags.map((flag, index) => (
                              <span key={`${item.id}-dietary-${flag}-${index}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                <Tag className="h-3 w-3 mr-1" />
                                {flag.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(item.price)}</div>
                        <div className="text-xs text-gray-500">
                          {item.priceType === 'per_person' ? 'per person' : 'flat rate'}
                        </div>
                        <div className="mt-2 flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            onClick={() => onDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {menuItems.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No menu items added yet.</p>
          <p className="text-sm text-gray-400 mt-1">Click the "Add Menu Item" button to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MenuItemsList;
