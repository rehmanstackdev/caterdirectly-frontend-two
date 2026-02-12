
import React from 'react';
import { ServiceItem } from '@/types/service-types';
import { getFeaturedMenuItems } from '@/utils/service-utils';

interface MenuHighlightsProps {
  service: ServiceItem;
}

const MenuHighlights: React.FC<MenuHighlightsProps> = ({ service }) => {
  if (service.type !== 'catering') return null;
  
  const featuredMenuItems = getFeaturedMenuItems(service.service_details, 2);
  if (featuredMenuItems.length === 0) return null;
  
  return (
    <div className="mt-3 pt-2 border-t">
      <h4 className="text-xs font-medium text-gray-500 mb-1">MENU HIGHLIGHTS:</h4>
      {featuredMenuItems.map((item, idx) => (
        <div key={idx} className="flex justify-between text-sm">
          <span className="truncate flex-1">{item.name}</span>
          <span className="ml-2">${typeof item.price === 'number' ? item.price.toFixed(2) : parseFloat(item.price || '0').toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

export default MenuHighlights;
