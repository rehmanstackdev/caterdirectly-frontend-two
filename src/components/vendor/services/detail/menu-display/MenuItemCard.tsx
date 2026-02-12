
import React from 'react';
import { MenuItem } from '@/types/service-types';
import { Tag, Award } from 'lucide-react';
import ServiceImage from '@/components/shared/ServiceImage';

interface MenuItemCardProps {
  item: MenuItem;
  formatPrice: (price: number | string) => string;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, formatPrice }) => {
  // Render dietary and allergen flags
  const renderFlags = (dietaryFlags?: string[], allergenFlags?: string[]) => {
    if (!dietaryFlags?.length && !allergenFlags?.length) return null;
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {dietaryFlags && dietaryFlags.map(flag => (
          <span key={flag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <Tag className="h-3 w-3 mr-1" />
            {flag.replace('_', ' ')}
          </span>
        ))}
        {allergenFlags && allergenFlags.map(flag => (
          <span key={flag} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
            <Tag className="h-3 w-3 mr-1" />
            {flag.replace('_', ' ')}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="p-3 bg-gray-50 rounded-md">
      <div className="flex flex-col sm:flex-row">
        {(item.imageUrl || item.image) && (
          <div className="w-full sm:w-20 h-28 sm:h-28 mb-2 sm:mb-0 sm:mr-3 flex-shrink-0">
            <img
              src={item.imageUrl || item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between w-full">
          <div className="mb-2 sm:mb-0">
            <div className="flex flex-wrap items-center">
              <h4 className="font-medium break-words mr-2">{item.name}</h4>
              {item.isPopular && (
                <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  <Award className="h-3 w-3 mr-1" />
                  Popular
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-600 mt-1 break-words">{item.description}</p>
            )}
            
            {renderFlags(item.dietaryFlags, item.allergenFlags)}
          </div>
          <div className="text-left sm:text-right mt-2 sm:mt-0">
            <span className="font-semibold">{formatPrice(item.price)}</span>
            <div className="text-xs text-gray-500">
              {item.priceType === 'per_person' ? 'per person' : 'flat rate'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
